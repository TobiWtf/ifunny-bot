const EventEmitterModule = require('events');
class EventEmitter extends EventEmitterModule {};
const messageEmitter = new EventEmitter();
const commandEmitter = new EventEmitter();
const parser = require("./parser")
const ws = require("ws");

var connection;

class WebsocketClient {
    
    constructor(opts={}) {
        this.reset();
        this.prefix = opts.prefix || "@";
        this.bearer = opts.bearer || null;
        this.uid = opts.uid || null;
        messageEmitter.on("send", async data => connection.send(JSON.stringify(data)))
        messageEmitter.on("reset", async=>this.reset())
        messageEmitter.on("parse", async(data, parsed)=>this.parse(data, parsed || null))
    };

    async parse(rawdata, parsed) {
        this.login(rawdata, parsed);
        this.includes_parsed(rawdata, parsed)
    };

    async message(rawdata, parsed) {

        const once_initialized = async(channel, message) => {
            console.log(message.text);
            if (message.user.id == this.uid) {
                return; // Same userid as client...
            };
            if (!message.text) {
                return;
            };
            if (!message.text.startsWith(this.prefix)) {return};
            const args = message.text.trim().split(/ +/g);
            const cmd = args[0].slice(this.prefix.length).toLowerCase();
            args.shift();
            let ctx = {
                channel: channel,
                args: args,
                command: cmd
            };
            commandEmitter.emit("command", ctx)
        };

        parsed.chats.forEach(chat => {
                let channel = new parser.channel(
                    {
                        messageEmitter: messageEmitter,
                        data: chat
                    }
                );
                let message = chat.last_msg;
                once_initialized(channel, message)
            }
        );

    };

    async includes_parsed(rawdata, parsed) {
        if (!parsed) {
            return;
        };
        if (parsed.type == 100) {
            return this.message(rawdata, parsed);
        }
    }

    async login(rawdata, parsed) {
        if (rawdata.includes("ticket")) {
            messageEmitter.emit("send", [5, this.bearer, {}])
        };
        if (parsed && parsed.authid) {
            messageEmitter.emit("send", [32, 1, {}, `co.fun.chat.user.${this.uid}.chats`]);
            messageEmitter.emit("send", [32, 2, {}, `co.fun.chat.user.${this.uid}.invites`])
        }
    };

    async reset() {
        connection = new ws(`wss://chat.ifunny.co/chat`, ["wamp.json",]),
            connection.onmessage = this._onmessage,
            connection.onerror = this._onerror,
            connection.onopen = this._onopen,
            connection.onclose = this._onclose;
    };

    async _onclose() {
        messageEmitter.emit("reset");
    };

    async _onmessage(message) {
        let data = JSON.parse(message.data);
        let parsed = null;
        if (typeof(data.slice(-1)[0]) == "object") {
            parsed = data.slice(-1)[0];
        };
        messageEmitter.emit("parse", data, parsed)
    };

    async _onerror(error) {
        console.log("Connection ran into an error: " + error.message, "\n\nRestarting bot...");
        messageEmitter.emit("reset");
    };

    async _onopen() {
        console.log("Bot came online!! (If this message shows repeadetly, your credentials are invalid.)");
        messageEmitter.emit("send",[1, "co.fun.chat.ifunny", {"authmethods": ["ticket"], "roles": {"publisher": {}, "subscriber": {}}}]);
    };
}

class client {
    constructor(opts={}) {
        this.bearer = opts.bearer;
        this.uid = opts.uid;
        this.basic = opts.basic || null;
        this.prefix = opts.prefix;
        this.commands = opts.commads || {};
        commandEmitter.on("command", async ctx => this.commands[ctx.command](ctx) || null)
        this.con = new WebsocketClient(
            {
                bearer: this.bearer,
                uid: this.uid
            }
        );
    };
    async command(command_name, callback) {
        this.commands[command_name] = callback;
    };
};

module.exports = client;