import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Descriptions, 
  Tag, 
  Space,
  Divider,
  message
} from 'antd';
import { 
  CheckCircleOutlined, 
  CopyOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EnrollmentSuccess = ({ enrollment, course, onBackToCourses }) => {
  
  const handleCopyEnrollmentId = () => {
    navigator.clipboard.writeText(enrollment.enrollment_token);
    message.success('تم نسخ رقم التسجيل');
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleSaveInfo = () => {
    const enrollmentInfo = `
تأكيد التسجيل في الدورة التدريبية

رقم التسجيل: ${enrollment.enrollment_token}
المشارك: ${enrollment.full_name}
البريد الإلكتروني: ${enrollment.participant_email}
الهاتف: ${enrollment.phone || 'غير محدد'}
المؤسسة: ${enrollment.organization || 'غير محدد'}

معلومات الدورة:
- اسم الدورة: ${course.course_name}
- كود الدورة: ${course.course_code}
- المدرب: ${course.instructor}
- تاريخ البداية: ${new Date(course.start_date).toLocaleDateString('ar-EG')}
- تاريخ النهاية: ${new Date(course.end_date).toLocaleDateString('ar-EG')}
- المدة: ${course.training_hours} ساعة
- التكلفة: ${course.cost === 0 ? 'مجاني' : course.cost + ' جنيه'}

معلومات الدفع:
- المبلغ المطلوب: ${enrollment.amount_due} جنيه
- حالة الدفع: ${enrollment.payment_status}

ملاحظات مهمة:
- احفظ رقم التسجيل: ${enrollment.enrollment_token}
- تبدأ الدورة في ${new Date(course.start_date).toLocaleDateString('ar-EG')}
- للاستفسارات تواصل مع الدعم الفني

تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
    `;

    const blob = new Blob([enrollmentInfo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enrollment_${enrollment.enrollment_token}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      not_required: { color: 'green', text: 'غير مطلوب' },
      pending: { color: 'orange', text: 'في الانتظار' },
      paid: { color: 'green', text: 'مدفوع' },
      partial: { color: 'blue', text: 'مدفوع جزئياً' },
      overdue: { color: 'red', text: 'متأخر' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div className="enrollment-success-container">
      {/* Success Header */}
      <Card className="success-header-card">
        <div className="success-header">
          <CheckCircleOutlined className="success-icon" />
          <Title level={2} className="success-title">
            تم التسجيل بنجاح!
          </Title>
          <Paragraph className="success-subtitle">
            تم تسجيلك بنجاح في الدورة التدريبية
          </Paragraph>
        </div>


      </Card>

      {/* Enrollment ID Card */}
      <Card className="enrollment-id-card">
        <Title level={4}>🎫 رقم التسجيل الخاص بك</Title>
        <div className="enrollment-id-display">
          <Text className="enrollment-id" copyable={{ text: enrollment.enrollment_token }}>
            {enrollment.enrollment_token}
          </Text>
          <Button 
            icon={<CopyOutlined />} 
            onClick={handleCopyEnrollmentId}
            type="primary"
            ghost
          >
            نسخ
          </Button>
        </div>
        <Text type="secondary" className="id-note">
          احتفظ بهذا الرقم بأمان - ستحتاجه لتتبع حالة التسجيل
        </Text>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Participant Information */}
        <Col xs={24} lg={12}>
          <Card title="👤 معلومات المشارك" className="info-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="الاسم">
                {enrollment.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="البريد الإلكتروني">
                {enrollment.participant_email}
              </Descriptions.Item>
              <Descriptions.Item label="الهاتف">
                {enrollment.phone || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="المؤسسة">
                {enrollment.organization || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="المسمى الوظيفي">
                {enrollment.job_title || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="تاريخ التسجيل">
                {new Date(enrollment.enrollment_date).toLocaleDateString('ar-EG')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Course Information */}
        <Col xs={24} lg={12}>
          <Card title="📚 معلومات الدورة" className="info-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="اسم الدورة">
                {course.course_name}
              </Descriptions.Item>
              <Descriptions.Item label="كود الدورة">
                {course.course_code}
              </Descriptions.Item>
              <Descriptions.Item label="المدرب">
                {course.instructor}
              </Descriptions.Item>
              <Descriptions.Item label="المدة">
                {course.training_hours} ساعة
              </Descriptions.Item>
              <Descriptions.Item label="تاريخ البداية">
                {new Date(course.start_date).toLocaleDateString('ar-EG')}
              </Descriptions.Item>
              <Descriptions.Item label="تاريخ النهاية">
                {new Date(course.end_date).toLocaleDateString('ar-EG')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Payment Information */}
      {course.cost > 0 && (
        <Card title="💰 معلومات الدفع" className="payment-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="payment-item">
                <Text type="secondary">المبلغ المطلوب:</Text>
                <Title level={4} className="amount">{enrollment.amount_due} جنيه</Title>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="payment-item">
                <Text type="secondary">حالة الدفع:</Text>
                <div>{getPaymentStatusTag(enrollment.payment_status)}</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="payment-item">
                <Text type="secondary">المبلغ المتبقي:</Text>
                <Title level={4} className="balance">
                  {enrollment.amount_due - enrollment.amount_paid} جنيه
                </Title>
              </div>
            </Col>
          </Row>
          
          <Alert
            message="معلومات الدفع"
            description="يمكن إتمام الدفع من خلال إدارة الدورة. تواصل مع الدعم الفني للحصول على تعليمات الدفع."
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Card>
      )}

      {/* Next Steps */}
      <Card title="📋 الخطوات التالية" className="next-steps-card">
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <Title level={5}>احفظ معلوماتك</Title>
              <Text>استخدم الأزرار أدناه لحفظ أو طباعة تفاصيل التسجيل.</Text>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <Title level={5}>ضع علامة في التقويم</Title>
              <Text>تبدأ الدورة في {new Date(course.start_date).toLocaleDateString('ar-EG')}</Text>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <Title level={5}>استعد للدورة</Title>
              <Text>راجع أي متطلبات مسبقة واجمع المواد المطلوبة.</Text>
            </div>
          </div>
          
          {course.cost > 0 && (
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <Title level={5}>أكمل الدفع</Title>
                <Text>تواصل مع الدعم لترتيب دفع {enrollment.amount_due} جنيه</Text>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="actions-card">
        <Space size="large" wrap className="action-buttons">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            size="large"
            onClick={handleSaveInfo}
          >
            💾 حفظ معلومات التسجيل
          </Button>
          
          <Button 
            icon={<PrinterOutlined />} 
            size="large"
            onClick={handlePrintConfirmation}
          >
            🖨️ طباعة التفاصيل
          </Button>
          
          <Button 
            icon={<HomeOutlined />} 
            size="large"
            onClick={onBackToCourses}
          >
            🔍 تصفح المزيد من الدورات
          </Button>
        </Space>
      </Card>

      {/* Contact Information */}
      <Card title="📞 تحتاج مساعدة؟" className="contact-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div className="contact-item">
              <MailOutlined className="contact-icon" />
              <div>
                <Text strong>البريد الإلكتروني:</Text>
                <br />
                <a href="mailto:support@ageri.org">support@ageri.org</a>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="contact-item">
              <PhoneOutlined className="contact-icon" />
              <div>
                <Text strong>الهاتف:</Text>
                <br />
                <a href="tel:+201234567890">+20 123 456 7890</a>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="contact-item">
              <Text strong>ساعات العمل:</Text>
              <br />
              <Text>الأحد - الخميس، 9 ص - 5 م</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Future Reference */}
      <Card title="🔍 للمراجعة المستقبلية" className="reference-card">
        <Text>
          للاطلاع على حالة التسجيل في المستقبل، قم بزيارة:
        </Text>
        <div className="lookup-url">
          <Text code>/enrollment/{enrollment.enrollment_token}</Text>
        </div>
      </Card>
    </div>
  );
};

export default EnrollmentSuccess;
