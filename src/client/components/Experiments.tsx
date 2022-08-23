import { DownloadOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Popover } from "antd";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Experiment } from "../../server/types/models";
import { modelId } from "../../server/utils/shared";
import { getClientRoute } from "../App";
import { deleteExperiment, editExperiment, fetchExperiments } from "../store/actions";
import { getExperiments } from "../store/selectors";
import { useStoreDispatch } from "../store/store";

const Experiment = ({ experiment }: { experiment: Partial<Experiment> }) => {
    const dispatch = useStoreDispatch();
    const experimentId = modelId(experiment as Experiment);
    const isCreate = !experimentId;
    const [deleteConfirmation, setDelteConfirmation] = useState(false);
    const onFinish = (changes: Partial<Experiment>) => {
        dispatch(editExperiment({ ...experiment, ...changes }));
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('experiment form failed:', errorInfo);
    };
    const deleteExperimentConfirmed = () => {
        dispatch(deleteExperiment(experimentId));
        setDelteConfirmation(false);
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
            label="Repository (optional)"
            name="git"
            rules={[{ required: false, message: 'Please input a git repository url' }]}>
            <Input disabled={!isCreate} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" style={{marginRight: '10px'}}>{isCreate ? 'Create' : 'Update'}</Button>
            <Button type="primary" icon={<DownloadOutlined />} href={`${APP_PREFIX}/admin-api/experiments/${experimentId}/results/download`} target="_blank">Results</Button>
            <Link style={{ marginLeft: '10px' }} to={getClientRoute(`/experiments/${experimentId}/workers`)}>Manage workers</Link>
            {!isCreate && <Popover title="Are you sure?" trigger="click" visible={deleteConfirmation} onVisibleChange={v => setDelteConfirmation(v)} content={<div>
                <p>This action is not reversible!</p>
                <div style={{ display: 'flex' }}>
                    <Button type="primary" size="small" onClick={deleteExperimentConfirmed}>Yes, delete</Button>
                    <Button size="small" style={{ marginLeft: '10px' }} onClick={() => setDelteConfirmation(false)}>Cancel</Button>
                </div>
            </div>}>
                <Button type="link">Delete</Button>
            </Popover>}
        </Form.Item>
    </Form>
}
const Experiments = () => {
    const dispatch = useStoreDispatch();
    const experiments = useSelector(getExperiments);
    useEffect(() => { dispatch(fetchExperiments()) }, []);
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