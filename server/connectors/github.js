const { request } = require('@octokit/request');

const eventMapper = {
    comment: ({ repository, issue, pull_request }, { value }) => {
        const [owner, repo] = repository.full_name.split('/');
        const { number } = issue || pull_request || {};
        return [[[`POST /repos/${owner}/${repo}/issues/${number}/comments`, { body: value }]]];
    },
    push: ({ repository }, { value, context }) => {
        const [owner, repo] = repository.full_name.split('/');
        return value.map(({ type, value, isForce }) => [
            [`GET /repos/${owner}/${repo}/git/ref/heads/${context}`],
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
        ]);
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

module.exports = (payload, { executor, actions }) => {
    // TODO: use executor token
    const token = executor ? process.env.BOT_TOKEN : process.env.BOT_TOKEN;
    for (let i = 0; i < actions.length; i++) {
        const bands = eventMapper[actions[i].type] && eventMapper[actions[i].type](payload, actions[i]);
        for (let y = 0; y < bands.length; y++) {
            const events = bands[y];
            let responses = [];
            for (let x = 0; x < events.length; x++) {
                const [url, data] = events[x];
                responses.push(sendRequest(url, data, token, responses));
            }
        }
    }
};
