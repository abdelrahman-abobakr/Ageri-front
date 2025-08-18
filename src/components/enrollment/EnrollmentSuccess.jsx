import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Descriptions, 
  Space,
  Divider,
  Tag,
  Alert
} from 'antd';
import { 
  CheckCircleOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EnrollmentSuccess = ({ enrollment, course, onBackToCourses }) => {

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleSaveInfo = () => {
    const enrollmentInfo = `
تأكيد التسجيل في الدورة التدريبية

المشارك: ${enrollment.full_name || `${enrollment.first_name} ${enrollment.last_name}`}
البريد الإلكتروني: ${enrollment.participant_email || enrollment.email}
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

تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
    `;

    const blob = new Blob([enrollmentInfo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enrollment_confirmation.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'قيد الانتظار' },
      paid: { color: 'green', text: 'مدفوع' },
      failed: { color: 'red', text: 'فشل' },
      refunded: { color: 'blue', text: 'مسترد' }
    };
    const config = statusConfig[status] || { color: 'default', text: status || 'غير محدد' };
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



      <Row gutter={[16, 16]}>
        {/* Participant Information */}
        <Col xs={24} lg={12}>
          <Card title="👤 معلومات المشارك" className="info-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="الاسم">
                {enrollment.full_name || `${enrollment.first_name} ${enrollment.last_name}`}
              </Descriptions.Item>
              <Descriptions.Item label="البريد الإلكتروني">
                {enrollment.participant_email || enrollment.email}
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



       {/* Action Buttons */}
      <Card className="actions-card">
        <Space size="large" wrap className="action-buttons">
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
        </Row>
      </Card>

    </div>
  );
};

export default EnrollmentSuccess;
