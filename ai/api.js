const OpenAI  = require('openai');
const { summeryPrompt } = require("./constant")


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
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    }
}
module.exports = new AI()