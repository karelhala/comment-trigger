import { compoundExpand, cellWidth } from '@patternfly/react-table';

export const connectionMapper = {
    github: {
        title: 'Github',
        columns: [
            {
                title: 'Runner',
                ref: 'executor',
            },
            {
                title: 'Events',
                cellTransforms: [compoundExpand],
                ref: 'events',
                columns: [
                    {
                        title: 'Type',
                        ref: 'type',
                    },
                    {
                        title: 'Actions',
                        ref: 'actions',
                    },
                    {
                        title: 'Conditions',
                        cellTransforms: [compoundExpand],
                        ref: 'conditions',
                        variant: 'compact',
                        noBorders: true,
                        columns: [
                            {
                                title: 'Type',
                                ref: 'type',
                                transforms: [cellWidth(30)],
                            },
                            {
                                title: 'Contains',
                                ref: 'contains',
                            },
                            {
                                title: 'Not contains',
                                ref: 'notContains',
                                transforms: [cellWidth(30)],
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Actions',
                cellTransforms: [compoundExpand],
                ref: 'actions',
                columns: [
                    {
                        title: 'Type',
                        ref: 'type',
                        transforms: [cellWidth(30)],
                    },
                    {
                        title: 'Context',
                        ref: 'context',
                        transforms: [cellWidth(30)],
                    },
                    {
                        title: 'Value',
                        cellTransforms: [compoundExpand],
                        ref: 'value',
                        variant: 'compact',
                        noBorders: true,
                        columns: [
                            {
                                title: 'Type',
                                ref: 'type',
                            },
                            {
                                title: 'Value',
                                ref: 'value',
                            },
                            {
                                title: 'Uses force',
                                ref: 'isForce',
                            },
                        ],
                    },
                ],
            },
            'Last run',
        ],
    },
};

export const generateMemberUrl = (member) => {
    if (member.includes('/')) {
        const [org, team] = member.split('/');
        return `https://github.com/orgs/${org}/teams/${team}`;
    }
    return `https://github.com/${member}`;
};
