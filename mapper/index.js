const chatMap = {} // map between chat in slack to chatId in sysAid

// In memory for POC purposes - we should have a long term storage.
function getChatUid(channelId) {
    return chatMap[channelId] ?? ''
}

function setChatUid(channelId, chatUid) {
    chatMap[channelId] = chatUid
}

module.exports = {
    getChatUid,
    setChatUid
}