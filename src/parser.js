class channel {
    constructor(opts={}) {
        this.BotEmitter = opts.BotEmitter || null;
        this.data = opts.data || null;
    };

    async randomint(min, max) {
        return Math.random() * (max - min) + min;
    };

    async req_id() {
        return Math.round(await this.randomint(1, 10000000))
    };
    
    async send(message) {
        this.BotEmitter.emit(
            "websocket_send",
            [
                16, 
                160, 
                {
                    "acknowledge": 1, 
                    "exclude_me": 0,
                }, 
                `co.fun.chat.chat.${this.data.name}`, 
                [],          
                {
                    "message_type": 1, 
                    "type": 200, 
                    "text": message
                }
            ],
        );
    };

    async join() {
        this.BotEmitter.emit(
            "websocket_send",
            [
                48, 
                282, 
                {}, 
                "co.fun.chat.invite.accept", 
                [],
                {
                    "chat_name": this.data.name,
                },
            ],
        );
    };

    async getChannelMembers(callback) {
        let users = [];
        const check_next = (response) => {
            if (response.members) {
                for (let index in response.members) {
                    users.push(response.members[index]);
                }
            };
            if (response.next) {
                this.listChannelMemberPartition(check_next, response.next);
            };
            if (!response.next) {
                callback(users);
            }
        };
        this.listChannelMemberPartition(check_next);
    };

    async listChannelMemberPartition(callback, next=null) {
        let req_id = await this.req_id();

        let message = [
            48, 
            req_id, 
            {}, 
            "co.fun.chat.list_members", 
            [], 
            {
                "chat_name": this.data.name
            },
        ];

        if (next) {
            message[5].next = next;
        };

        this.BotEmitter.emit(
            "websocket_send", 
            message
        );

        this.BotEmitter.emit(
            "add_event", 
            req_id, 
            async(response)=>{
                callback(response);
            },
        );
    };
};

module.exports = {
    channel: channel,
};