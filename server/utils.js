module.exports = {
    buildConfig: () => ({
        privateKey: process.env.PRIVATE_KEY,
        webhookProxyUrl: process.env.WEBHOOK_PROXY_URL,
        appId: process.env.APP_ID,
        clientSecret: process.env.WEBHOOK_SECRET || 'development',
        webhooksPath: `/${process.env.WEBHOOK_PATH}` || '',
        port: process.env.PORT || 3000,
    }),
};
