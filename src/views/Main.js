import React, { useEffect } from 'react';
import { Page, PageSection, PageSectionVariants, Bullseye, Title, Modal, Button } from '@patternfly/react-core';
import Header from '../components/PageHeader';
import RepositoryTabs from '../components/RepositoryTabs';
import { onNewInstallation, onGrantRepository } from '../utils/installations';
import { useAuth0 } from '@auth0/auth0-react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Detail from './Detail';
import NewToken from './NewToken';

const Main = () => {
    const { user } = useAuth0();
    const history = useHistory();
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('code') && searchParams.get('setup_action') === 'install') {
            window.location.search = '';
            fetch(`/token/${user?.nickname}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: searchParams.get('code'),
                }),
            });
        }
    }, []);
    return (
        <Page header={<Header onNewInstallation={onNewInstallation} />}>
            <PageSection variant={PageSectionVariants.dark}>
                <Bullseye>
                    <Title headingLevel="h1" size="4xl">
                        Manage your repositories
                    </Title>
                </Bullseye>
            </PageSection>
            <PageSection variant={PageSectionVariants.light} isFilled>
                <RepositoryTabs onNewInstallation={onGrantRepository} />
            </PageSection>
            <Switch>
                <Route
                    path={`/new-auth`}
                    exact
                    render={() => (
                        <Modal variant="medium" title={`Add new auth login`} isOpen onClose={() => history.push('/')}>
                            <NewToken />
                        </Modal>
                    )}
                />
                <Route
                    path={`/:owner/:repository`}
                    className="ct-c-reposiory__info"
                    exact
                    render={() => (
                        <Modal variant="medium" title="Detail view" isOpen onClose={() => history.push('/')}>
                            <Detail />
                        </Modal>
                    )}
                />
            </Switch>
        </Page>
    );
};

export default Main;
