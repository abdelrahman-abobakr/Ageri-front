import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  Spin, 
  Row, 
  Col,
  Descriptions,
  Tag,
  Divider,
  message
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { EnrollmentService } from '../../services';
import EnrollmentSuccess from '../../components/enrollment/EnrollmentSuccess';

const { Title, Text, Paragraph } = Typography;

const EnrollmentLookupPage = () => {
  const [enrollmentToken, setEnrollmentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!enrollmentToken.trim()) {
      message.error('يرجى إدخال رقم التسجيل');
      return;
    }

    setLoading(true);
    setError('');
    setEnrollment(null);
    setCourse(null);

    try {
      const result = await EnrollmentService.lookupEnrollment(enrollmentToken.trim());
      
      // Format the enrollment data
      const formattedEnrollment = EnrollmentService.formatEnrollmentData(result.enrollment);
      
      setEnrollment(formattedEnrollment);
      setCourse(result.course);
      
      message.success('تم العثور على التسجيل');
    } catch (error) {
      console.error('Lookup error:', error);
      setError(error.message || 'فشل في البحث عن التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'في الانتظار' },
      approved: { color: 'green', text: 'مقبول' },
      rejected: { color: 'red', text: 'مرفوض' },
      completed: { color: 'blue', text: 'مكتمل' },
      cancelled: { color: 'default', text: 'ملغي' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      not_required: { color: 'green', text: 'غير مطلوب' },
      pending: { color: 'orange', text: 'في الانتظار' },
      paid: { color: 'green', text: 'مدفوع' },
      partial: { color: 'blue', text: 'مدفوع جزئياً' },
      refunded: { color: 'purple', text: 'مسترد' },
      overdue: { color: 'red', text: 'متأخر' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // If enrollment found, show detailed view
  if (enrollment && course) {
    return (
      <div className="enrollment-lookup-container">
        <Card className="lookup-header">
          <Button 
            onClick={() => {
              setEnrollment(null);
              setCourse(null);
              setEnrollmentToken('');
            }}
            style={{ marginBottom: '16px' }}
          >
            ← البحث عن تسجيل آخر
          </Button>
          
          <Title level={3}>تفاصيل التسجيل</Title>
          <Text type="secondary">رقم التسجيل: {enrollment.enrollment_token}</Text>
        </Card>

        <EnrollmentSuccess 
          enrollment={enrollment}
          course={course}
          onBackToCourses={() => window.location.href = '/courses'}
        />
      </div>
    );
  }

  return (
    <div className="enrollment-lookup-page">
      <div className="lookup-container">
        <Card className="lookup-card">
          <div className="lookup-header">
            <EyeOutlined className="lookup-icon" />
            <Title level={2}>البحث عن التسجيل</Title>
            <Paragraph type="secondary">
              أدخل رقم التسجيل الخاص بك للاطلاع على تفاصيل التسجيل وحالة الدورة
            </Paragraph>
          </div>

          <div className="lookup-form">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={16}>
                <Input
                  size="large"
                  placeholder="أدخل رقم التسجيل (مثال: abc123-def456-ghi789)"
                  value={enrollmentToken}
                  onChange={(e) => setEnrollmentToken(e.target.value)}
                  onKeyPress={handleKeyPress}
                  prefix={<SearchOutlined />}
                  disabled={loading}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleLookup}
                  loading={loading}
                  disabled={loading || !enrollmentToken.trim()}
                  block
                >
                  {loading ? 'جاري البحث...' : 'بحث'}
                </Button>
              </Col>
            </Row>

            {error && (
              <Alert
                message="خطأ في البحث"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </div>

          <Divider />

          <div className="lookup-help">
            <Title level={4}>كيفية العثور على رقم التسجيل؟</Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card size="small" className="help-card">
                  <Title level={5}>📧 من صفحة التأكيد</Title>
                  <Text>
                    رقم التسجيل يظهر في صفحة التأكيد بعد إتمام التسجيل مباشرة.
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12}>
                <Card size="small" className="help-card">
                  <Title level={5">💾 من الملف المحفوظ</Title>
                  <Text>
                    إذا قمت بحفظ معلومات التسجيل، ستجد الرقم في الملف المحفوظ.
                  </Text>
                </Card>
              </Col>
            </Row>

            <Alert
              message="لا تتذكر رقم التسجيل؟"
              description={
                <div>
                  <Text>تواصل مع الدعم الفني وقدم المعلومات التالية:</Text>
                  <ul>
                    <li>الاسم الكامل</li>
                    <li>البريد الإلكتروني المستخدم في التسجيل</li>
                    <li>اسم الدورة</li>
                    <li>تاريخ التسجيل التقريبي</li>
                  </ul>
                  <Text strong>
                    البريد الإلكتروني: <a href="mailto:support@ageri.org">support@ageri.org</a>
                  </Text>
                  <br />
                  <Text strong>
                    الهاتف: <a href="tel:+201234567890">+20 123 456 7890</a>
                  </Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="quick-actions-card">
          <Title level={4}>إجراءات سريعة</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button 
                block 
                size="large"
                onClick={() => window.location.href = '/courses'}
              >
                🔍 تصفح الدورات
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                block 
                size="large"
                onClick={() => window.location.href = '/'}
              >
                🏠 الصفحة الرئيسية
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                block 
                size="large"
                onClick={() => window.location.href = '/contact'}
              >
                📞 تواصل معنا
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentLookupPage;
