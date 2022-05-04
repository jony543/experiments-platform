import Layout, { Content, Footer, Header } from 'antd/lib/layout/layout';
import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    PathRouteProps
  } from "react-router-dom";
import Login from './components/Login';
import 'antd/dist/antd.css';
const getRouteComponent = (path: string, element: JSX.Element) => 
    <Route path={window.BASE_PATH + path} caseSensitive={false} element={element} />
const App = () => {
    return <Router>
        <Layout>
            <Header>Welcome to Experiments Platform v2</Header>
            <Content>
                    <Routes>
                        {getRouteComponent('/', <div>Home Page!</div>)}
                        {getRouteComponent('/login', <Login />)}
                        {getRouteComponent('/register', <Login />)}
                    </Routes>
            </Content>
            <Footer>Footer</Footer>
        </Layout>
    </Router>;
};

export default App;