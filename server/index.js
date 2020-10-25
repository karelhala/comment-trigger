const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const { buildConfig } = require('./utils');
const bootstrap = require('./webhooks');
require('dotenv').config();

const config = buildConfig();

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
        },
    })
);
app.use(express.static(join(__dirname, 'build')));
bootstrap(app, config);

app.listen(config.port, '0.0.0.0', () => console.log(`Server listening on port ${config.port}`));
