import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Descriptions, Input, Form, message } from 'antd';
import { UserOutlined, ExperimentOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';

const { Title, Text, Paragraph } = Typography;

const ProfileFieldsDebug = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [form] = Form.useForm();

  const testProfileFields = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // First, get current profile
      const profileResponse = await profileService.getMyProfile();
      setCurrentProfile(profileResponse);

      // Test updating with different field combinations
      const testFields = {
        // Core fields
        bio: 'Test bio update',
        research_interests: 'Test research interests',
        orcid_id: '0000-0000-0000-0000',
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/test',
        google_scholar: 'https://scholar.google.com/citations?user=test',
        researchgate: 'https://researchgate.net/profile/test',
        is_public: true,
        
        // Additional fields to test
        phone: '+966501234567',
        institution: 'Test University',
        department: 'Test Department',
        position: 'Test Position',
        academic_degree: 'PhD',
        specialization: 'Test Specialization',
        
        // Other possible fields
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        profile_picture: null,
        avatar: null,
        title: 'Dr.',
        affiliation: 'Test Affiliation',
        research_areas: 'Test Research Areas',
        publications_count: 0,
        h_index: 0,
        citations_count: 0,
        location: 'Test Location',
        country: 'Saudi Arabia',
        city: 'Riyadh'
      };

      const updateResponse = await profileService.updateMyProfile(testFields);
      
      setTestResult({
        success: true,
        message: 'Profile update test successful',
        sentFields: Object.keys(testFields),
        receivedData: updateResponse,
        supportedFields: Object.keys(updateResponse).filter(key => 
          testFields.hasOwnProperty(key) && updateResponse[key] !== null
        )
      });
          } catch (error) {
      setTestResult({
        success: false,
        message: `Profile update test failed: ${error.message}`,
        error: error.response?.data || error.message,
        sentFields: Object.keys({
          bio: 'Test bio update',
          research_interests: 'Test research interests',
          phone: '+966501234567',
          institution: 'Test University'
        })
      });
    } finally {
      setLoading(false);
    }
  };

  const testSingleField = async (values) => {
    setLoading(true);
    try {
      const fieldName = values.fieldName;
      const fieldValue = values.fieldValue;
      const model = values.model || 'UserProfile'; // Default to UserProfile


      // Get current data first
      const beforeProfile = await profileService.getMyProfile();
      const beforeUser = await authService.getCurrentUser();

      const beforeValue = model === 'User' ? beforeUser[fieldName] : beforeProfile[fieldName];

      const testData = { [fieldName]: fieldValue };

      let response;
      if (model === 'User') {
        response = await authService.updateUserFields(testData);
      } else {
        response = await profileService.updateMyProfile(testData);
      }

      // Get data again to verify
      const afterProfile = await profileService.getMyProfile();
      const afterUser = await authService.getCurrentUser();

      const afterValue = model === 'User' ? afterUser[fieldName] : afterProfile[fieldName];

      const wasUpdated = afterValue === fieldValue;

      if (wasUpdated) {
        message.success(`✅ Field '${fieldName}' updated successfully in ${model} model!`);
      } else {
        message.warning(`⚠️ Field '${fieldName}' was sent to ${model} model but not saved. Check if backend supports this field.`);
      }

      // Update current profile display
      setCurrentProfile(afterProfile);

    } catch (error) {
      message.error(`❌ Failed to update field '${values.fieldName}': ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <Title level={4} style={{ margin: 0 }}>Profile Fields Debug</Title>
        </Space>
      }
      style={{ margin: '20px', maxWidth: '1000px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          This component tests which profile fields are supported by the backend API.
        </Paragraph>

        {currentProfile && (
          <Descriptions title="Current Profile Data" bordered size="small">
            {Object.entries(currentProfile).map(([key, value]) => (
              <Descriptions.Item key={key} label={key} span={3}>
                <Text code style={{ fontSize: '10px' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Text>
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}

        <Space>
          <Button
            type="primary"
            onClick={testProfileFields}
            loading={loading}
            icon={<ExperimentOutlined />}
          >
            Test All Profile Fields
          </Button>
        </Space>

        <Card title="Test Single Field" size="small">
          <Form form={form} onFinish={testSingleField} layout="inline">
            <Form.Item
              name="fieldName"
              rules={[{ required: true, message: 'Field name required' }]}
            >
              <Input placeholder="Field name (e.g., phone)" />
            </Form.Item>
            <Form.Item
              name="fieldValue"
              rules={[{ required: true, message: 'Field value required' }]}
            >
              <Input placeholder="Field value" />
            </Form.Item>
            <Form.Item>
              <Button type="default" htmlType="submit" loading={loading}>
                Test Field
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: '12px' }}>
            <Text strong>Quick Tests:</Text>
            <Space wrap style={{ marginTop: '8px' }}>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'phone', fieldValue: '+966501234567', model: 'User' })}
                loading={loading}
                style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}
              >
                Test Phone (User)
              </Button>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'institution', fieldValue: 'Test University', model: 'User' })}
                loading={loading}
                style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}
              >
                Test Institution (User)
              </Button>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'department', fieldValue: 'Test Department', model: 'User' })}
                loading={loading}
                style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}
              >
                Test Department (User)
              </Button>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'position', fieldValue: 'Test Position', model: 'UserProfile' })}
                loading={loading}
                style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}
              >
                Test Position (Profile)
              </Button>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'academic_degree', fieldValue: 'PhD', model: 'UserProfile' })}
                loading={loading}
                style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}
              >
                Test Degree (Profile)
              </Button>
              <Button
                size="small"
                onClick={() => testSingleField({ fieldName: 'specialization', fieldValue: 'Test Specialization', model: 'UserProfile' })}
                loading={loading}
                style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}
              >
                Test Specialization (Profile)
              </Button>
            </Space>
          </div>
        </Card>

        {testResult && (
          <Alert
            message={testResult.success ? "Profile Fields Test Result" : "Profile Fields Test Failed"}
            description={
              <div>
                <Text>{testResult.message}</Text>
                
                {testResult.sentFields && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>Sent Fields ({testResult.sentFields.length})</summary>
                    <Text code style={{ fontSize: '10px' }}>
                      {testResult.sentFields.join(', ')}
                    </Text>
                  </details>
                )}
                
                {testResult.supportedFields && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>Supported Fields ({testResult.supportedFields.length})</summary>
                    <Text code style={{ fontSize: '10px', color: 'green' }}>
                      {testResult.supportedFields.join(', ')}
                    </Text>
                  </details>
                )}
                
                {testResult.receivedData && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>Received Response Data</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(testResult.receivedData, null, 2)}
                    </pre>
                  </details>
                )}
                
                {testResult.error && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>Error Details</summary>
                    <Text code style={{ fontSize: '10px', color: 'red' }}>
                      {JSON.stringify(testResult.error, null, 2)}
                    </Text>
                  </details>
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

export default ProfileFieldsDebug;
