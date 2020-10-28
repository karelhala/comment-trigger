const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const { buildConfig } = require('./utils');
const bootstrap = require('./webhooks');
const db = require('./db');

require('dotenv').config();
const { listEnabledRepositories, createNewToken } = require('./appInfo');

const config = buildConfig();

db(config).init();

const app = express();

app.use(morgan('dev'));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https://dev-8ihcso-1.auth0.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            frameSrc: ["'self'", 'https://dev-8ihcso-1.auth0.com/'],
            fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
            imgSrc: ["'self'", 'https://dev-8ihcso-1.auth0.com', 'https://avatars0.githubusercontent.com', 'data:'],
        },
    })
);
app.use(express.static(join(__dirname, '../build')));
app.use('/token/:userName', createNewToken(db(config)));
app.use('/enabled/:userName', listEnabledRepositories(db(config)));
bootstrap(app, {
    ...config,
    db: db(config),
});

app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));
