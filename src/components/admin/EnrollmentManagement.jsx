import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Tooltip,
  Typography,
  DatePicker,
  Divider,
  Alert,
  App,
  Checkbox
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { EnrollmentService } from '../../services';
import { trainingService } from '../../services/trainingService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const EnrollmentManagement = () => {
  const { modal, message } = App.useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    course: '',
    payment_status: '',
    status: ''
  });
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [paymentForm] = Form.useForm();
  const [exportForm] = Form.useForm();

  useEffect(() => {
    loadEnrollments();
    loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await trainingService.getCourses({ status: 'published' });
      setCourses(response.results || []);
      console.log('✅ Courses loaded for filter:', response.results?.length || 0);
      console.log('✅ Course details:', response.results?.map(c => ({ id: c.id, name: c.course_name || c.title })));
    } catch (error) {
      console.error('Failed to load courses:', error);
      message.error('فشل في تحميل الدورات');
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      console.log('🔄 ===== LOADING ENROLLMENTS =====');
      console.log('🔄 Current filters:', filters);
      console.log('🔄 Course filter specifically:', filters.course);

      const response = await EnrollmentService.getEnrollments(filters);
      console.log('✅ Enrollments response:', response);
      console.log('✅ Total results:', response.count);
      console.log('✅ Results length:', response.results?.length);

      // Debug course information in results
      if (response.results?.length > 0) {
        console.log('✅ Sample enrollment courses:', response.results.slice(0, 3).map(e => ({
          id: e.id,
          course_id: e.course_id || e.course,
          course_title: e.course_title,
          course_name: e.course_name
        })));
      }

      setEnrollments(response.results || []);
      setTotal(response.count || 0);
      console.log('✅ ===== ENROLLMENTS LOADED =====');
    } catch (error) {
      console.error('❌ Failed to load enrollments:', error);

      // Show more specific error message
      if (error.response?.status === 401) {
        message.error('غير مصرح لك بالوصول إلى هذه البيانات. يرجى تسجيل الدخول كمدير.');
      } else if (error.response?.status === 403) {
        message.error('ليس لديك صلاحية للوصول إلى إدارة التسجيلات.');
      } else {
        message.error('فشل في تحميل التسجيلات: ' + (error.message || 'خطأ غير معروف'));
      }
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    console.log('🔄 Filter change:', key, '=', value);
    const newFilters = { ...filters, [key]: value, page: 1 };

    // Remove empty/null values to clean up the filter object
    if (value === null || value === undefined || value === '') {
      delete newFilters[key];
    }

    console.log('🔄 New filters:', newFilters);
    setFilters(newFilters);
  };

  const handleTableChange = (pagination) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      page_size: pagination.pageSize
    }));
  };

  const handleUpdatePayment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    paymentForm.setFieldsValue({
      payment_status: enrollment.payment_status || 'pending',
      payment_method: enrollment.payment_method || '',
      payment_amount: enrollment.payment_amount || '0.00'
    });
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values) => {
    try {
      console.log('🔄 ===== FORM SUBMISSION =====');
      console.log('🔄 Form values (raw):', values);
      console.log('🔄 Form values (stringified):', JSON.stringify(values, null, 2));
      console.log('🔄 Selected enrollment:', selectedEnrollment);
      console.log('🔄 Enrollment ID:', selectedEnrollment.id);
      console.log('🔄 Current enrollment data:', JSON.stringify(selectedEnrollment, null, 2));

      // Validate the form data matches the simplified payment system
      console.log('🔄 Validating against simplified payment system:');
      console.log('🔄 - payment_status:', values.payment_status, '(should be: pending, paid, failed, refunded)');
      console.log('🔄 - payment_method:', values.payment_method, '(should be: cash, bank_transfer, credit_card, mobile_payment, check, other)');
      console.log('🔄 - payment_amount:', values.payment_amount, '(should be decimal string)');

      console.log('🔄 Sending payment update request...');

      const result = await EnrollmentService.updatePayment(selectedEnrollment.id, values);

      console.log('✅ ===== FORM SUBMISSION SUCCESS =====');
      console.log('✅ Payment update result:', JSON.stringify(result, null, 2));

      message.success('تم تحديث معلومات الدفع بنجاح');
      setPaymentModalVisible(false);
      loadEnrollments();
    } catch (error) {
      console.error('❌ ===== FORM SUBMISSION ERROR =====');
      console.error('❌ Payment update failed:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ ===== END FORM ERROR =====');
      message.error(error.message || 'فشل في تحديث معلومات الدفع');
    }
  };

  const handleMarkCompleted = async (enrollmentId) => {
    try {
      await EnrollmentService.markCompleted(enrollmentId);
      message.success('تم تحديد التسجيل كمكتمل');
      loadEnrollments();
    } catch (error) {
      console.error('Failed to mark completed:', error);
      message.error('فشل في تحديث حالة التسجيل: ' + (error.message || 'خطأ غير معروف'));
    }
  };



  const handleDeleteEnrollment = (enrollmentId) => {
    modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا التسجيل؟ لا يمكن التراجع عن هذا الإجراء.',
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        try {
          console.log('🔄 Attempting to delete enrollment:', enrollmentId);
          await EnrollmentService.deleteEnrollment(enrollmentId);
          message.success('تم حذف التسجيل بنجاح');
          console.log('✅ Enrollment deleted, refreshing data...');
          loadEnrollments();
        } catch (error) {
          console.error('❌ Failed to delete enrollment:', error);
          message.error(error.message || 'فشل في حذف التسجيل');
        }
      }
    });
  };

  const handleShowDetails = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailsModalVisible(true);
    setDetailsLoading(true);

    try {
      const details = await EnrollmentService.getEnrollmentDetails(enrollment.id);
      setEnrollmentDetails(details);
    } catch (error) {
      console.error('Failed to load enrollment details:', error);
      message.error('فشل في تحميل تفاصيل التسجيل: ' + (error.message || 'خطأ غير معروف'));
      setEnrollmentDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('يرجى اختيار تسجيلات للتحديث');
      return;
    }

    modal.confirm({
      title: 'تأكيد التحديث المجمع',
      content: `هل أنت متأكد من تحديث حالة ${selectedRowKeys.length} تسجيل إلى "${status}"؟`,
      okText: 'نعم، حدث',
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          const result = await EnrollmentService.bulkUpdateStatus(selectedRowKeys, status);
          message.success(`تم تحديث ${result.successful} تسجيل بنجاح`);
          if (result.failed > 0) {
            message.warning(`فشل في تحديث ${result.failed} تسجيل`);
          }
          setSelectedRowKeys([]);
          loadEnrollments();
        } catch (error) {
          console.error('Bulk update failed:', error);
          message.error('فشل في التحديث المجمع: ' + (error.message || 'خطأ غير معروف'));
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('يرجى اختيار تسجيلات للحذف');
      return;
    }

    modal.confirm({
      title: 'تأكيد الحذف المجمع',
      content: `هل أنت متأكد من حذف ${selectedRowKeys.length} تسجيل؟ لا يمكن التراجع عن هذا الإجراء.`,
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await EnrollmentService.bulkDelete(selectedRowKeys);
          message.success(`تم حذف ${result.successful} تسجيل بنجاح`);
          if (result.failed > 0) {
            message.warning(`فشل في حذف ${result.failed} تسجيل`);
          }
          setSelectedRowKeys([]);
          loadEnrollments();
        } catch (error) {
          console.error('Bulk delete failed:', error);
          message.error('فشل في الحذف المجمع: ' + (error.message || 'خطأ غير معروف'));
        }
      }
    });
  };

  const handleExportPDF = async () => {
    try {
      // Show course selection modal for export
      setExportModalVisible(true);
    } catch (error) {
      message.error('فشل في فتح نافذة التصدير');
    }
  };

  const handleExportConfirm = async (exportOptions) => {
    try {
      console.log('🔄 ===== EXPORT FORM SUBMISSION =====');
      console.log('🔄 Export options from form:', exportOptions);
      console.log('🔄 Course ID selected:', exportOptions.course);
      console.log('🔄 Available courses:', courses.map(c => ({ id: c.id, name: c.course_name })));

      await EnrollmentService.exportEnrollmentsPDF(exportOptions);
      message.success('تم تصدير التقرير بنجاح');
      setExportModalVisible(false);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('فشل في تصدير التقرير: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await EnrollmentService.testConnection();
      if (result.success) {
        message.success('اتصال ناجح مع الخادم');
      } else {
        message.error(`فشل الاتصال: ${result.message}`);
      }
    } catch (error) {
      message.error('فشل في اختبار الاتصال');
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
      pending: { color: 'orange', text: 'في الانتظار' },
      paid: { color: 'green', text: 'مدفوع' },
      failed: { color: 'red', text: 'فشل' },
      refunded: { color: 'blue', text: 'مسترد' }
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'المشارك',
      key: 'participant',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.enrollee_name ||
              (record.student_name) ||
              (record.user ? `${record.user.first_name} ${record.user.last_name}` : `${record.first_name} ${record.last_name}`)
            }
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.enrollee_email || record.user?.email || record.email}
          </div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'الدورة',
      key: 'course',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.course_title || record.course?.course_name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.course_code || record.course?.course_code}
          </div>
        </div>
      ),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'enrollment_date',
      key: 'enrollment_date',
      render: (date) => new Date(date).toLocaleDateString('ar-EG'),
      sorter: true,
    },
    {
      title: 'حالة التسجيل',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'حالة الدفع',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: 'المبلغ',
      key: 'payment',
      render: (_, record) => (
        <div>
          <div>{record.payment_amount || 0} جنيه</div>
          {record.payment_method && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.payment_method.replace('_', ' ')}
            </div>
          )}
        </div>
      ),
    },

    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="تحديث الدفع">
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleUpdatePayment(record)}
            />
          </Tooltip>

          {record.status !== 'completed' && (
            <Tooltip title="تحديد كمكتمل">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkCompleted(record.id)}
              />
            </Tooltip>
          )}

          <Tooltip title="عرض التفاصيل">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShowDetails(record)}
            />
          </Tooltip>

          <Tooltip title="حذف">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEnrollment(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="enrollment-management">


      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Input.Search
              placeholder="البحث في التسجيلات..."
              onSearch={handleSearch}
              allowClear
            />
          </Col>

          <Col xs={24} sm={3}>
            <Select
              placeholder="اختر الدورة"
              allowClear
              loading={coursesLoading}
              onChange={(value) => handleFilterChange('course', value)}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_name || course.title}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={3}>
            <Select
              placeholder="حالة الدفع"
              allowClear
              onChange={(value) => handleFilterChange('payment_status', value)}
              style={{ width: '100%' }}
            >
              <Option value="pending">في الانتظار</Option>
              <Option value="paid">مدفوع</Option>
              <Option value="failed">فشل</Option>
              <Option value="refunded">مسترد</Option>
            </Select>
          </Col>

          <Col xs={24} sm={3}>
            <Select
              placeholder="حالة التسجيل"
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
            >
              <Option value="pending">في الانتظار</Option>
              <Option value="approved">مقبول</Option>
              <Option value="rejected">مرفوض</Option>
              <Option value="completed">مكتمل</Option>
              <Option value="dropped">منسحب</Option>
            </Select>
          </Col>



          <Col xs={24} sm={9}>
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
              >
                تصدير PDF
              </Button>

              {selectedRowKeys.length > 0 && (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => handleBulkStatusUpdate('approved')}
                  >
                    موافقة المحدد ({selectedRowKeys.length})
                  </Button>

                  <Button
                    onClick={() => handleBulkStatusUpdate('rejected')}
                  >
                    رفض المحدد ({selectedRowKeys.length})
                  </Button>

                  <Button
                    danger
                    onClick={handleBulkDelete}
                  >
                    حذف المحدد ({selectedRowKeys.length})
                  </Button>
                </Space>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={enrollments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.page_size,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} تسجيل`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Payment Update Modal */}
      <Modal
        title={`تحديث معلومات الدفع - ${selectedEnrollment?.enrollee_name || selectedEnrollment?.student_name || `${selectedEnrollment?.first_name} ${selectedEnrollment?.last_name}`}`}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEnrollment && (
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handlePaymentSubmit}
          >
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Text strong>الدورة:</Text> {selectedEnrollment.course_title || selectedEnrollment.course?.course_name}
                </Col>
              </Row>
            </div>

            <Form.Item
              label="حالة الدفع"
              name="payment_status"
              rules={[{ required: true, message: 'يرجى اختيار حالة الدفع' }]}
            >
              <Select placeholder="اختر حالة الدفع">
                <Option value="pending">في الانتظار</Option>
                <Option value="paid">مدفوع</Option>
                <Option value="failed">فشل</Option>
                <Option value="refunded">مسترد</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="طريقة الدفع"
              name="payment_method"
            >
              <Select placeholder="اختر طريقة الدفع">
                <Option value="cash">نقدي</Option>
                <Option value="bank_transfer">تحويل بنكي</Option>
                <Option value="credit_card">بطاقة ائتمان</Option>
                <Option value="mobile_payment">دفع محمول</Option>
                <Option value="check">شيك</Option>
                <Option value="other">أخرى</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="مبلغ الدفع"
              name="payment_amount"
              rules={[{ required: true, message: 'يرجى إدخال مبلغ الدفع' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                addonAfter="جنيه"
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button onClick={() => setPaymentModalVisible(false)}>
                  إلغاء
                </Button>
                <Button type="primary" htmlType="submit">
                  تحديث الدفع
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Enrollment Details Modal */}
      <Modal
        title={`تفاصيل التسجيل - ${selectedEnrollment?.enrollee_name || selectedEnrollment?.student_name || `${selectedEnrollment?.first_name} ${selectedEnrollment?.last_name}`}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setEnrollmentDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailsModalVisible(false);
            setEnrollmentDetails(null);
          }}>
            إغلاق
          </Button>
        ]}
        width={800}
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text>جاري تحميل التفاصيل...</Text>
          </div>
        ) : enrollmentDetails ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="معلومات المشارك">
                  <p><strong>الاسم:</strong> {enrollmentDetails.enrollee_name || enrollmentDetails.student_name || `${enrollmentDetails.first_name} ${enrollmentDetails.last_name}`}</p>
                  <p><strong>البريد الإلكتروني:</strong> {enrollmentDetails.enrollee_email || enrollmentDetails.email}</p>
                  <p><strong>الهاتف:</strong> {enrollmentDetails.phone || 'غير محدد'}</p>
                  <p><strong>المسمى الوظيفي:</strong> {enrollmentDetails.job_title || 'غير محدد'}</p>
                  <p><strong>المؤسسة:</strong> {enrollmentDetails.organization || 'غير محدد'}</p>
                  <p><strong>نوع التسجيل:</strong> {enrollmentDetails.is_guest_enrollment ? 'تسجيل ضيف' : 'مستخدم مسجل'}</p>
                  {enrollmentDetails.enrollment_token && (
                    <p><strong>رمز التسجيل:</strong> {enrollmentDetails.enrollment_token}</p>
                  )}
                  {enrollmentDetails.education_level && (
                    <p><strong>المؤهل العلمي:</strong> {enrollmentDetails.education_level}</p>
                  )}
                  {enrollmentDetails.experience_level && (
                    <p><strong>مستوى الخبرة:</strong> {enrollmentDetails.experience_level}</p>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="معلومات الدورة">
                  <p><strong>اسم الدورة:</strong> {enrollmentDetails.course_title || enrollmentDetails.course?.course_name || enrollmentDetails.course?.title || 'غير محدد'}</p>
                  <p><strong>كود الدورة:</strong> {enrollmentDetails.course_code || enrollmentDetails.course?.course_code || enrollmentDetails.course?.code || 'غير محدد'}</p>
                  <p><strong>معرف الدورة:</strong> {enrollmentDetails.course || 'غير محدد'}</p>

                  {/* Extended course information if available */}
                  {enrollmentDetails.course && typeof enrollmentDetails.course === 'object' && (
                    <>
                      {enrollmentDetails.course.instructor && (
                        <p><strong>المدرب:</strong> {enrollmentDetails.course.instructor}</p>
                      )}
                      {enrollmentDetails.course.start_date && (
                        <p><strong>تاريخ البداية:</strong> {new Date(enrollmentDetails.course.start_date).toLocaleDateString('ar-EG')}</p>
                      )}
                      {enrollmentDetails.course.end_date && (
                        <p><strong>تاريخ النهاية:</strong> {new Date(enrollmentDetails.course.end_date).toLocaleDateString('ar-EG')}</p>
                      )}
                      {enrollmentDetails.course.description && (
                        <p><strong>وصف الدورة:</strong> {enrollmentDetails.course.description}</p>
                      )}
                      {enrollmentDetails.course.duration && (
                        <p><strong>مدة الدورة:</strong> {enrollmentDetails.course.duration}</p>
                      )}
                      {enrollmentDetails.course.location && (
                        <p><strong>مكان الدورة:</strong> {enrollmentDetails.course.location}</p>
                      )}
                    </>
                  )}

                  {/* Fallback message if no extended course data */}
                  {(!enrollmentDetails.course || typeof enrollmentDetails.course !== 'object') && (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>
                      تفاصيل الدورة الإضافية غير متاحة (معرف الدورة: {enrollmentDetails.course})
                    </p>
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Card size="small" title="معلومات التسجيل">
                  <p><strong>تاريخ التسجيل:</strong> {new Date(enrollmentDetails.enrollment_date).toLocaleDateString('ar-EG')}</p>
                  <p><strong>حالة التسجيل:</strong>
                    <Tag color={
                      enrollmentDetails.status === 'completed' ? 'green' :
                        enrollmentDetails.status === 'approved' ? 'blue' :
                          enrollmentDetails.status === 'pending' ? 'orange' : 'red'
                    }>
                      {enrollmentDetails.status === 'completed' ? 'مكتمل' :
                        enrollmentDetails.status === 'approved' ? 'مقبول' :
                          enrollmentDetails.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
                    </Tag>
                  </p>
                  <p><strong>رقم التسجيل:</strong> {enrollmentDetails.enrollment_token || 'غير محدد'}</p>
                  {enrollmentDetails.completion_date && (
                    <p><strong>تاريخ الإنجاز:</strong> {new Date(enrollmentDetails.completion_date).toLocaleDateString('ar-EG')}</p>
                  )}
                  <p><strong>حالة النشاط:</strong>
                    <Tag color={enrollmentDetails.is_active ? 'green' : 'red'}>
                      {enrollmentDetails.is_active ? 'نشط' : 'غير نشط'}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="معلومات الدفع">
                  <p><strong>مبلغ الدفع:</strong> {enrollmentDetails.payment_amount || '0.00'} جنيه</p>
                  <p><strong>حالة الدفع:</strong>
                    <Tag color={
                      enrollmentDetails.payment_status === 'paid' ? 'green' :
                        enrollmentDetails.payment_status === 'failed' ? 'red' :
                          enrollmentDetails.payment_status === 'refunded' ? 'blue' : 'orange'
                    }>
                      {enrollmentDetails.payment_status === 'paid' ? 'مدفوع' :
                        enrollmentDetails.payment_status === 'failed' ? 'فشل' :
                          enrollmentDetails.payment_status === 'refunded' ? 'مسترد' : 'في الانتظار'}
                    </Tag>
                  </p>
                  {enrollmentDetails.payment_method && (
                    <p><strong>طريقة الدفع:</strong>
                      {enrollmentDetails.payment_method === 'cash' ? 'نقدي' :
                        enrollmentDetails.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                          enrollmentDetails.payment_method === 'credit_card' ? 'بطاقة ائتمان' :
                            enrollmentDetails.payment_method === 'mobile_payment' ? 'دفع محمول' :
                              enrollmentDetails.payment_method === 'check' ? 'شيك' :
                                enrollmentDetails.payment_method === 'other' ? 'أخرى' : enrollmentDetails.payment_method}
                    </p>
                  )}
                </Card>
              </Col>
            </Row>


            {/* Notes Section */}
            {(enrollmentDetails.notes || enrollmentDetails.admin_notes) && (
              <Card size="small" title="الملاحظات" style={{ marginTop: '16px' }}>
                {enrollmentDetails.notes && (
                  <div>
                    <strong>ملاحظات المشارك:</strong>
                    <p>{enrollmentDetails.notes}</p>
                  </div>
                )}
                {enrollmentDetails.admin_notes && (
                  <div>
                    <strong>ملاحظات إدارية:</strong>
                    <p>{enrollmentDetails.admin_notes}</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="danger">فشل في تحميل تفاصيل التسجيل</Text>
          </div>
        )}
      </Modal>

      {/* Export PDF Modal */}
      <Modal
        title="تصدير بيانات التسجيلات"
        open={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false);
          exportForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={handleExportConfirm}
          initialValues={{
            course: '',
            include_payment: true,
            include_status: true,
            include_dates: true
          }}
        >
          <Form.Item
            label="اختيار الدورة"
            name="course"
          >
            <Select
              placeholder="اختر دورة محددة أو جميع الدورات"
              loading={coursesLoading}
              allowClear
            >
              <Option value="">جميع الدورات</Option>
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_name} ({course.course_code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>خيارات التصدير</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="include_payment" valuePropName="checked">
                <Checkbox>تضمين معلومات الدفع</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="include_status" valuePropName="checked">
                <Checkbox>تضمين حالة التسجيل</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="include_dates" valuePropName="checked">
                <Checkbox>تضمين التواريخ</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="include_contact" valuePropName="checked">
                <Checkbox>تضمين معلومات الاتصال</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space>
              <Button onClick={() => {
                setExportModalVisible(false);
                exportForm.resetFields();
              }}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit" icon={<DownloadOutlined />}>
                تصدير PDF
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnrollmentManagement;
