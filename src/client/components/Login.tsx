import { Button, Form, Input } from "antd"
import React from 'react';
import { authenticate } from "../store/actions";

const Login = ({ register }: { register?: boolean }) => {
    const onFinish = (values: any) => {
        console.log('auth form success:', values);
        authenticate(values.username, values.password, register);
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('auth form failed:', errorInfo);
    };
    return <Form name="login"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
                {register ? 'Register' : 'Login'}
            </Button>
        </Form.Item>
    </Form>
}

export default Login;