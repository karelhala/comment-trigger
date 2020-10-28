import React, { useEffect } from 'react';
import { Page, PageSection, PageSectionVariants, Bullseye, Title } from '@patternfly/react-core';
import Header from '../components/PageHeader';
import RepositoryTabs from '../components/RepositoryTabs';
import { onNewInstallation } from '../utils/installations';
import { useAuth0 } from '@auth0/auth0-react';

const Main = () => {
    const { user } = useAuth0();
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
            <PageSection variant={PageSectionVariants.light}>
                <RepositoryTabs onNewInstallation={onNewInstallation} />
            </PageSection>
        </Page>
    );
};

export default Main;
