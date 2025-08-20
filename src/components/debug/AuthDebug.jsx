import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Descriptions, Tag } from 'antd';
import { UserOutlined, KeyOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { authService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const AuthDebug = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const testAuthentication = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const currentUser = await authService.getCurrentUser();
      setTestResult({
        success: true,
        message: 'Authentication test passed',
        data: currentUser
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Authentication test failed: ${error.message}`,
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getStorageInfo = () => {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      storedUser: localStorage.getItem('user')
    };
  };

  const storage = getStorageInfo();

  return (
    <Card 
      title={
        <Space>
          <UserOutlined />
          <Title level={4} style={{ margin: 0 }}>Authentication Debug</Title>
        </Space>
      }
      style={{ margin: '20px', maxWidth: '800px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          This component helps diagnose authentication issues by showing the current auth state and testing API calls.
        </Paragraph>

        <Descriptions title="Redux Auth State" bordered size="small">
          <Descriptions.Item label="Is Authenticated" span={3}>
            <Tag color={isAuthenticated ? 'green' : 'red'}>
              {isAuthenticated ? 'Yes' : 'No'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="User Data" span={3}>
            {user ? (
              <div>
                <Text strong>{user.first_name} {user.last_name}</Text>
                <br />
                <Text type="secondary">{user.email}</Text>
                <br />
                <Tag color="blue">{user.role}</Tag>
              </div>
            ) : (
              <Text type="secondary">No user data</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Token" span={3}>
            <Text code style={{ fontSize: '10px' }}>
              {token ? `${token.substring(0, 20)}...` : 'No token'}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="Local Storage" bordered size="small">
          <Descriptions.Item label="Access Token" span={3}>
            <Text code style={{ fontSize: '10px' }}>
              {storage.accessToken ? `${storage.accessToken.substring(0, 20)}...` : 'Not found'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Refresh Token" span={3}>
            <Text code style={{ fontSize: '10px' }}>
              {storage.refreshToken ? `${storage.refreshToken.substring(0, 20)}...` : 'Not found'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Stored User" span={3}>
            <Text code style={{ fontSize: '10px' }}>
              {storage.storedUser ? 'Present' : 'Not found'}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Button 
          type="primary" 
          onClick={testAuthentication}
          loading={loading}
          icon={<KeyOutlined />}
        >
          Test Authentication API Call
        </Button>

        {testResult && (
          <Alert
            message={testResult.success ? "Authentication Test Result" : "Authentication Test Failed"}
            description={
              <div>
                <Text>{testResult.message}</Text>
                {testResult.success && testResult.data && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>View User Data</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </details>
                )}
                {!testResult.success && testResult.error && (
                  <Text code style={{ display: 'block', marginTop: '5px' }}>
                    Error: {JSON.stringify(testResult.error, null, 2)}
                  </Text>
                )}
              </div>
            }
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            style={{ marginTop: '10px' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default AuthDebug;
