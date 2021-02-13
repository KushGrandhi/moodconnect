class MessageParser {
    constructor(actionProvider, state) {
        this.actionProvider = actionProvider;
        this.state = state;
    }

    parse(message) {
        // console.log(this.state)
        // console.log(this.actionProvider)
        if (this.state.numberOfMessages === 5) {

        } else {
            this.actionProvider.handleBotMessage(message);
            this.numberOfMessages = this.numberOfMessages + 1;
        }
    }
}

export default MessageParser;