import { CopyOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

const CopyToClipboard = ({value}: {value: string}) => {
    return <Button onClick={() => navigator.clipboard.writeText(value)}><CopyOutlined /></Button>
}

export default CopyToClipboard;