import { createChatBotMessage } from "react-chatbot-kit";

const config = {
    initialMessages: [createChatBotMessage(`Hello world`)],
    botName: "Akash",
    state: {
        numberOfMessages: 0
    }
}

export default config;