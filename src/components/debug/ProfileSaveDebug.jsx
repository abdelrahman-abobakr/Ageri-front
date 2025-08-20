import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Descriptions, message } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';

const { Title, Text } = Typography;

const ProfileSaveDebug = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testProfileSave = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      
      // Step 1: Get current profile
      const currentProfile = await profileService.getMyProfile();

      // Step 2: Test updating with split data (User vs UserProfile models)
      const userTestData = {
        phone: '+966501234567',
        institution: 'Test University Updated',
        department: 'Test Department Updated'
      };

      const profileTestData = {
        bio: 'Test bio updated at ' + new Date().toLocaleTimeString(),
        research_interests: 'Test research interests updated',
        position: 'Test Position Updated',
        academic_degree: 'PhD',
        specialization: 'Test Specialization Updated'
      };

      const userUpdateResponse = await authService.updateUserFields(userTestData);

      const profileUpdateResponse = await profileService.updateMyProfile(profileTestData);

      // Step 3: Get profile again to verify save
      const verifyProfile = await profileService.getMyProfile();

      // Step 4: Compare what was sent vs what was saved
      const allTestData = { ...userTestData, ...profileTestData };
      const sentFields = Object.keys(allTestData);

      // Check both user and profile data
      const savedFields = sentFields.filter(field => {
        if (userTestData[field]) {
          return userUpdateResponse[field] && userUpdateResponse[field] === userTestData[field];
        } else {
          return verifyProfile[field] && verifyProfile[field] === profileTestData[field];
        }
      });

      const notSavedFields = sentFields.filter(field => {
        if (userTestData[field]) {
          return !userUpdateResponse[field] || userUpdateResponse[field] !== userTestData[field];
        } else {
          return !verifyProfile[field] || verifyProfile[field] !== profileTestData[field];
        }
      });

      // Detailed field analysis
      const fieldAnalysis = sentFields.map(field => {
        const isUserField = userTestData.hasOwnProperty(field);
        const sentValue = allTestData[field];
        const receivedValue = isUserField ? userUpdateResponse[field] : verifyProfile[field];

        return {
          field,
          model: isUserField ? 'User' : 'UserProfile',
          sent: sentValue,
          received: receivedValue,
          saved: receivedValue === sentValue,
          exists: isUserField ? userUpdateResponse.hasOwnProperty(field) : verifyProfile.hasOwnProperty(field),
          isEmpty: !receivedValue || receivedValue === ''
        };
      });

      setTestResult({
        success: true,
        message: 'Profile save test completed',
        currentProfile,
        sentUserData: userTestData,
        sentProfileData: profileTestData,
        userUpdateResponse,
        profileUpdateResponse,
        verifiedProfile: verifyProfile,
        savedFields,
        notSavedFields,
        fieldAnalysis,
        summary: {
          totalSent: sentFields.length,
          successfullySaved: savedFields.length,
          notSaved: notSavedFields.length
        }
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: `Profile save test failed: ${error.message}`,
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <Title level={4} style={{ margin: 0 }}>Profile Save Debug</Title>
        </Space>
      }
      style={{ margin: '20px', maxWidth: '1000px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          This component tests the profile save functionality to identify where the issue occurs.
        </Text>

        <Button 
          type="primary" 
          onClick={testProfileSave}
          loading={loading}
          icon={<ExperimentOutlined />}
        >
          Test Profile Save Process
        </Button>

        {testResult && (
          <Alert
            message={testResult.success ? "Profile Save Test Results" : "Profile Save Test Failed"}
            description={
              <div>
                <Text>{testResult.message}</Text>
                
                {testResult.summary && (
                  <div style={{ marginTop: '10px' }}>
                    <Text strong>Summary:</Text>
                    <ul>
                      <li>Total fields sent: {testResult.summary.totalSent}</li>
                      <li style={{ color: 'green' }}>Successfully saved: {testResult.summary.successfullySaved}</li>
                      <li style={{ color: 'red' }}>Not saved: {testResult.summary.notSaved}</li>
                    </ul>
                  </div>
                )}
                
                {testResult.savedFields && testResult.savedFields.length > 0 && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ color: 'green' }}>✅ Successfully Saved Fields ({testResult.savedFields.length})</summary>
                    <Text code style={{ fontSize: '10px', color: 'green' }}>
                      {testResult.savedFields.join(', ')}
                    </Text>
                  </details>
                )}
                
                {testResult.notSavedFields && testResult.notSavedFields.length > 0 && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ color: 'red' }}>❌ Not Saved Fields ({testResult.notSavedFields.length})</summary>
                    <Text code style={{ fontSize: '10px', color: 'red' }}>
                      {testResult.notSavedFields.join(', ')}
                    </Text>
                  </details>
                )}

                {testResult.fieldAnalysis && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>🔍 Detailed Field Analysis</summary>
                    <table style={{ fontSize: '10px', width: '100%', marginTop: '8px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Field</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Model</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Sent</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Received</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Saved?</th>
                          <th style={{ padding: '4px', border: '1px solid #ddd' }}>Exists?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResult.fieldAnalysis.map(analysis => (
                          <tr key={analysis.field}>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{analysis.field}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd', color: analysis.model === 'User' ? 'blue' : 'purple' }}>
                              {analysis.model}
                            </td>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{analysis.sent}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd' }}>{analysis.received || 'null'}</td>
                            <td style={{ padding: '4px', border: '1px solid #ddd', color: analysis.saved ? 'green' : 'red' }}>
                              {analysis.saved ? '✅' : '❌'}
                            </td>
                            <td style={{ padding: '4px', border: '1px solid #ddd', color: analysis.exists ? 'green' : 'red' }}>
                              {analysis.exists ? '✅' : '❌'}
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
                    <summary>📥 Backend Response</summary>
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
                
                {testResult.verifiedProfile && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>🔍 Verified Profile (After Save)</summary>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '150px'
                    }}>
                      {JSON.stringify(testResult.verifiedProfile, null, 2)}
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
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            style={{ marginTop: '10px' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default ProfileSaveDebug;
