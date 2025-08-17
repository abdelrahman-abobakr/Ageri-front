import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Typography, 
  message, 
  Spin,
  Alert,
  Divider
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import EnrollmentService from '../../services/enrollmentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const GuestEnrollmentForm = ({ course, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Education level options
  const educationLevels = [
    { value: 'high_school', label: 'الثانوية العامة' },
    { value: 'bachelor', label: 'بكالوريوس' },
    { value: 'master', label: 'ماجستير' },
    { value: 'phd', label: 'دكتوراه' },
    { value: 'other', label: 'أخرى' }
  ];

  // Experience level options
  const experienceLevels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  // Enhanced handleSubmit function with better error handling
  const handleSubmit = async (values) => {
    setLoading(true);
    setErrors({});

    try {
      const validation = EnrollmentService.validateEnrollmentData(values);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const result = await EnrollmentService.enrollInCourse(course.id, values);
      message.success('تم التسجيل بنجاح!');
      if (onSuccess) onSuccess(result);

    } catch (error) {
      console.error('Enrollment error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle 400 Bad Request with field errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.log('400 Error data:', errorData);

        // Transform backend errors to match form expectations
        const formattedErrors = {};

        // Handle different error formats
        if (typeof errorData === 'object') {
          // Check if errors are nested in a 'details' object
          let errorsToProcess = errorData;
          if (errorData.details && typeof errorData.details === 'object') {
            console.log('Found nested errors in details:', errorData.details);
            errorsToProcess = errorData.details;
          }

          Object.keys(errorsToProcess).forEach(key => {
            console.log(`Processing error for field ${key}:`, errorsToProcess[key]);

            // Skip non-field error keys like 'error' or 'message'
            if (key === 'error' || key === 'message') {
              return;
            }

            // If error is an array, join messages
            if (Array.isArray(errorsToProcess[key])) {
              formattedErrors[key] = errorsToProcess[key].join(', ');
            }
            // If error is a string
            else if (typeof errorsToProcess[key] === 'string') {
              formattedErrors[key] = errorsToProcess[key];
            }
            // If error is an object (nested errors), try to extract field errors
            else if (typeof errorsToProcess[key] === 'object') {
              // Try to extract field-specific errors from nested object
              const nestedErrors = errorsToProcess[key];
              Object.keys(nestedErrors).forEach(nestedKey => {
                if (Array.isArray(nestedErrors[nestedKey])) {
                  formattedErrors[nestedKey] = nestedErrors[nestedKey].join(', ');
                } else if (typeof nestedErrors[nestedKey] === 'string') {
                  formattedErrors[nestedKey] = nestedErrors[nestedKey];
                }
              });
            }
          });
        }

        console.log('Formatted errors:', formattedErrors);
        setErrors(formattedErrors);

        // Show general error message
        if (Object.keys(formattedErrors).length === 0) {
          // No field-specific errors, show general message
          const generalMessage = errorData?.error || errorData?.message || errorData?.detail || 'يوجد أخطاء في البيانات المدخلة';
          message.error(generalMessage);
        } else {
          // Show field-specific error message
          message.error('يرجى تصحيح الأخطاء المبينة في النموذج');

          // Also show the general error if it exists
          if (errorData?.error && errorData.error !== 'Invalid enrollment data') {
            message.warning(errorData.error);
          }
        }
      }
      // Handle other error cases
      else {
        console.error('Non-400 error:', error);
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'حدث خطأ أثناء التسجيل';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="enrollment-form-card">
      <div className="enrollment-header">
        <Title level={3}>التسجيل في الدورة</Title>
        <Text type="secondary">
          يرجى ملء البيانات التالية للتسجيل في دورة "{course.course_name}"
        </Text>
      </div>

      {/* Course Summary */}
      <Alert
        message="معلومات الدورة"
        description={
          <div className="course-summary">
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong>اسم الدورة:</Text> {course.course_name}
              </Col>
              <Col span={12}>
                <Text strong>كود الدورة:</Text> {course.course_code}
              </Col>
              <Col span={12}>
                <Text strong>المدرب:</Text> {course.instructor}
              </Col>
              <Col span={12}>
                <Text strong>المدة:</Text> {course.training_hours} ساعة
              </Col>
              <Col span={12}>
                <Text strong>تاريخ البداية:</Text> {new Date(course.start_date).toLocaleDateString('ar-EG')}
              </Col>
              <Col span={12}>
                <Text strong>التكلفة:</Text> {course.cost === 0 ? 'مجاني' : `${course.cost} جنيه`}
              </Col>
            </Row>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          experience_level: 'beginner'
        }}
      >
        {/* Personal Information */}
        <Divider orientation="right">المعلومات الشخصية</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="الاسم الأول"
              name="first_name"
              rules={[{ required: true, message: 'يرجى إدخال الاسم الأول' }]}
              validateStatus={errors.first_name ? 'error' : ''}
              help={errors.first_name}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="الاسم الأول"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="الاسم الأخير"
              name="last_name"
              rules={[{ required: true, message: 'يرجى إدخال الاسم الأخير' }]}
              validateStatus={errors.last_name ? 'error' : ''}
              help={errors.last_name}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="الاسم الأخير"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="البريد الإلكتروني"
              name="email"
              rules={[
                { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
              ]}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email || ''}  // Ensure empty string if no error
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="example@email.com"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="رقم الهاتف"
              name="phone"
              validateStatus={errors.phone ? 'error' : ''}
              help={errors.phone}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="+20 123 456 7890"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Professional Information */}
        <Divider orientation="right">المعلومات المهنية</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="المؤسسة/الشركة"
              name="organization"
            >
              <Input 
                prefix={<BankOutlined />} 
                placeholder="اسم المؤسسة أو الشركة"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="المسمى الوظيفي"
              name="job_title"
            >
              <Input 
                placeholder="المسمى الوظيفي الحالي"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Educational Background */}
        <Divider orientation="right">الخلفية التعليمية</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="المستوى التعليمي"
              name="education_level"
            >
              <Select 
                placeholder="اختر المستوى التعليمي"
                size="large"
              >
                {educationLevels.map(level => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="مستوى الخبرة"
              name="experience_level"
              rules={[{ required: true, message: 'يرجى اختيار مستوى الخبرة' }]}
            >
              <Select 
                placeholder="اختر مستوى الخبرة"
                size="large"
              >
                {experienceLevels.map(level => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Additional Notes */}
        <Form.Item
          label="ملاحظات إضافية"
          name="additional_notes"
        >
          <TextArea 
            rows={3}
            placeholder="أي معلومات إضافية تود مشاركتها..."
            maxLength={500}
            showCount
          />
        </Form.Item>





        {/* Form Actions */}
        <Form.Item>
          <Row gutter={16} justify="end">
            <Col>
              <Button
                size="large"
                onClick={handleCancel}
                disabled={loading}
              >
                إلغاء
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'جاري التسجيل...' : 'تسجيل في الدورة'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default GuestEnrollmentForm;
