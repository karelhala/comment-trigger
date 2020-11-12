const { Webhooks } = require('@octokit/webhooks');
const LRUCache = require('lru-cache');
const hooks = require('./hooksDefinition');

module.exports = (app, config) => {
    if (config.webhookProxyUrl) {
        const SmeeClient = require('smee-client');
        const smee = new SmeeClient({
            logger: console,
            source: config.webhookProxyUrl,
            target: `http://localhost:${config.port || 3000}${config.webhooksPath}`,
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

    // Object.entries(hooks).forEach(([key, callback]) => webhooks.on(key, (hook) => callback(hook, app)));

    webhooks.onAny((hook) => hooks(hook, app));

    app.use(config.webhooksPath, webhooks.middleware);
};
