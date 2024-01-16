const axios = require('axios');
const EventSource = require('eventsource');

class Api {
    constructor() {
        this.url = process.env.SYS_AI_URL;
    }

    SendMessage = async ({text, chatuid, stream = true}) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': process.env.SYS_AI_COOKIE,
            },
        };

        try {
            const res = await axios.post(`${this.url}/chat`, { text, chatuid, stream}, config);
            return res.data;
        } catch (err) {
            console.error('POST Error:', err.message);
        }
    }

    listenForAnswer = async (sid) => {
        return new Promise((resolve, reject) => {
            let messages = '';

            const eventSource = new EventSource(`${this.url}/stream/${sid}`);

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

    //TODO - should send post request to sysai server
    createServiceRecord = async () => {
    }

    //TODO - should send post request to sysai server

    addKnowledgeBase = async () => {
        // should send post request to sysai server
    }
}

module.exports = new Api()