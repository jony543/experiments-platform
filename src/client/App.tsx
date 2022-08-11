import { AppstoreOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import 'antd/dist/antd.css';
import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import SubMenu from 'antd/lib/menu/SubMenu';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthForm from './components/AuthForm';
import Experiments from './components/Experiments';
import Notifications from './components/Notifications';
import Users from './components/Users';
import Workers from './components/Workers';
import { fetchUser } from './store/actions';
import { getUser } from './store/selectors';
import { useStoreDispatch } from './store/store';

const PATH_PREFIX = APP_PREFIX + window.BASE_PATH;
export const getClientRoute = (url: string) => PATH_PREFIX + (url || '');

// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
const PrivateRoute = ({ children }: React.PropsWithChildren<{}>) => {
    const user = useSelector(getUser);
    const { pathname, search, hash } = useLocation();
    return user ? <>{children}</> : <Navigate state={`${pathname}${search || ''}${hash || ''}`.replace(PATH_PREFIX, '')} to={getClientRoute('/login')} />;
}

const getRouteComponent = (path: string, element: JSX.Element, isPublic: boolean = false) =>
    <Route path={getClientRoute(path)} caseSensitive={false} element={isPublic ? element : <PrivateRoute>{element}</PrivateRoute>} />

const App = () => {
    const dispatch = useStoreDispatch();
    const user = useSelector(getUser);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    useEffect(() => {
        dispatch(fetchUser());
    }, []);
    useEffect(() => {
        selectedMenuItem == 'home' && setSelectedMenuItem(null)
    }, [selectedMenuItem]);
    const onMenuClick: MenuProps['onClick'] = e => {
        setSelectedMenuItem(e.key);
    };
    return <Layout>
        <Notifications />
        <Header>
            <Menu mode="horizontal" theme="dark" selectedKeys={[selectedMenuItem]} onClick={onMenuClick}>
                <Menu.Item key="home"><Link to={getClientRoute('/')} ><div style={{
                        backgroundImage: `url('${getClientRoute('assets/logo.png')}')`,
                        height: '100%',
                        width: '190px',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                    }} /></Link></Menu.Item>
                <Menu.Item icon={<AppstoreOutlined />}><Link to={getClientRoute('/experiments')} >Experiments/Apps</Link></Menu.Item>
                {user?.role === 'admin' && <Menu.Item icon={<TeamOutlined />}><Link to={getClientRoute('/users')} >User Management</Link></Menu.Item>}
                {user && <SubMenu style={{marginLeft: 'auto'}} key="user" icon={<UserOutlined />} title={user.username}>
                    <Menu.Item><Link to={getClientRoute('/resetPassword')} >Reset Password</Link></Menu.Item>
                </SubMenu>}
            </Menu>
        </Header>
        <Content>
            <Routes>
                {getRouteComponent('/', <div>Welcome to experiments platform v2!</div>)}
                {getRouteComponent('/login', <AuthForm authAction="login" />, true)}
                {getRouteComponent('/resetPassword', <AuthForm authAction="resetPassword" initialValues={user} />)}
                {!DISABLE_REGISTRATION && getRouteComponent('/register', <AuthForm authAction="register" />, true)}
                {getRouteComponent('/users', <Users />)}
                {getRouteComponent('/experiments', <Experiments />)}
                {getRouteComponent('/experiments/:experimentId/workers', <Workers />)}
            </Routes>
        </Content>
        <Footer></Footer>
    </Layout>;
};

export default App;