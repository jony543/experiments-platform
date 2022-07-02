import { Button, Collapse, Form, Table, Typography } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import Input from 'antd/lib/input/Input';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Worker } from '../../server/types/models';
import { modelId } from '../../server/utils/shared';
import { editWorker, fetchExperiments, fetchWorkers } from '../store/actions';
import { getExperiments, getExperimentsDict, getWorkers } from '../store/selectors';
import { useStoreDispatch } from '../store/store';
import CopyToClipboard from './CopyToClipboard';

const WorkerForm = ({worker, experimentId} : {worker: Partial<Worker>, experimentId: string}) => {
    const dispatch = useStoreDispatch();
    const isCreate = !modelId(worker as Worker);
    const [enabled, setEnabled] = useState(true);
    const onFinish = (changes: Partial<Worker>) => {
        setEnabled(false);
        dispatch(editWorker(experimentId, {...worker, ...changes}));
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('worker form failed:', errorInfo);
    };
    return <Form name="worker"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={worker}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input a worker name' }]}>
            <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" disabled={!enabled} htmlType="submit">{isCreate ? 'Create' : 'Update'}</Button>
        </Form.Item>
    </Form>
}

const Workers = () => {
    const dispatch = useStoreDispatch();
    const {experimentId} = useParams();
    const workers = useSelector(getWorkers(experimentId));
    const experiments = useSelector(getExperimentsDict);
    const experiment = experiments?.[experimentId];
    const [editing, setEditing] = useState<Worker>();
    useEffect(() => setEditing(null), [workers]);
    useEffect(() => {
        if (!experiments)
            dispatch(fetchExperiments())
    }, []);
    useEffect(() => {dispatch(fetchWorkers(experimentId))}, [experimentId]);
    const columns = useMemo<ColumnsType<Worker>>(() => [
        {dataIndex: '_id', title: 'WorkerId'},
        {dataIndex: 'name', title: 'Name'},
        {dataIndex: 'experiment', title: 'Experiment', render: (val: string) => experiments?.[val]?.name},
        {dataIndex: 'key', title: 'Key', render: (val) => <div style={{width: '150px', display: 'flex', marginRight: '-50px'}}>
            <Typography.Text ellipsis={true}>{val}</Typography.Text><CopyToClipboard value={val} />
        </div>},
        {render: (value: any, record: Worker) => <Button type="link" onClick={() => setEditing(record)}>Edit</Button>}
    ], [experiments]);
    const EditPanel = useMemo(() => {
            const panelKey = 'worker-edit-panel-' + new Date().getTime();
            return <Collapse {...editing && {activeKey: panelKey}}>
                <CollapsePanel header={editing ? `Editing ${modelId(editing)}` : 'Create a New Worker'}
                    key={panelKey} {...editing && {extra: <Button type="link" onClick={() => setEditing(null)}>cancel</Button>}}>
                        <WorkerForm experimentId={experimentId} worker={editing || {}} />
                </CollapsePanel>
            </Collapse>
        },
        [workers, editing]);
    return <>
        {EditPanel}
        <Table dataSource={workers} columns={columns} />
    </>
};

export default Workers;