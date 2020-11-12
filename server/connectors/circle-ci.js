const fetch = require('node-fetch');

module.exports = ({ repository, issue, pull_request }, { actions, executor }) => {
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

        console.log(`Notifyig travis on URL: ${circleCiURL}`);
        console.log(`With data: ${JSON.stringify(body)}`);

        fetch(circleCiURL, {
            method: 'POST',
            headers: {
                ...headers,
                'content-type': 'application/json',
                'Circle-Token': token,
            },
            body: JSON.stringify(body),
        });
    }
};
