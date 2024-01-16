const {listenForAnswer, SendMessage} = require('../api')
const {getChatUid, setChatUid} = require('../mapper')
const {summery} = require('../ai/api')

class Logic {

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

    async solve({command, ack, client}) {
        await ack('solved!');

        try {
            // Fetch the channel history
            const history = await client.conversations.history({
                channel: command.channel_id,
            });

            // Process the history as needed
            console.log(history);

            // Your logic to solve the issue based on the history
            // You can access the messages using history.messages
            // For example, history.messages[0].text to get the text of the latest message

        } catch (error) {
            console.error(error);
        }
    }

    async createServiceRecord({say, ack}) {
        ack()
        //TODO: add a logic that creating the service record
        //TODO: change the button to a link for the newly created service record
        await say('Initiating the service record creation process...');
    };

    async thumbsUp({say, ack}) {
        ack()
        await say('Thank you for your love and vote up!');
    };

    async submitSummery({ack, body, view, client}) {
        await ack();

        const editedText = view.state.values.edited_text_block.edited_text_input.value;

        // Process the edited text as needed
        console.log('Edited Text:', editedText);

        // You can now update your app's state or send a response to the user
        await client.chat.postMessage({
            channel: body.user.id,
            text: `Text updated: ${editedText}`,
        });
    }
}

module.exports = new Logic()