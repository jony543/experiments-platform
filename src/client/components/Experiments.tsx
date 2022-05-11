import { Button, Collapse, Form, Input } from "antd";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import React, { useEffect } from "react";
import { modelId } from "../../server/utils/shared";
import { Experiment } from "../../server/types/models";
import { editExperiment, fetchExperiments } from "../store/actions";
import { useStoreDispatch } from "../store/store";
import { getExperiments } from "../store/selectors";
import { useSelector } from "react-redux";

const Experiment = ({experiment} : {experiment: Partial<Experiment>}) => {
    const dispatch = useStoreDispatch();
    const isCreate = !modelId(experiment as Experiment);

    const onFinish = (changes: Partial<Experiment>) => {
        dispatch(editExperiment({...experiment, ...changes}));
        if (isCreate)
            dispatch(fetchExperiments());
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('experiment form failed:', errorInfo);
    };
    return <Form name="login"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={experiment}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input a unique experiment name' }]}>
            <Input />
        </Form.Item>
        {isCreate && <Form.Item
            label="Repository"
            name="git"
            rules={[{ required: true, message: 'Please input a git repository connection string' }]}>
            <Input />
        </Form.Item>}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">{isCreate ? 'Create' : 'Update'}</Button>
        </Form.Item>
    </Form>
}
const Experiments = () => {
    const dispatch = useStoreDispatch();
    const experiments = useSelector(getExperiments);
    useEffect(() => {dispatch(fetchExperiments())}, []);
    return <div>
        <h2>Experiments/Apps management</h2>
        <Collapse>
            {experiments?.map(exp => <CollapsePanel header={exp.name} key={modelId(exp)}><Experiment experiment={exp} /></CollapsePanel>)}
            <CollapsePanel header="New Experiment" key="new"><Experiment experiment={{}} /></CollapsePanel>
        </Collapse>
    </div>
}

export default Experiments;