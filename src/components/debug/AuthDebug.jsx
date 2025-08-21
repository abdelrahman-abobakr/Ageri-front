import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const AuthDebug = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  return (
    <Card title="Authentication Debug Info" style={{ margin: 16 }}>
      <Space direction="vertical" size="middle">
        <div>
          <Text strong>Loading: </Text>
          <Text>{loading ? 'true' : 'false'}</Text>
        </div>
        <div>
          <Text strong>Is Authenticated: </Text>
          <Text>{isAuthenticated ? 'true' : 'false'}</Text>
        </div>
        {user && (
          <>
            <div>
              <Text strong>User ID: </Text>
              <Text>{user.id || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Username: </Text>
              <Text>{user.username || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Email: </Text>
              <Text>{user.email || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Role: </Text>
              <Text>{user.role || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Is Approved: </Text>
              <Text>{user.is_approved !== undefined ? user.is_approved.toString() : 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Full User Object: </Text>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

export default AuthDebug;
