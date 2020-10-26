import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Grid, GridItem, Tabs, Tab, TabTitleText, CardBody, Card } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

const RepositoryTabs = () => {
    const [activeTabKey, setActiveTabKey] = useState(0);
    const { user } = useAuth0();
    const [{ isLoading, repositories }, setRepositories] = useState({
        isLoading: true,
        repositories: [],
    });
    useEffect(() => {
        if (user) {
            (async () => {
                const enabledRepos = await (await fetch(`/enabled/${user.nickname}`)).json();
                setRepositories({
                    isLoading: false,
                    repositories: enabledRepos.reduce(
                        (acc, { name, fullName, owner, html_url }) => ({
                            ...acc,
                            [owner.login]: {
                                ...(acc?.[owner.login] || {
                                    owner,
                                }),
                                repos: [
                                    ...(acc?.[owner.login]?.repos || []),
                                    {
                                        name,
                                        fullName,
                                        owner,
                                        htmlUrl: html_url,
                                    },
                                ],
                            },
                        }),
                        {}
                    ),
                });
            })();
        }
    }, [user]);

    return (
        <Tabs
            activeKey={activeTabKey}
            onSelect={(_e, active) => {
                if (active) {
                    setActiveTabKey(active);
                } else {
                    // call add app
                }
            }}
            variant="light300"
        >
            {!isLoading &&
                Object.entries(repositories || {}).map(([key, { repos }]) => (
                    <Tab eventKey={0} key={key} title={<TabTitleText>{key}</TabTitleText>}>
                        <Grid hasGutter>
                            {repos.map((value, itemKey) => (
                                <GridItem key={itemKey} span={2}>
                                    <Card>
                                        <CardBody>{value?.name}</CardBody>
                                    </Card>
                                </GridItem>
                            ))}
                        </Grid>
                    </Tab>
                ))}
            <Tab title={<PlusCircleIcon />} />
        </Tabs>
    );
};

export default RepositoryTabs;
