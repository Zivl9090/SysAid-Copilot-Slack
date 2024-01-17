const OpenAI  = require('openai');
const { summeryPrompt, classificationPrompt } = require("./constant")


class AI {
    constructor() {
        this.model = new OpenAI({
            apiKey: process.env.OPEN_AI_TOKEN
        });
    }

     summery = async(history) => {

        const completion = await this.model.chat.completions.create({
            messages: [
                { role: "system", content: summeryPrompt },
                { role: "user", content: history}
            ],
            model: "gpt-4",
        });

        return completion.choices[0].message.content;
    }

    questionClassification = async(message) => {

        const completion = await this.model.chat.completions.create({
            messages: [
                { role: "system", content: classificationPrompt },
                { role: "user", content: message}
            ],
            model: "gpt-4",
        });

        return completion.choices[0].message.content;
    }
}
module.exports = new AI()