const { request } = require('@octokit/request');
const objectPath = require('object-path');

const isPresent = (collection, toCheck) => (collection && collection.length > 0 ? toCheck() : true);

const conditionChecker = (conditions = [], payload) =>
    conditions.every(({ contains, notContains, type }) => {
        const data = objectPath.get(payload, type);
        if (Array.isArray(data)) {
            return data.some((value) =>
                Object.values(value).find(
                    (val) => isPresent(contains, () => contains.includes(val)) && isPresent(notContains, () => !notContains.includes(val))
                )
            );
        }

        if (typeof data === 'string') {
            return (
                isPresent(contains, () => contains.find((val) => data.match(new RegExp(val, 'g')))) &&
                isPresent(notContains, () => !notContains.find((val) => data.match(new RegExp(val, 'g'))))
            );
        }

        return isPresent(contains, () => contains.includes(data)) && isPresent(notContains, () => !notContains.includes(data));
    });

const getRules = async ({ sender, repository, action, ...rest }, type) => {
    const {
        data: { content },
    } = await request(`GET /repos/${repository.full_name}/contents/.ct.config.json`, {
        headers: {
            authorization: 'bearer ' + process.env.BOT_TOKEN,
        },
    });

    const { mainteners, rules } = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    let allowedRules = [];
    if (mainteners.includes(sender.login)) {
        allowedRules = Object.entries(rules).map(([key, rule]) => ({
            [key]: rule
                .filter(({ events }) =>
                    events.some((event) => event.type === type && event.actions.includes(action) && conditionChecker(event.conditions, rest))
                )
                .map(({ actions }) => actions),
        }));
    }

    return [allowedRules.length > 0, allowedRules];
};

module.exports = async ({ payload, name }) => {
    const [isPossible, rules] = await getRules(payload, name);
    if (isPossible) {
        for (let i = 0; i < rules.length; i++) {
            console.log(rules[i], 'this is enabled!');
        }
    }
};
