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
    createNewToken: (db) => async ({ query, params }) => {
        const { data } = await newAuthToken(query.code);
        db.setTokensForUser(params.userName, data.token, data.refresh_token || data.refreshToken);
    },
    listEnabledRepositories: (db) => async ({ params }, res) => {
        // const { token } = (await db.getTokensForUser(params.userName)) || {};
        const {
            data: { installations },
        } = await request(`GET /user/installations`, {
            headers: {
                authorization: `token ${process.env.TEST_TOKEN}`,
            },
        });

        const result = await Promise.all(
            installations.map(async ({ id }) => {
                const {
                    data: { repositories },
                } = await request(`GET /user/installations/${id}/repositories`, {
                    headers: {
                        authorization: `token ${process.env.TEST_TOKEN}`,
                    },
                });
                return repositories;
            })
        );

        res.json(result.flat());
    },
};
