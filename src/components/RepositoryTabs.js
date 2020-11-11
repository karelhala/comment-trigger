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
import { Link, useHistory } from 'react-router-dom';
import LoadingBody from './LodaingBody';
import { APP_URL, GRANT_URL } from '../utils/installations';
import fetch from 'node-fetch';

const groupsResolver = async (user, stateSetter) => {
    try {
        const enabledGroups = await (await fetch(`/enabled-groups/${user.nickname}`)).json();
        stateSetter(() => ({
            isLoading: false,
            groups: [
                {
                    login: user.nickname,
                    avatar_url: '',
                    id: user.sub?.split('|')?.[1],
                },
                ...(enabledGroups || []),
            ],
        }));
    } catch (e) {
        stateSetter(() => ({
            isLoading: false,
            hasError: true,
            groups: [],
        }));
    }
};

const RepositoryTabs = ({ onNewInstallation }) => {
    const history = useHistory();
    const [activeTabKey, setActiveTabKey] = useState(0);
    const { user } = useAuth0();
    const [{ isLoading, repositories }, setRepositories] = useState({
        isLoading: true,
        repositories: [],
    });
    const [{ isLoading: isGroupsLoading, hasError: groupsError, groups }, setGroups] = useState({
        isLoading: true,
        groups: [],
    });
    useEffect(() => {
        groupsResolver(user, setGroups);
    }, []);
    useEffect(() => {
        if (history?.location?.state?.shouldRefresh) {
            setGroups({
                isLoading: true,
            });
            groupsResolver(user, setGroups);
            history.push({
                pathname: '/',
                state: undefined,
            });
        }
    }, [history?.location?.state?.shouldRefresh]);

    useEffect(() => {
        setRepositories({
            isLoading: true,
            repositories: [],
        });
        if (!isGroupsLoading && groups?.length > 0 && activeTabKey !== undefined) {
            (async () => {
                try {
                    const { repositories } = await (await fetch(`/enabled-repositories/${groups?.[activeTabKey]?.login}`)).json();
                    setRepositories({
                        isLoading: false,
                        repositories,
                    });
                } catch (e) {
                    setRepositories({
                        isLoading: false,
                        hasError: true,
                        repositories: [],
                    });
                }
            })();
        }
    }, [activeTabKey, groups]);

    if (!isGroupsLoading && groupsError && groups?.length === 0) {
        return (
            <EmptyState variant="small">
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title headingLevel="h4" size="lg">
                    No groups!
                </Title>
                <EmptyStateBody>Looks like error happend while fetching groups and repositories. Please run account synchronization.</EmptyStateBody>
                <Button
                    component="button"
                    variant="primary"
                    onClick={() => {
                        setGroups({
                            isLoading: true,
                        });
                        (async () => {
                            await fetch(`/refresh/${user.sub}`);
                            groupsResolver(user, setGroups);
                        })();
                    }}
                >
                    Sync my account
                </Button>
            </EmptyState>
        );
    }

    return (
        <Tabs
            activeKey={activeTabKey}
            onSelect={(_e, active) => {
                history.push(`/${groups?.[active]?.login}`);
                setActiveTabKey(active);
            }}
            variant="light300"
        >
            {!isGroupsLoading ? (
                groups?.map(({ login, id }, key) => (
                    <Tab eventKey={key} key={id || key} title={<TabTitleText>{login}</TabTitleText>}>
                        <Grid hasGutter className="ctc-c-repositories">
                            {!isLoading ? (
                                repositories?.length >= 0 ? (
                                    repositories?.map((value, itemKey) => (
                                        <GridItem key={itemKey} span={2}>
                                            <Link to={`/${groups?.[activeTabKey]?.login}/${value?.name}`}>
                                                <Card>
                                                    <CardBody>{value?.name}</CardBody>
                                                </Card>
                                            </Link>
                                        </GridItem>
                                    ))
                                ) : (
                                    <EmptyState variant="small">
                                        <EmptyStateIcon icon={PlusCircleIcon} />
                                        <Title headingLevel="h4" size="lg">
                                            No repositories found
                                        </Title>
                                        <EmptyStateBody>
                                            Looks like comment-trigger application is not installed on any {login}'s group repository. Please install
                                            it so we can manage them and improve your eficiency
                                        </EmptyStateBody>
                                        <Button component="a" href={`${APP_URL}/permissions?target_id=${id}`} variant="primary">
                                            Install on new repository
                                        </Button>
                                    </EmptyState>
                                )
                            ) : (
                                [...new Array(5)].map((_i, key) => (
                                    <GridItem key={key} span={2}>
                                        <Card>
                                            <LoadingBody />
                                        </Card>
                                    </GridItem>
                                ))
                            )}
                        </Grid>
                    </Tab>
                ))
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
