const { Webhooks } = require('@octokit/webhooks');
const LRUCache = require('lru-cache');

module.exports = (app, config) => {
    if (config.webhookProxyUrl) {
        const SmeeClient = require('smee-client');
        const smee = new SmeeClient({
            logger: console,
            source: config.webhookProxyUrl,
            target: `http://localhost:${config.port || 3000}`,
        });
        smee.start();
    }

    const webhooks = new Webhooks({
        secret: config.clientSecret,
        auth: {
            cache: new LRUCache({
                max: 15000,
                maxAge: 1000 * 60 * 59,
            }),
            id: config.appId,
            privateKey: config.privateKey,
        },
    });

    webhooks.on('*', ({ id, name, payload }) => {
        console.log(name, 'event received!');
    });

    app.use(webhooks.middleware);
};
