const { createAppAuth } = require('@octokit/auth-app');
const { request } = require('@octokit/request');

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

module.exports = {
    createNewToken: (db) => async ({ params, body }, res) => {
        const { token } = await newAuthToken(body.code);
        const cypher = crypto.createCipher('aes-128-cbc', process.env.TOKEN_PWD);
        let encoded = cypher.update(token, 'utf8', 'hex');
        encoded += cypher.final('hex');
        await db.setTokensForUser(params.userName, encoded);
        res.json({});
    },
    listEnabledRepositories: (db) => async ({ params }, res) => {
        const { token } = (await db.getTokensForUser(params.userName)) || {};
        const cypher = crypto.createDecipher('aes-128-cbc', process.env.TOKEN_PWD);
        let decoded = cypher.update(token, 'hex', 'utf8');
        decoded += cypher.final('utf8');
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
