const { request } = require('@octokit/request');
const { createCheckRun, updateCheckRun } = require('../run-check');

const eventMapper = {
    comment: ({ repository, issue, pull_request }, { value }) => {
        const [owner, repo] = repository.full_name.split('/');
        const { number } = issue || pull_request || {};
        return [
            {
                tasks: [[`POST /repos/${owner}/${repo}/issues/${number}/comments`, { body: value }]],
                name: 'Github comment',
                title: 'Adding new comment',
                summary: 'Taks is currently running:',
                description: `
\`\`\`\`
${value}
`,
            },
        ];
    },
    push: ({ repository }, { value, context }) => {
        const [owner, repo] = repository.full_name.split('/');
        return value.map(({ type, value, isForce }) => ({
            tasks: [
                [`GET /repos/${owner}/${repo}/git/ref/heads/${context || repository.default_branch}`],
                ...(type === 'tag'
                    ? [
                          [`GET /repos/${owner}/${repo}/tags`],
                          [
                              `POST /repos/${owner}/${repo}/git/tags`,
                              async (prevResponses) => {
                                  const [
                                      {
                                          data: {
                                              object: { sha },
                                          },
                                      } = { data: { object: {} } },
                                      { data: tags } = { data: [] },
                                  ] = await Promise.all(prevResponses);
                                  const latest = tags && tags.pop();
                                  const [major, minor] = (latest && latest.name && latest.name.split('.')) || ['v0', 0];
                                  const majorNumber = parseInt(/\D+(\d)/g.exec(major)[1], 10);
                                  return {
                                      object: sha,
                                      type: 'commit',
                                      message: `New automated tag created on ${new Date()}`,
                                      tag: `v${majorNumber + (value === 'major')}.${minor + (value === 'minor')}`,
                                  };
                              },
                          ],
                          [
                              `POST /repos/${owner}/${repo}/git/refs`,
                              async (prevResponses) => {
                                  const newTag = prevResponses.pop();
                                  const {
                                      data: { sha, tag },
                                  } = await Promise.resolve(newTag);
                                  return {
                                      sha,
                                      ref: `refs/tags/${tag}`,
                                  };
                              },
                          ],
                      ]
                    : [
                          [
                              `PATCH /repos/${owner}/${repo}/git/refs/{ref}`,
                              async ([sourceResponse]) => {
                                  const {
                                      data: {
                                          object: { sha },
                                      },
                                  } = await Promise.resolve(sourceResponse);
                                  return {
                                      sha,
                                      ref: `heads/${value}`,
                                      force: !!isForce,
                                  };
                              },
                          ],
                      ]),
            ],
            name: `Github push of ${type === 'tag' ? 'head' : 'branch'}`,
            title: `Pushing to ${type === 'tag' ? `tags/${value}` : `heads/${value}`}`,
            summary: `Taks is currently running:`,
            description: `
| Task | Description |
| ------ | ------ |
| Fetching of main ref | will fetch ref of \`git/ref/heads/${context || repository.default_branch}\` |
${
    type === 'tag'
        ? `
| Fetching all tags | will fetch all tags and use the newest one to calculate new version |
| Creating of tag | will use GH API to create new tag, which will be used later on |
| Pushing of a new tag | will use GH API to push newly created tag in previous step |
`
        : `
| Pushing new ref | new ref has been pushed to branch heads/${value} |
`
}
`,
        }));
    },
};

const sendRequest = async (url, data, token, prevResponses) => {
    const rest = typeof data === 'function' ? await Promise.resolve(data(prevResponses)) : data || {};
    return request(url, {
        headers: {
            authorization: 'bearer ' + token,
        },
        ...rest,
    });
};

module.exports = async (payload, { executor, actions, ...rest }) => {
    // TODO: use executor token
    const token = executor ? process.env.BOT_TOKEN : process.env.BOT_TOKEN;
    for (let i = 0; i < actions.length; i++) {
        const bands = eventMapper[actions[i].type] && eventMapper[actions[i].type](payload, actions[i]);
        for (let y = 0; y < bands.length; y++) {
            const { tasks, ...data } = bands[y] || { tasks: [] };
            const { id } = await createCheckRun(payload, { executor, tasks, ...data, ...rest });
            try {
                let responses = [];
                for (let x = 0; x < tasks.length; x++) {
                    const [url, data] = tasks[x];
                    responses.push(sendRequest(url, data, token, responses));
                }
                data.summary = 'Task finished!';
                updateCheckRun(payload, { executor, tasks, ...data, ...rest, result: 'success', checkRunId: id });
            } catch (e) {
                console.log(e);
                data.summary = 'Task failed!';
                data.description = `Please include this number TODO when you contact creators of this plugin
                You can create new issue on url [gh/karelhala/comment-trigger/issues](https://github.com/karelhala/comment-trigger/issues)
                `;
                updateCheckRun(payload, { executor, tasks, ...data, ...rest, result: 'failure', checkRunId: id });
            }
        }
    }
};
