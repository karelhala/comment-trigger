const { request } = require('@octokit/request');

module.exports = {
    createCheckRun: async ({ repository }, { executor, context, title, summary, description, name }) => {
        // TODO: use executor token
        const token = executor ? process.env.BOT_TOKEN : process.env.BOT_TOKEN;
        const [owner, repo] = repository.full_name.split('/');
        const { data: ref } = await request(`GET /repos/${owner}/${repo}/git/ref/heads/${context || repository.default_branch}`, {
            headers: {
                authorization: 'bearer ' + token,
            },
        });
        const { data: checkRun } = await request(`POST /repos/${owner}/${repo}/check-runs`, {
            headers: {
                authorization: 'bearer ' + process.env.GH_APP_TOKEN,
            },
            name,
            head_sha: ref.object.sha,
            status: 'in_progress',
            output: {
                title,
                summary,
                text: description,
            },
        });
        return checkRun;
    },
    updateCheckRun: async ({ repository }, { title, summary, description, result, checkRunId }) => {
        const [owner, repo] = repository.full_name.split('/');
        await request(`PATCH /repos/${owner}/${repo}/check-runs/${checkRunId}`, {
            headers: {
                authorization: 'bearer ' + process.env.GH_APP_TOKEN,
            },
            conclusion: result,
            output: {
                title,
                summary,
                text: description,
            },
        });
    },
};
