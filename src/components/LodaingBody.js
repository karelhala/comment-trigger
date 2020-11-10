import React, { Fragment } from 'react';
import { CardBody, Skeleton } from '@patternfly/react-core';
import PropTypes from 'prop-types';

const LoadingBody = ({ length, ...props }) => (
    <CardBody {...props}>
        {[...new Array(length)].map((_, key) => (
            <Fragment>
                <Skeleton key={key} width={`${Math.floor(Math.random() * Math.floor(100))}%`} />
                <br />
            </Fragment>
        ))}
    </CardBody>
);

LoadingBody.propTypes = {
    length: PropTypes.number,
};
LoadingBody.defaultProps = {
    length: 5,
};

export default LoadingBody;
