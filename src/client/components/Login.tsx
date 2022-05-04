import { Form, Input } from "antd"
import React from 'react';

const Login = () => {
    console.log({Login: 1});
    return <Form name="login" >
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
    </Form>
}

export default Login;