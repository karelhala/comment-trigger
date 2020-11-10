import React, { useState } from 'react';
import { Tabs, Tab, TabTitleText, Grid, CardBody, Card, GridItem, CardHeader } from '@patternfly/react-core';
import LoadingBody from '../components/LodaingBody';

const Detail = () => {
    const [activeTabKey, setActiveTabKey] = useState();
    const [state, setState] = useState({
        isLoaded: false,
    });

    // useEffect(() => {}, []);
    return (
        <Tabs activeKey={activeTabKey} onSelect={(_e, active) => setActiveTabKey(active)} variant="light300">
            <Tab eventKey={0} title={<TabTitleText>General info</TabTitleText>}>
                <Grid>
                    <GridItem span={6}>
                        <Card>
                            <CardHeader>Default mainteners</CardHeader>
                            {state?.isLoaded ? <CardBody>huh</CardBody> : <LoadingBody />}
                        </Card>
                    </GridItem>
                </Grid>
            </Tab>
        </Tabs>
    );
};

export default Detail;
