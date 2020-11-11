const { request } = require('@octokit/request');

const getRules = async ({ sender, repository }) => {
    const {
        data: { content },
    } = await request(`GET /repos/${repository.full_name}/contents/.ct.config.json`, {
        headers: {
            authorization: 'bearer ' + process.env.BOT_TOKEN,
        },
    });

    const { mainteners, rules } = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    return [mainteners.includes(sender.login), rules];
};

module.exports = {
    issue_comment: async ({ payload }) => {
        const [isPossible, rules] = await getRules(payload);
        console.log('maybe!', isPossible);
    },
    pull_request: async ({ payload }) => {
        const [isPossible, rules] = await getRules(payload);
        console.log('maybe!', isPossible);
    },
};
