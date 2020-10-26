import React from 'react';
import { Page, PageSection, PageSectionVariants, Bullseye, Title } from '@patternfly/react-core';
import Header from '../components/PageHeader';
import RepositoryTabs from '../components/RepositoryTabs';

const Main = () => {
    return (
        <Page header={<Header />}>
            <PageSection variant={PageSectionVariants.dark}>
                <Bullseye>
                    <Title headingLevel="h1" size="4xl">
                        Manage your repositories
                    </Title>
                </Bullseye>
            </PageSection>
            <PageSection variant={PageSectionVariants.light}>
                <RepositoryTabs />
            </PageSection>
        </Page>
    );
};

export default Main;
