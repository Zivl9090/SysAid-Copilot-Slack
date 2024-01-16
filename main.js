const { appMentioned, memberJoinedChannel, learn, solve, createServiceRecord, thumbsUp, submitSummery } = require('./logic')

const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.BOT_TOKEN,
    appToken: process.env.APP_TOKEN,
    socketMode: true,
});

// Events
app.event('app_mention', appMentioned);

app.event('member_joined_channel', memberJoinedChannel);


// Commands
app.command('/solve', solve);

app.command('/learn', learn);


// Actions
app.action('create_service_record_button', createServiceRecord)

app.action('thumbs_up_button', thumbsUp);

// Views
app.view('submit_summery', submitSummery);


(async () => {
    await app.start();
    console.log('⚡️ Bolt app started');
})();