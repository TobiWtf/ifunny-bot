# ifunny-bot

To install use

`npm install ifunny-chat.js`

To make a bot

```js
const client = require("ifunny-chat.js");
const bot = new client(
    {
        bearer: "your_bearer",
        uid: "your_uid",
        prefix: "bots_prefix",
        AutoAcceptInvites: true,
    },
);
```

There are a couple of ways of adding commands

```js

bot.command(
    "help",
    async (ctx) => {
        return ctx.channel.send("Help message...");
    },
);
```

Or

```js


const help = async (ctx) => {
    return ctx.channel.send("Help message...");
};

bot.command("help", help)
```

Or even, using a more outdated method

```js
async function help(ctx) {
    return ctx.channel.send("Help message...");
};

async function onearg(ctx) {
    let arg = args[0];
    return ctx.channel.send(arg);
};

bot.command("help", help);
bot.command("onearg", echo)
```

If you need help, please contact me at tobi@ibot.wtf

Ill push more updates soon.