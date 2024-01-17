const { appMentioned, memberJoinedChannel, learn, solve, createServiceRecord, thumbsUp, submitSummery, messagesChannel } = require('./logic')

const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.BOT_TOKEN,
    appToken: process.env.APP_TOKEN,
    socketMode: true,
});

// Events
app.event('member_joined_channel', memberJoinedChannel);


// Commands
app.command('/learn', learn);


// Actions
app.action('create_service_record_button', createServiceRecord)

app.action('thumbs_up_button', thumbsUp);

// Views
app.view('submit_summery', submitSummery);

// Messages
app.message(messagesChannel);


(async () => {
    await app.start();
    console.log('⚡️ Bolt app started');
})();