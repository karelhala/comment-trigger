const fetch = require('node-fetch');
const { createCheckRun, updateCheckRun } = require('../run-check');

module.exports = async ({ repository, issue, pull_request }, { actions, executor, ...data }) => {
    const token = executor ? process.env.TRAVIS_TOKEN : process.env.TRAVIS_TOKEN;
    const [owner, repo] = repository.full_name.split('/');
    const { number } = issue || pull_request || {};
    for (let i = 0; i < actions.length; i++) {
        const { release_type, headers, branch = 'main', tag, params, csvSlug = 'gh', group, repo: circleRepo, ...rest } = actions[i] || {};
        const body = {
            ...(!tag
                ? {
                      branch,
                  }
                : tag),
            parameters: {
                PR_NUMBER: number,
                RELEASE_TYPE: release_type,
                ...params,
            },
            ...rest,
        };

        const circleCiURL = `https://circleci.com/api/v2/project/${csvSlug}/${group || owner}/${circleRepo || repo}/pipeline`;

        const runData = {
            name: 'Circle CI trigger',
            title: 'Running new Circle CI task',
            summary: 'Taks is currently running:',
            description: `
            Running Circle CI task on url ${circleCiURL}
            <details>
            <summary>Using these variabes!</summary>
\`\`\`
release_type: ${release_type}
branch: ${branch}
tag: ${tag}
csvSlug: ${csvSlug}
group: ${group || owner}
repo: ${circleRepo || repo}
headers: ${Object.entries(headers || {})
                .map(([key, val]) => `${key} => ${val}`)
                .join(', ')}
params: ${Object.entries(params || {})
                .map(([key, val]) => `${key} => ${val}`)
                .join(', ')}
\`\`\`
</details>
            `,
        };
        const { id } = await createCheckRun({ repository }, { executor, ...runData, ...data });

        console.log(`Notifyig travis on URL: ${circleCiURL}`);
        console.log(`With data: ${JSON.stringify(body)}`);

        try {
            fetch(circleCiURL, {
                method: 'POST',
                headers: {
                    ...headers,
                    'content-type': 'application/json',
                    'Circle-Token': token,
                },
                body: JSON.stringify(body),
            });
            runData.summary = 'Task succeded';
            updateCheckRun({ repository }, { executor, ...runData, ...data, result: 'success', checkRunId: id });
        } catch (e) {
            console.log(e);
            runData.summary = 'Task failed';
            updateCheckRun({ repository }, { executor, ...runData, ...data, result: 'failure', checkRunId: id });
        }
    }
};
