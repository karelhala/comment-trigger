const fetch = require('node-fetch');

module.exports = async ({ repository, issue, pull_request }, { actions, executor }) => {
    // TODO: use executor token
    const token = executor ? process.env.TRAVIS_TOKEN : process.env.TRAVIS_TOKEN;
    const [owner, repo] = repository.full_name.split('/');
    const { number } = issue || pull_request || {};
    for (let i = 0; i < actions.length; i++) {
        const { release_type, script, env, type = 'com', group, repo: travisRepo, ...rest } = actions[i] || {};
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

        const travisURL = `https://api.travis-ci.${type}/repo/${group || owner}%2F${travisRepo || repo}/requests`;
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
        } catch (e) {
            console.log(e);
        }
    }
};
