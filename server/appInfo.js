const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');
const crypto = require('crypto');
const db = require('./db');
const fetch = require('node-fetch');

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
        await db.setTokensForUser(connection, `installation|${params.userName}`, encode(token));
        res.json({});
    },
    refreshAccount: (connection) => async ({ params }, res) => {
        const { access_token } = await (
            await fetch(`https://${process.env.REACT_APP_AUTH_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    client_id: process.env.AUTH_CLIENT_ID,
                    client_secret: process.env.AUTH_CLIENT_SECRET,
                    audience: `https://${process.env.REACT_APP_AUTH_DOMAIN}/api/v2/`,
                    grant_type: 'client_credentials',
                }),
            })
        ).json();
        const { identities, nickname } = await (
            await fetch(`https://${process.env.REACT_APP_AUTH_DOMAIN}/api/v2/users/${params.userName}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${access_token}`,
                },
            })
        ).json();
        const ghConnection = identities.find(({ provider }) => provider === 'github');
        await db.setTokensForUser(connection, nickname, encode(ghConnection.access_token));
        res.json({});
    },
    listEnabledGroups: (connection) => async ({ params }, res) => {
        const { token: oauthToken } = (await db.getTokensForUser(connection, params.userName)) || {};
        const decoded = decode(oauthToken);

        const { data: orgs } = await request(`GET /user/orgs`, {
            headers: {
                authorization: 'bearer ' + decoded,
            },
        });

        res.json(orgs);
    },
    listEnabledRepositoriesForGroup: () => async ({ params }, res) => {
        const { token } = await auth({ type: 'app' });

        const { data: installations } = await request(`GET /app/installations`, {
            headers: {
                authorization: 'bearer ' + token,
            },
        });

        const { id: installationId } = installations.find(({ account: { login } } = { account: {} }) => login === params.groupName) || {};

        const { token: installationToken } = await auth({ type: 'installation', installationId });

        const { data: repositories } = await request(`GET /installation/repositories`, {
            headers: {
                authorization: 'bearer ' + installationToken,
            },
        });
        res.json(repositories);
    },
    listEnabledRepositories: (connection) => async ({ params }, res) => {
        const { token } = (await db.getTokensForUser(connection, `installation|${params.userName}`)) || {};
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
