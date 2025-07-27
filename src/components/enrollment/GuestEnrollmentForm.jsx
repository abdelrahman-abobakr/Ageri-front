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

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrors({});

    try {
      // Validate data
      const validation = EnrollmentService.validateEnrollmentData(values);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Submit enrollment
      const result = await EnrollmentService.enrollInCourse(course.id, values);
      
      message.success('تم التسجيل بنجاح!');
      
      // Call success callback with enrollment data
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      message.error(error.message || 'فشل في التسجيل');
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
              help={errors.email}
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

        {/* Important Notice */}
        <Alert
          message="تنبيه مهم"
          description="لن يتم إرسال رسالة تأكيد عبر البريد الإلكتروني. سيتم عرض جميع تفاصيل التسجيل على الشاشة بعد إتمام العملية. يرجى حفظ هذه المعلومات للرجوع إليها لاحقاً."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* Test Backend Button */}
        <Form.Item>
          <Button
            type="default"
            onClick={async () => {
              try {
                console.log('🧪 Testing backend endpoint...');
                const testUrl = `http://localhost:8000/api/training/courses/${course.id}/enroll/`;
                console.log('🧪 Test URL:', testUrl);

                // Test with a simple GET first to see if endpoint exists
                const response = await fetch(testUrl.replace('/enroll/', '/'), {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                });

                console.log('🧪 Course endpoint status:', response.status);

                if (response.status === 200) {
                  message.success('✅ Backend is reachable');
                } else {
                  message.error(`❌ Backend returned: ${response.status}`);
                }
              } catch (error) {
                console.error('🧪 Backend test failed:', error);
                message.error('❌ Cannot reach backend');
              }
            }}
            style={{ marginBottom: '16px' }}
          >
            اختبار الاتصال بالخادم
          </Button>
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
