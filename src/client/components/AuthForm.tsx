import { Button, Form, Input } from "antd";
import { camelCase, pick } from "lodash";
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { AuthParams } from "../../server/types/api";
import { getClientRoute } from "../App";
import { AuthAction, authenticate } from "../store/actions";
import { getUser } from '../store/selectors';
import { useStoreDispatch } from "../store/store";

const AuthForm = ({ authAction, callback, initialValues }: { authAction?: AuthAction, callback?: (result: AuthParams) => void, initialValues?: Partial<AuthParams> }) => {
    const dispatch = useStoreDispatch();
    const user = useSelector(getUser);
    const {state} = useLocation();
    const navigate = useNavigate();
    const userLoadedOnce = useRef(false);
    useEffect(() => {
        if (userLoadedOnce.current) {
            if (authAction === 'resetPassword') {
                navigate(getClientRoute('/'));
            }
        }
        userLoadedOnce.current = true;
    }, [user]);
    if (user && !callback && authAction !== 'resetPassword') {
        return <Navigate to={getClientRoute(state as string)} />
    }
    const onFinish = (values: AuthParams) => {
        if (callback)
            callback(values);
        else
            dispatch(authenticate(values.username, values.password, authAction, values.newPassword));
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('auth form failed:', errorInfo);
    };
    return <Form name="auth"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={initialValues ? pick(initialValues, 'username') : {}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input disabled={authAction === 'resetPassword'} />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            rules={[{ required: !callback, message: 'Please input your password!' }]}>
            <Input.Password />
        </Form.Item>
        {authAction === 'resetPassword' && <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: 'Please insert a new password' }]}>
            <Input.Password />
        </Form.Item>}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
                {callback ? 'Submit' : camelCase(authAction)}
            </Button>
        </Form.Item>
        {!DISABLE_REGISTRATION && !callback && authAction == 'login' && <Link to={getClientRoute('/register')}>register</Link>}
        {!DISABLE_REGISTRATION && !callback && authAction == 'register' && <Link to={getClientRoute('/login')}>login</Link>}
    </Form>
}

export default AuthForm;