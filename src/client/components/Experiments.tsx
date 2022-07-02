import { Button, Collapse, Form, FormInstance, Input } from "antd";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import React, { useEffect, useMemo } from "react";
import { modelId } from "../../server/utils/shared";
import { Experiment } from "../../server/types/models";
import { editExperiment, fetchExperiments } from "../store/actions";
import { useStoreDispatch } from "../store/store";
import { getExperiments } from "../store/selectors";
import { useSelector } from "react-redux";
import { getClientRoute } from "../App";
import { Link } from "react-router-dom";

const Experiment = ({experiment} : {experiment: Partial<Experiment>}) => {
    const dispatch = useStoreDispatch();
    const experimentId = modelId(experiment as Experiment);
    const isCreate = !experimentId;
    const onFinish = (changes: Partial<Experiment>) => {
        dispatch(editExperiment({...experiment, ...changes}));
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('experiment form failed:', errorInfo);
    };
    return <Form name="experiment"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={experiment}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input a unique experiment name' }]}>
            <Input disabled={!isCreate} />
        </Form.Item>
        <Form.Item
            label="Repository"
            name="git"
            rules={[{ required: true, message: 'Please input a git repository connection string' }]}>
            <Input disabled={!isCreate} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">{isCreate ? 'Create' : 'Update'}</Button>
            <Link style={{marginLeft: '10px'}} to={getClientRoute(`/experiments/${experimentId}/workers`)}>Manage workers</Link>
        </Form.Item>
    </Form>
}
const Experiments = () => {
    const dispatch = useStoreDispatch();
    const experiments = useSelector(getExperiments);
    useEffect(() => {dispatch(fetchExperiments())}, []);
    const NewExpPanel = useMemo(() =>
        <CollapsePanel header="Create a New Experiment" key={'new-' + new Date().getTime()} ><Experiment experiment={{}} /></CollapsePanel>,
        [experiments]);
    return <div>
        <h2>Experiments/Apps Management</h2>
        <Collapse>
            {experiments?.map(exp => <CollapsePanel header={exp.name} key={modelId(exp)}><Experiment experiment={exp} /></CollapsePanel>)}
            {NewExpPanel}
        </Collapse>
    </div>
}

export default Experiments;