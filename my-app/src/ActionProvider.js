class ActionProvider {
    constructor(createChatBotMessage, setStateFunc, createClientMessage) {
        this.createChatBotMessage = createChatBotMessage;
        this.setState = setStateFunc;
        this.createClientMessage = createClientMessage;
    }

    async handleBotMessage(message) {
        const serverResponse = await fetch("http://localhost:8000", {
            method: "POST",
            body: JSON.stringify({ message: message, user: window.$user })
        }).then(res => res.text())
        const newMessage = this.createChatBotMessage(serverResponse);
        this.setChatbotMessage(newMessage)
    }


    setChatbotMessage(message) {
        this.setState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, message]
        }));
    }
}

export default ActionProvider;