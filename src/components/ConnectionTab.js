import React, { Fragment, useState } from 'react';
import { Tooltip, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { InfoAltIcon } from '@patternfly/react-icons/dist/js/icons/info-alt-icon';
import { generateMemberUrl } from '../utils/helpers';

const ConnectionTab = ({ connection, columns, variant, borders }) => {
    const [opened, setOpened] = useState({});

    const onExpand = (_e, rowKey, _cellIndex, _isOpened, row, { property, ...rest }) => {
        setOpened({
            ...opened,
            [rowKey]: {
                [property]: !opened?.[rowKey]?.[property],
            },
        });
    };
    let coumpoundIndex = 0;
    let totalRows = 0;
    const rows = connection.flatMap((item, key) => {
        const calculatedRows = [
            {
                cells: columns.map((cell) => {
                    if (cell?.ref === 'executor') {
                        return {
                            title: (
                                <Fragment>
                                    <TextContent>
                                        <Text component={TextVariants.a} href={generateMemberUrl(item?.executor || 'ct-octobot')}>
                                            @
                                            {item?.executor || (
                                                <Fragment>
                                                    ct-octobot{' '}
                                                    <Tooltip content="@ct-octobot requires push access to your repository, if you don't want to grant him these priviliges please use different user for which you gave us its token">
                                                        <InfoAltIcon />
                                                    </Tooltip>
                                                </Fragment>
                                            )}
                                        </Text>
                                    </TextContent>
                                </Fragment>
                            ),
                        };
                    }

                    return {
                        title: Array.isArray(item?.[cell?.ref])
                            ? cell?.columns
                                ? item[cell?.ref].length
                                : item[cell?.ref].join(', ')
                            : item[cell?.ref] || 'N/A',
                        ...(Array.isArray(item?.[cell?.ref]) && {
                            props: {
                                isOpen: !!opened?.[totalRows]?.[cell?.ref],
                                ariaControls: `compound-expansion-table-${++coumpoundIndex}`,
                            },
                        }),
                    };
                }),
            },
            ...columns.map((cell, index) => {
                if (Array.isArray(item?.[cell?.ref])) {
                    return {
                        parent: key,
                        compoundParent: index,
                        cells: [
                            {
                                title: cell?.columns ? (
                                    <Fragment>
                                        <ConnectionTab
                                            variant={cell?.variant}
                                            borders={!cell?.noBorders}
                                            columns={cell?.columns}
                                            connection={item?.[cell?.ref]}
                                        />
                                    </Fragment>
                                ) : (
                                    `${item?.[cell?.ref]}`
                                ),
                                props: { colSpan: columns.length, className: 'pf-m-no-padding' },
                            },
                        ],
                    };
                }

                return false;
            }),
        ].filter(Boolean);
        totalRows = key + totalRows + calculatedRows.length;
        return calculatedRows;
    });

    return (
        <Table variant={variant} borders={borders} aria-label="Compound expandable table" onExpand={onExpand} rows={rows} cells={columns}>
            <TableHeader />
            <TableBody />
        </Table>
    );
};

export default ConnectionTab;
