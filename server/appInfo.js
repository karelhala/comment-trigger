const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');
const crypto = require('crypto');
const db = require('./db');

const algorithm = 'aes-192-cbc';

const auth = createAppAuth({
    id: process.env.APP_ID,
    privateKey: process.env.REACT_APP_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});

const newAuthToken = (code) =>
    auth({
        type: 'oauth',
        code,
    });

const encode = (toEncode) => {
    const iv = crypto.randomBytes(parseInt(process.env.IV_LENGTH, 10));
    const cypher = crypto.createCipheriv(algorithm, crypto.scryptSync(process.env.TOKEN_PWD, 'GfG', 24), iv);
    let encoded = cypher.update(toEncode, 'utf8', 'hex');
    encoded += cypher.final('hex');
    return `${iv.toString('hex')}:${encoded}`;
};

const decode = (toDecode) => {
    const textParts = toDecode.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(process.env.TOKEN_PWD, 'GfG', 24), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = {
    createNewToken: (connection) => async ({ params, body }, res) => {
        const { token } = await newAuthToken(body.code);
        await db.setTokensForUser(connection, params.userName, encode(token));
        res.json({});
    },
    listEnabledRepositories: (connection) => async ({ params }, res) => {
        const { token } = (await db.getTokensForUser(connection, params.userName)) || {};
        const decoded = decode(token);
        try {
            const {
                data: { installations },
            } = await request(`GET /user/installations`, {
                headers: {
                    authorization: `token ${decoded || process.env.TEST_TOKEN}`,
                },
            });

            const result = await Promise.all(
                installations.map(async ({ id }) => {
                    const {
                        data: { repositories },
                    } = await request(`GET /user/installations/${id}/repositories`, {
                        headers: {
                            authorization: `token ${decoded || process.env.TEST_TOKEN}`,
                        },
                    });
                    return repositories;
                })
            );

            res.json(result.flat());
        } catch (e) {
            res.json([]);
        }
    },
};
