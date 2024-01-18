const {listenForAnswer, SendMessage, addKnowledgeBase, createServiceRecord} = require('../api')
const {getChatUid, setChatUid} = require('../mapper')
const {summery, questionClassification} = require('../ai/api')

class Logic {

    async messagesChannel({event, context, client, say, message}) {
        try {

            // check if it's relevant question
            if (message.subtype === 'message_deleted' || !message.text){
                return
            }

            const botMentioned = message.text.includes(`<@${context.botUserId}>`);

            if (botMentioned || !message.subtype || message.subtype !== 'bot_message') {

                let isRelevant;
                if (!botMentioned) {
                    const classificationRes = await questionClassification(event.text)
                    isRelevant = JSON.parse(classificationRes);
                }


                if (botMentioned || isRelevant) {

                    const thread = await client.conversations.replies({
                        channel: message.channel,
                        ts: message.ts,
                    });

                    // Respond to the user in the thread
                    const tempMessage = await client.chat.postMessage({
                        token: process.env.BOT_TOKEN,
                        channel: event.channel,
                        thread_ts: thread.messages[0].ts,
                        text: `Generating an answer :loading-2dots:`,
                    });

                    const text = event.text

                    const res = await SendMessage({
                        text,
                        chatuid: getChatUid(event.channel)
                    })

                    setChatUid(event.channel, res.chatuid)
                    const answer = await listenForAnswer(res.sid)

                    await client.chat.delete({
                        channel: event.channel,
                        ts: tempMessage.ts,
                    });

                    await say({
                        blocks: [
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `${answer}`
                                },
                            },
                            {
                                "type": "actions",
                                "elements": [
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Create Service Record"
                                        },
                                        "action_id": "create_service_record_button"
                                    },
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": ":thumbsup:"
                                        },
                                        "action_id": "thumbs_up_button"
                                    }
                                ]
                            }
                        ],
                        channel: event.channel,
                        thread_ts: thread.messages[0].ts
                    });
                }

            } } catch (error) {
            console.error(error);
        }
    }

    async appMentioned({event, context, client, say}) {
        try {
            const tempMessage = await client.chat.postMessage({
                token: process.env.BOT_TOKEN,
                channel: event.channel,
                user: event.user,
                text: `Generating an answer :loading-2dots:`
            });
            const text = event.text

            const res = await SendMessage({
                text,
                chatuid: getChatUid(event.channel)
            })

            setChatUid(event.channel, res.chatuid)
            const answer = await listenForAnswer(res.sid)

            await client.chat.delete({
                channel: event.channel,
                ts: tempMessage.ts,
            });

            await say({
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `${answer}`
                        },
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Create Service Record"
                                },
                                "action_id": "create_service_record_button"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": ":thumbsup:"
                                },
                                "action_id": "thumbs_up_button"
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            console.error(error);
        }
    }

    async memberJoinedChannel({event, client}) {
        try {
            // Do something when a user joins a channel
            console.log(`User ${event.user} joined the channel ${event.channel}`);

            // You can use the client object to send messages or perform other actions
            await client.chat.postMessage({
                channel: event.channel,
                text: `Welcome to the channel, <@${event.user}>!`,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async learn({command, client, say, ack, body}) {
        try {

            await ack()

            const result = await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: 'modal',
                    callback_id: 'submit_summery',
                    title: {
                        type: 'plain_text',
                        text: 'Chat Summery',
                    },
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": "Generating a summery :loading-2dots:"
                            }
                        }
                    ],
                    submit: {
                        type: 'plain_text',
                        text: 'Submit',
                    },
                },
            });

            // Fetch the channel history
            const history = await client.conversations.history({
                channel: command.channel_id,
                include_all_metadata: false
            });

            const historyParsed = history.messages.reverse().reduce((accumulator, currentValue) => {
                accumulator += currentValue.text + ';';
                return accumulator;
            }, '');


            const summeryResponse = await summery(historyParsed)

            try {


                const viewId = result.view.id;

                await client.views.update({
                    view_id: viewId,
                    view: {
                        type: 'modal',
                        callback_id: 'submit_summery',
                        title: {
                            type: 'plain_text',
                            text: 'Chat Summery',
                        },
                        blocks: [
                            {
                                type: 'input',
                                block_id: 'edited_text_block',
                                element: {
                                    type: 'plain_text_input',
                                    action_id: 'edited_text_input',
                                    initial_value: summeryResponse,
                                    multiline: true,
                                },
                                label: {
                                    type: 'plain_text',
                                    text: 'Proposed Summery',
                                },
                            },
                        ],
                        submit: {
                            type: 'plain_text',
                            text: 'Submit',
                        },
                    },
                });


                console.log(result);
            } catch (error) {
                console.error(error);
            }

        } catch (error) {
            console.error(error);
        }
    }

    async createServiceRecord({say, ack, action, client, body, payload}) {
        await ack();

        const { channel: { id: channelId } } = body;
        
        const tempMessage = await client.chat.postMessage({
            token: process.env.BOT_TOKEN,
            channel: channelId,
            thread_ts: body.message.thread_ts,
            text: `Processing :loading-2dots:`,
        });
        const chatuid = getChatUid(channelId);
        const srId = await createServiceRecord(chatuid);

        await client.chat.update({
            token: process.env.BOT_TOKEN,
            ts: tempMessage.ts,
            channel: channelId,
            blocks: [
                {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": `Service record <https://rndeueodhfa01.qa.sysaidit.com/servicePortal/SRview/${srId}|#${srId}> has been successfully created!`,
                    }
                  }
            ]
        });


        //TODO: add a logic that creating the service record
        //TODO: change the button to a link for the newly created service record
    };

    async thumbsUp({say, ack}) {
        ack()
        await say('Thank you for your love and vote up!');
    };

    async submitSummery({ack, body, view, client}) {
        await ack();

        const summeryKB = view.state.values.edited_text_block.edited_text_input.value;


        const thankYouView = {
            type: 'modal',
            callback_id: 'submit_summery', // Ensure this matches the callback_id of your initial view
            title: {
                type: 'plain_text',
                text: 'Collaboration Boost',
            },
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Thanks for sharing! 🚀 Your knowledge is now part of our collaborative journey, boosting teamwork and innovation. 👏*',
                    },
                },
            ],
        };

        const res = await addKnowledgeBase(summeryKB)


        // Update the original view with the thank you message
        await client.views.open({
            trigger_id: body.trigger_id,
            view: thankYouView,
        });


        console.log(res)
    }
}

module.exports = new Logic()