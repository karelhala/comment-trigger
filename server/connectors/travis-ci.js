const fetch = require('node-fetch');
const { createCheckRun, updateCheckRun } = require('../run-check');

module.exports = async ({ repository, issue, pull_request }, { actions, executor, ...data }) => {
    // TODO: use executor token
    const token = executor ? process.env.TRAVIS_TOKEN : process.env.TRAVIS_TOKEN;
    const [owner, repo] = repository.full_name.split('/');
    const { number } = issue || pull_request || {};
    for (let i = 0; i < actions.length; i++) {
        const { release_type, script, env, type = 'com', group, repo: travisRepo, ...rest } = actions[i] || {};
        const travisURL = `https://api.travis-ci.${type}/repo/${group || owner}%2F${travisRepo || repo}/requests`;
        const runData = {
            name: 'Travis trigger',
            title: 'Running new travis ',
            summary: 'Taks is currently running:',
            description: `
            Running travis task on url ${travisURL}
            <details>
            <summary>Using these variabes!</summary>
\`\`\`
release_type: ${release_type}
script: ${script}
type: ${type}
group: ${group || owner}
repo: ${travisRepo || repo}
env: ${Object.entries(env || {})
                .map(([key, val]) => `${key} => ${val}`)
                .join(', ')}
${Object.entries(rest || {})
    .map(([key, val]) => `${key} => ${val}`)
    .join(', ')}
\`\`\`
</details>
            `,
        };
        const { id } = await createCheckRun({ repository }, { executor, ...runData, ...data });
        const body = {
            request: {
                config: {
                    env: {
                        PR_NUMBER: number,
                        RELEASE_TYPE: release_type,
                        ...env,
                    },
                    script: script || 'npm run release:api',
                    ...rest,
                },
            },
        };

        console.log(`Notifyig travis on URL: ${travisURL}`);
        console.log(`With data: ${JSON.stringify(body)}`);
        try {
            fetch(travisURL, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Travis-API-Version': 3,
                    Authorization: `token ${token}`,
                },
            });
            runData.summary = 'Task succeeded';
            updateCheckRun({ repository }, { executor, ...runData, ...data, result: 'success', checkRunId: id });
        } catch (e) {
            console.log(e);
            runData.summary = 'Task failed';
            updateCheckRun({ repository }, { executor, ...runData, ...data, result: 'failure', checkRunId: id });
        }
    }
};
