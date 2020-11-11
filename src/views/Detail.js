import React, { useState, useEffect, Fragment } from 'react';
import { TextContent, Text, TextVariants, Tabs, Tab, TabTitleText, Grid, CardBody, Card, GridItem, CardHeader } from '@patternfly/react-core';
import LoadingBody from '../components/LodaingBody';
import { useParams } from 'react-router-dom';
import ConnectionTab from '../components/ConnectionTab';
import { connectionMapper, generateMemberUrl } from '../utils/helpers';
import { useAuth0 } from '@auth0/auth0-react';

const Detail = () => {
    const { user } = useAuth0();
    const { owner, repository } = useParams();
    const [activeTabKey, setActiveTabKey] = useState();
    const [{ isLoaded, data }, setState] = useState({
        isLoaded: false,
    });

    useEffect(() => {
        if (owner && repository && user) {
            (async () => {
                const data = await (await fetch(`/config/${owner}/${repository}?user=${user?.nickname}`)).json();
                setState(() => ({
                    isLoaded: true,
                    data,
                }));
            })();
        }
    }, [owner, repository, user]);

    return (
        <Tabs activeKey={activeTabKey} onSelect={(_e, active) => setActiveTabKey(active)} variant="light300">
            <Tab eventKey={0} title={<TabTitleText>General info</TabTitleText>}>
                <Grid>
                    <GridItem span={6}>
                        <Card>
                            <CardHeader>Default mainteners</CardHeader>
                            {isLoaded ? (
                                <CardBody>
                                    <TextContent>
                                        {data?.mainteners?.map((value, key) => (
                                            <Fragment key={key}>
                                                <Text component={TextVariants.a} href={generateMemberUrl(value)} target="_blank" rel="noopener">
                                                    @{value}
                                                </Text>
                                                <br />
                                            </Fragment>
                                        ))}
                                    </TextContent>
                                </CardBody>
                            ) : (
                                <LoadingBody />
                            )}
                        </Card>
                    </GridItem>
                </Grid>
            </Tab>
            {isLoaded &&
                Object.entries(data?.rules).map(([key, value], index) => (
                    <Tab key={`${key}-${index}`} eventKey={index + 1} title={<TabTitleText>{connectionMapper?.[key]?.title}</TabTitleText>}>
                        <ConnectionTab connection={value} columns={connectionMapper?.[key]?.columns} />
                    </Tab>
                ))}
        </Tabs>
    );
};

export default Detail;
