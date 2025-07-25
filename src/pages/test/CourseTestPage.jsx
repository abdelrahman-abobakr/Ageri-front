import React, { useState } from 'react';
import { Button, Card, Row, Col, Typography, Space, message, Spin, Divider } from 'antd';
import { trainingService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const CourseTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testEndpoint = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Testing ${testName}...`);
      const result = await testFunction();
      setResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }));
      message.success(`✅ ${testName} - Success`);
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message }
      }));
      message.error(`❌ ${testName} - Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    
    // Test 1: Get all courses
    await testEndpoint('Get All Courses', () => 
      trainingService.getCourses()
    );

    // Test 2: Get courses with filters
    await testEndpoint('Get Filtered Courses', () => 
      trainingService.getCourses({
        search: 'test',
        training_type: 'online',
        level: 'beginner',
        status: 'published'
      })
    );

    // Test 3: Get featured courses
    await testEndpoint('Get Featured Courses', () => 
      trainingService.getFeaturedCourses()
    );

    // Test 4: Get upcoming courses
    await testEndpoint('Get Upcoming Courses', () => 
      trainingService.getUpcomingCourses()
    );

    // Test 5: Create a test course (matching guide structure)
    await testEndpoint('Create Course', () =>
      trainingService.createCourse({
        course_name: 'Test Course - Guide Structure',
        course_code: 'TEST001',
        instructor: 'Test Instructor',
        cost: 100.00,
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        registration_deadline: '2025-02-25',
        training_hours: 20,
        description: 'Detailed description of the test course following the guide structure',
        max_participants: 25,
        type: 'course',
        status: 'draft',
        is_featured: false,
        is_public: true,
        prerequisites: 'Basic knowledge of agriculture',
        materials_provided: 'Course materials and certificates',
        tags: 'agriculture, test, course'
      })
    );
  };

  const renderTestResult = (testName, result) => {
    if (!result) return null;

    return (
      <Card 
        key={testName}
        title={testName}
        size="small"
        style={{ marginBottom: '16px' }}
        extra={
          <Text type={result.success ? 'success' : 'danger'}>
            {result.success ? '✅ Success' : '❌ Failed'}
          </Text>
        }
      >
        {result.success ? (
          <div>
            <Text type="secondary">Data received:</Text>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '12px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ) : (
          <Text type="danger">Error: {result.error}</Text>
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Course API Testing Page</Title>
      <Paragraph>
        This page tests all the course-related API endpoints to ensure they're working correctly.
      </Paragraph>

      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            type="primary" 
            onClick={runAllTests}
            loading={loading}
            size="large"
          >
            Run All Tests
          </Button>
          <Button 
            onClick={() => setResults({})}
            disabled={loading}
          >
            Clear Results
          </Button>
        </Space>
      </Card>

      <Divider>Test Results</Divider>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Running tests...</div>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          {Object.entries(results).map(([testName, result]) => 
            renderTestResult(testName, result)
          )}
        </Col>
      </Row>

      {Object.keys(results).length > 0 && (
        <Card title="Summary" style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Total Tests: </Text>
              <Text>{Object.keys(results).length}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Passed: </Text>
              <Text type="success">
                {Object.values(results).filter(r => r.success).length}
              </Text>
              <Text> / Failed: </Text>
              <Text type="danger">
                {Object.values(results).filter(r => !r.success).length}
              </Text>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default CourseTestPage;
