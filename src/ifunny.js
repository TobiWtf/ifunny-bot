const axios = require("axios");

module.exports = class ifunny {
    constructor(config={}) {
        this.api = config.api || "https://api.ifunny.mobi/v4";
        this.bearer = config.bearer || null;
        this.basic = config.basic || null;
    };

    headers(opts={}) {
        return (
            opts.basic ? {
                Authorization: "Basic " + this.basic,
            } : {
                Authorization: "Bearer " + this.bearer,
            }
        );
    };

    async request(opts={}, callback) {
        opts.baseURL = this.api;
        axios(
            opts,
        )
        .then(
            async response => {
                callback(
                    response.data.data
                );
            },
        )
        .catch(
            async err => {
                console.log(err);
                callback(undefined)
            },
        );
    };

    async user_by_nick(nick, callback) {
        this.request(
            {
                url: `/users/by_nick/${nick}`,
                headers: this.headers()
            },
            async response => {
                callback(response);
            },
        );
    };

};