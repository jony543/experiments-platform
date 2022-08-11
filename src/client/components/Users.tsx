import { Button, Collapse, Table } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AuthParams } from '../../server/types/api';
import { User } from '../../server/types/models';
import { modelId } from '../../server/utils/shared';
import { createUser, editUser, fetchUsers } from '../store/actions';
import { getUsers } from '../store/selectors';
import { useStoreDispatch } from '../store/store';
import AuthForm from './AuthForm';

const Users = () => {
    const dispatch = useStoreDispatch();
    const users = useSelector(getUsers);
    const [editing, setEditing] = useState<User>();
    useEffect(() => setEditing(null), [users]);
    useEffect(() => {dispatch(fetchUsers())}, []);
    const columns: ColumnsType<User> = [
        {dataIndex: '_id', title: 'Id'},
        {dataIndex: 'username', title: 'Username'},
        {dataIndex: 'role', title: 'Role'},
        {render: (value: any, record: User) => <Button type="link" onClick={() => setEditing(record)}>Edit</Button>}
    ];
    const save = (params: AuthParams) => {
        if (editing)
            dispatch(editUser(modelId(editing), params));
        else
            dispatch(createUser(params));
    }
    const EditPanel = useMemo(() => {
            const panelKey = 'worker-edit-panel-' + new Date().getTime();
            return <Collapse {...editing && {activeKey: panelKey}}>
                <CollapsePanel header={editing ? `Editing ${modelId(editing)}` : 'Create a New User'}
                    key={panelKey} {...editing && {extra: <Button type="link" onClick={() => setEditing(null)}>cancel</Button>}}>
                        <AuthForm initialValues={editing} callback={save} />
                </CollapsePanel>
            </Collapse>
        },
        [users, editing]);
    return <>
        <h2>Users Management</h2>
        {EditPanel}
        <Table dataSource={users} columns={columns} />
    </>
};

export default Users;