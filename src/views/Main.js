import React, { useState } from 'react';
import { Page, PageSection, PageSectionVariants, Bullseye, Title, TitleSizes, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import Header from '../components/PageHeader';

const Main = () => {
    const [activeTabKey, setActiveTabKey] = useState(0);
    return (
        <Page header={<Header />}>
            <PageSection variant={PageSectionVariants.dark}>
                <Bullseye>
                    <Title headingLevel="h1" size="4xl">
                        Manage your repositories
                    </Title>
                </Bullseye>
                <Bullseye className="ct-c-main--info">
                    <Title headingLevel="h5" size={TitleSizes.xl}>
                        Here you can view enabled repositories, add new one or disable them. You can also view each repository detail and observe the
                        transitions
                    </Title>
                </Bullseye>
            </PageSection>
            <PageSection variant={PageSectionVariants.light}>
                <Tabs activeKey={activeTabKey} onSelect={(_e, active) => setActiveTabKey(active)}>
                    <Tab eventKey={0} title={<TabTitleText>Active repositories</TabTitleText>}>
                        Users
                    </Tab>
                    <Tab eventKey={1} title={<TabTitleText>Enable new repository</TabTitleText>}>
                        Users
                    </Tab>
                </Tabs>
            </PageSection>
        </Page>
    );
};

export default Main;
