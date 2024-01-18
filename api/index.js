const axios = require('axios');
const EventSource = require('eventsource');

class Api {
    constructor() {
        this.url = process.env.SYS_AI_URL;
        this.axiosInst = axios.create({
            baseURL: process.env.SYS_AI_URL,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': process.env.SYS_AI_COOKIE,
            },
        });
    }

    SendMessage = async ({text, chatuid, stream = true}) => {

        try {
            const res = await this.axiosInst.post('/api/chat', { text, chatuid, stream});
            return res.data;
        } catch (err) {
            console.error('POST Error:', err.message);
        }
    }

    listenForAnswer = async (sid) => {
        return new Promise((resolve, reject) => {
            let messages = '';

            const eventSource = new EventSource(`${this.url}/api/stream/${sid}`);

            eventSource.onmessage = event => {
                const message = JSON.parse(event.data);
                if (message.finish) {
                    resolve(messages)
                    eventSource.close()
                } else {
                    if (message.text){
                        messages +=(message.text);
                    }
                }
            };

            eventSource.onerror = error => {
                eventSource.close();
                reject(error);
            };

        });
    }

    getSrIdWhenDone = async (operationId) => {
        try {
            const res = await this.axiosInst.get(`/api/longOperation/${operationId}`);
            const { status: opStatus } = res.data;

            if (opStatus === 1) {
                // In progress, check back after 5s
                return new Promise((resolve, reject) => {
                    console.log(`Setting time out, status: ${opStatus}`);
                    setTimeout(async () => {
                        resolve(await this.getSrIdWhenDone(operationId));
                    }, 5000);

                });
            } else if (opStatus === 2) {
                // Finished 
                const { id: srId } = res.data;
                return srId;
            }

        } catch(e) {
            console.error('Failed getting long operation:', e);
        }
        
    }

    //TODO - should send post request to sysai server
    createServiceRecord = async (chatuid) => {
        try {
            const res = await this.axiosInst.put(`/api/sr/${chatuid}`);

            const { longOperationId } = res.data;

            return this.getSrIdWhenDone(longOperationId);

        } catch(e) {
            console.error('Failed creating SR:', e);
        }
    }

    addKnowledgeBase = async (summeryKB) => {
        const kb = {
            text: summeryKB
        }

        try {
            const res = await this.axios.post('/learn', kb);
            return res.data;
        } catch (err) {
            console.error('POST Error:', err.message);
        }
    }
}

module.exports = new Api()