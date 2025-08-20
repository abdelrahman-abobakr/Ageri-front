import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Form, Input, Switch, message } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import profileService from '../../services/profileService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProfileFieldsIssueDebug = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [form] = Form.useForm();

  const testSpecificFields = async (values) => {
    setLoading(true);
    setTestResult(null);

    try {
      
      // Step 1: Get current profile
      const beforeProfile = await profileService.getMyProfile();

      // Step 2: Test the specific problematic fields
      const testData = {
        bio: values.bio || 'Test bio updated at ' + new Date().toLocaleTimeString(),
        research_interests: values.research_interests || 'Test research interests updated at ' + new Date().toLocaleTimeString(),
        is_public: values.is_public !== undefined ? values.is_public : true
      };

      const updateResponse = await profileService.updateMyProfile(testData);

      // Step 3: Get profile again to verify what actually saved
      const afterProfile = await profileService.getMyProfile();

      // Step 4: Compare field by field
      const fieldComparison = {
        bio: {
          sent: testData.bio,
          before: beforeProfile.bio,
          after: afterProfile.bio,
          changed: beforeProfile.bio !== afterProfile.bio,
          savedCorrectly: afterProfile.bio === testData.bio
        },
        research_interests: {
          sent: testData.research_interests,
          before: beforeProfile.research_interests,
          after: afterProfile.research_interests,
          changed: beforeProfile.research_interests !== afterProfile.research_interests,
          savedCorrectly: afterProfile.research_interests === testData.research_interests
        },
        is_public: {
          sent: testData.is_public,
          before: beforeProfile.is_public,
          after: afterProfile.is_public,
          changed: beforeProfile.is_public !== afterProfile.is_public,
          savedCorrectly: afterProfile.is_public === testData.is_public
        }
      };


      setTestResult({
        success: true,
        message: 'Profile fields test completed',
        beforeProfile,
        sentData: testData,
        updateResponse,
        afterProfile,
        fieldComparison,
        summary: {
          bioSaved: fieldComparison.bio.savedCorrectly,
          researchInterestsSaved: fieldComparison.research_interests.savedCorrectly,
          isPublicSaved: fieldComparison.is_public.savedCorrectly
        }
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: `Profile fields test failed: ${error.message}`,
        error: error.response?.data || error.message,
        requestData: {
          bio: values.bio,
          research_interests: values.research_interests,
          is_public: values.is_public
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const testQuickFields = async () => {
    const quickTestData = {
      bio: 'Quick test bio - ' + new Date().toLocaleTimeString(),
      research_interests: 'Quick test research interests - ' + new Date().toLocaleTimeString(),
      is_public: true
    };
    
    await testSpecificFields(quickTestData);
  };

  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Profile Fields Issue Debug</Title>
        </Space>
      }
      style={{ margin: '20px', maxWidth: '1000px', border: '2px solid #ff4d4f' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Testing Specific Profile Fields Issue"
          description="This component tests the exact fields that are not saving: bio, research_interests, and is_public"
          type="warning"
          showIcon
        />

        <Button 
          type="primary" 
          onClick={testQuickFields}
          loading={loading}
          icon={<ExperimentOutlined />}
          danger
        >
          Quick Test Problematic Fields
        </Button>

        <Card title="Custom Test" size="small">
          <Form form={form} onFinish={testSpecificFields} layout="vertical">
            <Form.Item 
              name="bio" 
              label="Bio (نبذة تعريفية)"
            >
              <TextArea rows={3} placeholder="Enter test bio..." />
            </Form.Item>
            
            <Form.Item 
              name="research_interests" 
              label="Research Interests (الاهتمامات البحثية)"
            >
              <TextArea rows={3} placeholder="Enter test research interests..." />
            </Form.Item>
            
            <Form.Item 
              name="is_public" 
              label="Is Public (الوضع العام)"
              valuePropName="checked"
            >
              <Switch checkedChildren="Public" unCheckedChildren="Private" />
            </Form.Item>
            
            <Form.Item>
              <Button type="default" htmlType="submit" loading={loading}>
                Test Custom Values
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {testResult && (
          <Alert
            message={testResult.success ? "Profile Fields Test Results" : "Profile Fields Test Failed"}
            description={
              <div>
                <Text>{testResult.message}</Text>
                
                {testResult.summary && (
                  <div style={{ marginTop: '10px' }}>
                    <Text strong>Field Save Results:</Text>
                    <ul>
                      <li style={{ color: testResult.summary.bioSaved ? 'green' : 'red' }}>
                        Bio: {testResult.summary.bioSaved ? '✅ Saved correctly' : '❌ Not saved'}
                      </li>
                      <li style={{ color: testResult.summary.researchInterestsSaved ? 'green' : 'red' }}>
                        Research Interests: {testResult.summary.researchInterestsSaved ? '✅ Saved correctly' : '❌ Not saved'}
                      </li>
                      <li style={{ color: testResult.summary.isPublicSaved ? 'green' : 'red' }}>
                        Is Public: {testResult.summary.isPublicSaved ? '✅ Saved correctly' : '❌ Not saved'}
                      </li>
                    </ul>
                  </div>
                )}
                
                {testResult.fieldComparison && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>🔍 Detailed Field Comparison</summary>
                    <table style={{ fontSize: '10px', width: '100%', marginTop: '8px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Field</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Sent</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Before</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>After</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Changed?</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Saved Correctly?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(testResult.fieldComparison).map(([field, data]) => (
                          <tr key={field}>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{field}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{String(data.sent)}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{String(data.before) || 'null'}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{String(data.after) || 'null'}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd', color: data.changed ? 'green' : 'red' }}>
                              {data.changed ? '✅' : '❌'}
                            </td>
                            <td style={{ padding: '4px', border: '1px solid #ddd', color: data.savedCorrectly ? 'green' : 'red' }}>
                              {data.savedCorrectly ? '✅' : '❌'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
                
                {testResult.sentData && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>📤 Data Sent to Backend</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '150px'
                    }}>
                      {JSON.stringify(testResult.sentData, null, 2)}
                    </pre>
                  </details>
                )}
                
                {testResult.updateResponse && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>📥 Backend Response (Status 200)</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '150px'
                    }}>
                      {JSON.stringify(testResult.updateResponse, null, 2)}
                    </pre>
                  </details>
                )}
                
                {testResult.afterProfile && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>🔍 Profile After Update (Re-fetched)</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '150px'
                    }}>
                      {JSON.stringify(testResult.afterProfile, null, 2)}
                    </pre>
                  </details>
                )}
                
                {testResult.error && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>❌ Error Details</summary>
                    <Text code style={{ fontSize: '10px', color: 'red' }}>
                      {JSON.stringify(testResult.error, null, 2)}
                    </Text>
                  </details>
                )}
              </div>
            }
            type={testResult.success ? 'info' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            style={{ marginTop: '10px' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default ProfileFieldsIssueDebug;
