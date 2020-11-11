import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import { useAuth0 } from '@auth0/auth0-react';
import Loading from './components/Loading';
const Dashboard = lazy(() => import('./views/Main'));

const App = () => {
    const { isLoading } = useAuth0();
    return isLoading ? (
        <Loading />
    ) : (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Switch>
                    <PrivateRoute path={['/', '/:owner']} component={Dashboard} />
                </Switch>
            </Suspense>
        </BrowserRouter>
    );
};

export default App;
