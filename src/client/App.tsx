import 'antd/dist/antd.css';
import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    BrowserRouter as Router, Navigate, Outlet, Route, Routes, useNavigate
} from "react-router-dom";
import AuthForm from './components/AuthForm';
import { fetchUser } from './store/actions';
import { getUser } from './store/selectors';
import { useStoreDispatch } from './store/store';

export const getClientRoute = (url: string) => window.BASE_PATH + url;

// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
const PrivateRoute = ({ children }) => {
    const user = useSelector(getUser);
    return user ? children : <Navigate to={getClientRoute('/login')} />;
}

const getRouteComponent = (path: string, element: JSX.Element, isPublic: boolean = false) =>
    <Route path={getClientRoute(path)} caseSensitive={false} element={isPublic ? element : <PrivateRoute><>{element}</></PrivateRoute>} />

const App = () => {
    const dispatch = useStoreDispatch();
    const user = useSelector(getUser);
    useEffect(() => {
        dispatch(fetchUser());
    }, [])
    return <Layout>
        <Header>Welcome to Experiments Platform v2</Header>
        <Content>
            <Routes>
                {getRouteComponent('/', <div>Home Page!</div>)}
                {getRouteComponent('/login', <AuthForm />, true)}
                {getRouteComponent('/register', <AuthForm register />, true)}
            </Routes>
        </Content>
        <Footer>Footer</Footer>
    </Layout>;
};

export default App;