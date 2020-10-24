const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const { Webhooks } = require('@octokit/webhooks');
const EventSource = require('eventsource');
require('dotenv').config();
const webhookProxyUrl = process.env.WEBHOOK_PROXY_URL;

if (webhookProxyUrl) {
    const source = new EventSource(webhookProxyUrl);
    source.onmessage = (event) => {
        const webhookEvent = JSON.parse(event.data);
        webhooks
            .verifyAndReceive({
                id: webhookEvent['x-request-id'],
                name: webhookEvent['x-github-event'],
                signature: webhookEvent['x-hub-signature'],
                payload: webhookEvent.body,
            })
            .catch(console.error);
    };
}

const webhooks = new Webhooks({
    secret: process.env.CLIENT_SECRET,
});

webhooks.on('*', ({ id, name, payload }) => {
    console.log(name, 'event received!');
});

const app = express();

const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https://dev-8ihcso-1.auth0.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            frameSrc: ["'self'", 'https://dev-8ihcso-1.auth0.com/'],
            fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        },
    })
);
app.use(express.static(join(__dirname, 'build')));
app.use(webhooks.middleware);

app.listen(port, () => console.log(`Server listening on port ${port}`));
