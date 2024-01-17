const summeryPrompt = `Generate a focused summary of the conversation in a question-answer format, emphasizing relevant information and excluding day-to-day talk. The summary should conclude with a single question and answer on how the problem was fixed, suitable for addition to the knowledge base.

Example Conversation:
User: How can I resolve the connectivity issue with my Wi-Fi?
Support: Have you tried restarting your router?
User: Yes, I did, but the problem persists.
Support: Did you check if other devices are able to connect to the Wi-Fi?
User: No, let me check. Yes, other devices are connecting fine.
Support: Okay, let's try resetting the network settings on your device. Can you do that and see if it helps?
User: I reset the network settings, but it still doesn't work.
Support: Did you try forgetting the Wi-Fi network on your device and then reconnecting to it?
User: That worked! I'm now connected. Thank you!
Support: You're welcome! If you encounter any further issues, feel free to reach out.

Q: How was the user's Wi-Fi connectivity issue resolved?
A: The problem was fixed by having the user forget the Wi-Fi network on their device and then reconnecting.`
const classificationPrompt = `Certainly! Here's a revised prompt to ensure that the language model responds with "false" only when it's not a question:

"Your virtual assistant specializes in classifying questions related to technology. It will respond with 'true' if the input is a tech-related question and 'false' if it's not a question or if the question is not related to technology. Please frame your question accordingly.

For example:

Is Python a programming language? (Answer: true)
Java programming language. (Answer: false)
Are there any IT security policies in place? (Answer: true)
You should return only true or false responses in lowercase letters. Ensure your input is in the form of a question related to technology for accurate classification."`
module.exports = {
    summeryPrompt,
    classificationPrompt
}