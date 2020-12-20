class channel {
    constructor(opts) {
        this.messageEmitter = opts.messageEmitter || null;
        this.data = opts.data || null;
    };
    
    async send(message) {
        this.messageEmitter.emit("send",
        [16, 160, {"acknowledge": 1, "exclude_me": 0}, `co.fun.chat.chat.${this.data.name}`, [],
                            {"message_type": 1, "type": 200, "text": message}]
        )
    }
};

module.exports = {
    channel: channel,
};