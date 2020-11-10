import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth0 } from '@auth0/auth0-react';
import {
    Grid,
    GridItem,
    Tabs,
    Tab,
    TabTitleText,
    Title,
    CardBody,
    Card,
    Skeleton,
    EmptyState,
    EmptyStateIcon,
    EmptyStateBody,
    Button,
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { Link } from 'react-router-dom';
import LoadingBody from './LodaingBody';
import { APP_URL, GRANT_URL } from '../utils/installations';

const repositoriesReducer = (acc, { name, fullName, owner, html_url }) => ({
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
});

const RepositoryTabs = ({ onNewInstallation }) => {
    const [activeTabKey, setActiveTabKey] = useState(0);
    const { user } = useAuth0();
    const [{ isLoading, repositories }, setRepositories] = useState({
        isLoading: true,
        repositories: [],
    });
    useEffect(() => {
        if (user) {
            (async () => {
                try {
                    const enabledRepos = await (await fetch(`/enabled/${user.nickname}`)).json();
                    setRepositories({
                        isLoading: false,
                        repositories: enabledRepos.reduce(repositoriesReducer, {}),
                    });
                } catch (e) {
                    setRepositories({
                        isLoading: false,
                        repositories: {},
                    });
                }
            })();
        }
    }, [user]);

    const repos = Object.entries(repositories || {});

    return (
        <Tabs activeKey={activeTabKey} onSelect={(_e, active) => setActiveTabKey(active)} variant="light300">
            {!isLoading ? (
                repos?.length > 0 ? (
                    repos.map(([key, { repos }], index) => (
                        <Tab eventKey={index} key={key} title={<TabTitleText>{key}</TabTitleText>}>
                            <Grid hasGutter className="ctc-c-repositories">
                                {repos.map((value, itemKey) => (
                                    <GridItem key={itemKey} span={2}>
                                        <Link to={`/${value?.name}`}>
                                            <Card>
                                                <CardBody>{value?.name}</CardBody>
                                            </Card>
                                        </Link>
                                    </GridItem>
                                ))}
                            </Grid>
                        </Tab>
                    ))
                ) : (
                    <Tab eventKey={0} title={<TabTitleText>No repositories</TabTitleText>}>
                        <EmptyState variant="small">
                            <EmptyStateIcon icon={PlusCircleIcon} />
                            <Title headingLevel="h4" size="lg">
                                No repositories found
                            </Title>
                            <EmptyStateBody>
                                Looks like comment-trigger application is not installed on any of your repository. Please install it so we can manage
                                them and improve your eficiency
                            </EmptyStateBody>
                            <Button component="a" href={APP_URL} variant="primary" onClick={onNewInstallation}>
                                Install on new repository
                            </Button>
                        </EmptyState>
                    </Tab>
                )
            ) : (
                <Tab
                    className="ctc-c-loading"
                    eventKey={0}
                    title={
                        <TabTitleText>
                            <Skeleton />
                        </TabTitleText>
                    }
                >
                    <Grid hasGutter className="ctc-c-repositories">
                        {[...new Array(5)].map((_i, key) => (
                            <GridItem key={key} span={2}>
                                <Card>
                                    <LoadingBody />
                                </Card>
                            </GridItem>
                        ))}
                    </Grid>
                </Tab>
            )}
            <Tab
                title={<PlusCircleIcon />}
                component="a"
                href={GRANT_URL}
                onClick={(e) => {
                    e.preventDefault();
                    onNewInstallation();
                }}
            />
        </Tabs>
    );
};

RepositoryTabs.propTypes = {
    onNewInstallation: PropTypes.func,
};

RepositoryTabs.defaultProps = {
    onNewInstallation: () => undefined,
};

export default RepositoryTabs;
