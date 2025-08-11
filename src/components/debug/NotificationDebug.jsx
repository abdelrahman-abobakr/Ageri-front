import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Space, Spin } from 'antd';
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { notificationService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const NotificationDebug = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const testNotificationEndpoint = async () => {
    setLoading(true);
    setResults([]);
    setError(null);

    const tests = [
      {
        name: 'Get Notifications',
        test: () => notificationService.getNotifications({ page_size: 5 })
      },
      {
        name: 'Get Templates',
        test: () => notificationService.getTemplates()
      },
      {
        name: 'Get Settings',
        test: () => notificationService.getSettings()
      }
    ];

    const testResults = [];

    for (const { name, test } of tests) {
      try {
        console.log(`Testing ${name}...`);
        const result = await test();
        testResults.push({
          name,
          status: 'success',
          data: result,
          message: 'Test passed successfully'
        });
        console.log(`✅ ${name} success:`, result);
      } catch (error) {
        testResults.push({
          name,
          status: 'error',
          error: error.message,
          message: `Test failed: ${error.message}`
        });
        console.error(`❌ ${name} failed:`, error);
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    testNotificationEndpoint();
  }, []);

  return (
    <Card 
      title={
        <Space>
          <BellOutlined />
          <Title level={4} style={{ margin: 0 }}>Notification System Debug</Title>
        </Space>
      }
      style={{ margin: '20px', maxWidth: '800px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          This component tests the notification service endpoints to help diagnose any issues.
        </Paragraph>

        <Button 
          type="primary" 
          onClick={testNotificationEndpoint}
          loading={loading}
          icon={<BellOutlined />}
        >
          Run Notification Tests
        </Button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <Text style={{ display: 'block', marginTop: '10px' }}>
              Testing notification endpoints...
            </Text>
          </div>
        )}

        {error && (
          <Alert
            message="Test Error"
            description={error}
            type="error"
            showIcon
          />
        )}

        {results.length > 0 && (
          <div>
            <Title level={5}>Test Results:</Title>
            {results.map((result, index) => (
              <Alert
                key={index}
                message={result.name}
                description={
                  <div>
                    <Text>{result.message}</Text>
                    {result.status === 'success' && result.data && (
                      <details style={{ marginTop: '10px' }}>
                        <summary>View Response Data</summary>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '10px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.error && (
                      <Text code style={{ display: 'block', marginTop: '5px' }}>
                        Error: {result.error}
                      </Text>
                    )}
                  </div>
                }
                type={result.status === 'success' ? 'success' : 'error'}
                icon={result.status === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                style={{ marginBottom: '10px' }}
              />
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default NotificationDebug;
