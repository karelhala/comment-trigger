import React, { lazy, Suspense } from 'react';
import { Router, Switch } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import history from './utils/history';
import { useAuth0 } from '@auth0/auth0-react';
import Loading from './components/Loading';
const Dashboard = lazy(() => import('./views/Main'));

const App = () => {
    const { isLoading } = useAuth0();
    return isLoading ? (
        <Loading />
    ) : (
        <Router history={history}>
            <Suspense fallback={<Loading />}>
                <Switch>
                    <PrivateRoute path="/" component={Dashboard} />
                </Switch>
            </Suspense>
        </Router>
    );
};

export default App;
