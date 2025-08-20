import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import {
  Form, Input, Button, Select, DatePicker, Card, Typography,
  Checkbox, Space, Divider, Row, Col, Spin, Steps, Alert, Tooltip, Tag,
  Modal, List, Avatar, Badge, Switch, App, notification, Upload
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined,
  InfoCircleOutlined, CheckCircleOutlined, FileTextOutlined,
  BookOutlined, CalendarOutlined, LinkOutlined, TagsOutlined,
  SettingOutlined, EyeOutlined, ExclamationCircleOutlined,
  WarningOutlined, CloseCircleOutlined, UploadOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import researchService from '../../services/researchService';
import { authService } from '../../services/authService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const publicationTypes = [
  { value: 'journal_article', label: 'Journal Article', icon: <FileTextOutlined /> },
  { value: 'conference_paper', label: 'Conference Paper', icon: <BookOutlined /> },
  { value: 'book_chapter', label: 'Book Chapter', icon: <BookOutlined /> },
  { value: 'book', label: 'Book', icon: <BookOutlined /> },
  { value: 'thesis', label: 'Thesis', icon: <FileTextOutlined /> },
  { value: 'report', label: 'Report', icon: <FileTextOutlined /> },
  { value: 'preprint', label: 'Preprint', icon: <FileTextOutlined /> },
  { value: 'other', label: 'Other', icon: <FileTextOutlined /> },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending Review', color: 'processing' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'published', label: 'Published', color: 'purple' },
];

const PublicationFormPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { message: messageApi } = App.useApp();

  // State management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [doiCheckLoading, setDoiCheckLoading] = useState(false);
  const [doiExists, setDoiExists] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fileList, setFileList] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [keywords, setKeywords] = useState([]);

  const isEditMode = !!id;

  // Helper function to get Arabic field names
  const getArabicFieldName = (field) => {
    const fieldNames = {
      title: 'العنوان',
      abstract: 'الملخص',
      publication_type: 'نوع المنشور',
      publication_date: 'تاريخ النشر',
      doi: 'DOI',
      isbn: 'ISBN',
      issn: 'ISSN',
      pmid: 'PMID',
      journal_name: 'اسم المجلة',
      conference_name: 'اسم المؤتمر',
      publisher: 'الناشر',
      volume: 'المجلد',
      issue: 'العدد',
      pages: 'الصفحات',
      keywords: 'الكلمات المفتاحية',
      research_area: 'المجال البحثي',
      url: 'الرابط',
      pdf_url: 'رابط PDF',
      citation_count: 'عدد الاستشهادات',
      is_public: 'الرؤية العامة',
      corresponding_author: 'المؤلف المراسل',
      authors: 'المؤلفون',
      non_field_errors: 'أخطاء عامة'
    };
    return fieldNames[field] || field.replace(/_/g, ' ');
  };

  // Enhanced error handling that uses the service's error structure
  const handleApiError = (error) => {

    // Clear existing errors
    setErrorAlert(null);
    setFieldErrors({});

    // Use the service's error handling structure
    if (error.isNetworkError) {
      setErrorAlert({
        type: 'error',
        title: 'خطأ في الاتصال',
        message: 'لا يمكن الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        icon: <ExclamationCircleOutlined />
      });
      return;
    }

    // Handle structured errors from the service
    if (error.response?.data?.errors) {
      handleValidationErrors(error.response.data);
      return;
    }

    // Handle other service errors
    switch (error.response?.status) {
      case 401:
        setErrorAlert({
          type: 'error',
          title: 'خطأ في التصريح',
          message: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
          icon: <ExclamationCircleOutlined />
        });
        setTimeout(() => navigate('/login'), 2000);
        break;

      case 403:
        setErrorAlert({
          type: 'error',
          title: 'ليس لديك صلاحية',
          message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
          icon: <ExclamationCircleOutlined />
        });
        break;

      case 404:
        setErrorAlert({
          type: 'error',
          title: 'المنشور غير موجود',
          message: 'المنشور المطلوب غير موجود أو تم حذفه.',
          icon: <ExclamationCircleOutlined />
        });
        break;

      case 413:
        setErrorAlert({
          type: 'error',
          title: 'الملف كبير جداً',
          message: 'حجم الملف يتجاوز الحد المسموح (10MB).',
          icon: <ExclamationCircleOutlined />
        });
        break;

      case 500:
        setErrorAlert({
          type: 'error',
          title: 'خطأ في الخادم',
          message: 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
          icon: <ExclamationCircleOutlined />
        });
        break;

      default:
        setErrorAlert({
          type: 'error',
          title: 'خطأ غير متوقع',
          message: error.message || `حدث خطأ غير متوقع (${error.response?.status || 'غير معروف'})`,
          icon: <ExclamationCircleOutlined />
        });
    }
  };

  // Handle validation errors using service structure
  const handleValidationErrors = (errorData) => {
    const errors = [];
    const newFieldErrors = {};
    let firstErrorField = null;

    if (errorData.errors) {
      Object.entries(errorData.errors).forEach(([field, errorInfo]) => {
        const messages = Array.isArray(errorInfo.messages)
          ? errorInfo.messages
          : [errorInfo.message || errorInfo.type || 'خطأ في التحقق'];

        const formattedErrors = messages.map(msg => formatErrorMessage(field, msg));

        newFieldErrors[field] = formattedErrors;
        errors.push(...formattedErrors);

        if (!firstErrorField) firstErrorField = field;

        if (field === 'doi' && messages.some(err =>
          typeof err === 'string' && (
            err.toLowerCase().includes('already exists') ||
            err.toLowerCase().includes('unique')
          )
        )) {
          setDoiExists(true);
        }
      });
    }

    // Set field errors in form
    if (Object.keys(newFieldErrors).length > 0) {
      form.setFields(Object.keys(newFieldErrors).map(field => ({
        name: field,
        errors: newFieldErrors[field]
      })));
      setFieldErrors(newFieldErrors);

      // Scroll to first error field
      if (firstErrorField) {
        setTimeout(() => form.scrollToField(firstErrorField), 100);
      }
    }

    // Show general error alert
    if (errors.length > 0) {
      setErrorAlert({
        type: 'error',
        title: errorData.message || 'خطأ في التحقق',
        message: 'يرجى تصحيح الأخطاء التالية:',
        errors,
        icon: <CloseCircleOutlined />
      });

      notification.error({
        message: 'فشل في التحقق',
        description: `تم العثور على ${errors.length} خطأ`,
        duration: 5,
        placement: 'topRight'
      });
    }
  };

  // Format error messages consistently with service
  const formatErrorMessage = (field, error) => {
    const fieldName = getArabicFieldName(field);
    const errorStr = typeof error === 'string' ? error.toLowerCase() : '';

    if (errorStr.includes('required') || errorStr.includes('blank')) {
      return `${fieldName}: هذا الحقل مطلوب`;
    }
    if (errorStr.includes('unique') || errorStr.includes('already exists')) {
      return `${fieldName}: القيمة مستخدمة بالفعل`;
    }
    if (errorStr.includes('future') || errorStr.includes('cannot be in the future')) {
      return `${fieldName}: التاريخ لا يمكن أن يكون في المستقبل`;
    }
    if (errorStr.includes('invalid') || errorStr.includes('format')) {
      if (field === 'doi') {
        return `${fieldName}: تنسيق غير صحيح. يجب أن يبدأ بـ 10. (مثال: 10.1000/journal.123)`;
      }
      if (field === 'url' || field === 'pdf_url') {
        return `${fieldName}: رابط غير صحيح. يجب أن يبدأ بـ http:// أو https://`;
      }
      return `${fieldName}: تنسيق غير صحيح`;
    }
    if (errorStr.includes('max') || errorStr.includes('length')) {
      if (field === 'title') {
        return `${fieldName}: طويل جداً. الحد الأقصى 500 حرف`;
      }
      if (field === 'abstract') {
        return `${fieldName}: طويل جداً. الحد الأقصى 2000 حرف`;
      }
      return `${fieldName}: النص طويل جداً`;
    }
    if (errorStr.includes('min') || errorStr.includes('too short')) {
      if (field === 'title') {
        return `${fieldName}: قصير جداً. الحد الأدنى 10 أحرف`;
      }
      return `${fieldName}: النص قصير جداً`;
    }

    return `${fieldName}: ${error}`;
  };

  // DOI validation using service
  const checkDoiExists = async (doi) => {
    if (!doi || doi.trim().length < 5) {
      setDoiExists(false);
      return { exists: false };
    }

    try {
      setDoiCheckLoading(true);
      const response = await researchService.checkDoiExists(doi.trim(), isEditMode ? id : null);

      setDoiExists(response.exists);
      if (response.exists) {
        const conflictMsg = response.conflictingPublication
          ? `هذا DOI مستخدم بالفعل في المنشور: ${response.conflictingPublication.title.substring(0, 50)}...`
          : 'هذا DOI مستخدم بالفعل';
        messageApi.warning(conflictMsg);
      }

      return response;
    } catch (error) {
      setDoiExists(false);
      return { exists: false };
    } finally {
      setDoiCheckLoading(false);
    }
  };

  // Debounced DOI check
  const debouncedDoiCheck = useCallback((doi) => {
    const timeoutId = setTimeout(() => checkDoiExists(doi), 1000);
    return () => clearTimeout(timeoutId);
  }, [isEditMode, id]);

  // Form steps
  const steps = [
    { title: 'المعلومات الأساسية', icon: <InfoCircleOutlined /> },
    { title: 'تفاصيل النشر', icon: <BookOutlined /> },
    { title: 'المعرفات والإعدادات', icon: <SettingOutlined /> }
  ];

  // Load publication data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setInitialLoading(true);
      const fetchPublication = async () => {
        try {
          const data = await researchService.getPublicationById(id);

          if (!canEditPublication(data)) {
            messageApi.error('ليس لديك صلاحية لتعديل هذا المنشور');
            navigate('/app/research/publications');
            return;
          }

          // Format data for form
          const formattedData = {
            title: data.title || '',
            abstract: data.abstract || '',
            publication_type: data.publication_type || 'journal_article',
            publication_date: data.publication_date ? moment(data.publication_date) : null,
            journal_name: data.journal_name || '',
            conference_name: data.conference_name || '',
            publisher: data.publisher || '',
            volume: data.volume || '',
            issue: data.issue || '',
            pages: data.pages || '',
            doi: data.doi || '',
            isbn: data.isbn || '',
            issn: data.issn || '',
            pmid: data.pmid || '',
            url: data.url || '',
            pdf_url: data.pdf_url || '',
            keywords: data.keywords || '',
            research_area: data.research_area || '',
            is_public: data.is_public || false,
            citation_count: data.citation_count || 0,
          };

          // Set authors if available
          if (data.authors_data) {
            setAuthors(data.authors_data);
          }

          // Set keywords if available
          if (data.keywords) {
            setKeywords(data.keywords.split(',').map(k => k.trim()).filter(k => k));
          }

          // Set file if available
          if (data.document_file) {
            setFileList([{
              uid: '-1',
              name: data.document_file.split('/').pop(),
              status: 'done',
              url: data.document_file
            }]);
          }

          form.setFieldsValue(formattedData);
          setFormData(formattedData);
        } catch (error) {
          handleApiError(error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPublication();
    }
  }, [id, isEditMode]);

  // Permission check
  const canEditPublication = (publication) => {
    if (!user) return false;
    return user.is_admin || publication.submitted_by === user.id;
  };

  // Prepare data for submission using service format
  const prepareSubmissionData = (values) => {
    const cleaned = {
      title: values.title?.trim() || '',
      abstract: values.abstract?.trim() || '',
      publication_type: values.publication_type || 'journal_article',
      publication_date: values.publication_date?.format('YYYY-MM-DD'),
      journal_name: values.journal_name?.trim(),
      conference_name: values.conference_name?.trim(),
      publisher: values.publisher?.trim(),
      volume: values.volume?.trim(),
      issue: values.issue?.trim(),
      pages: values.pages?.trim(),
      doi: values.doi?.trim(),
      isbn: values.isbn?.trim(),
      issn: values.issn?.trim(),
      pmid: values.pmid?.trim(),
      url: values.url?.trim(),
      pdf_url: values.pdf_url?.trim(),
      keywords: keywords.join(', '),
      research_area: values.research_area?.trim(),
      is_public: values.is_public || false,
      citation_count: parseInt(values.citation_count) || 0,
      authors_data: authors,
    };

    // Remove empty values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
        delete cleaned[key];
      }
    });

    return cleaned;
  };

  // Handle file upload
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle file remove
  const handleFileRemove = async () => {
    if (isEditMode && fileList.length > 0 && fileList[0].url) {
      try {
        await researchService.deletePublicationFile(id);
        setFileList([]);
        messageApi.success('تم حذف الملف بنجاح');
      } catch (error) {
        handleApiError(error);
      }
    } else {
      setFileList([]);
    }
  };

  // Form submission handler
  const onFinish = async (values) => {
    setLoading(true);
    setErrorAlert(null);
    setFieldErrors({});

    try {
      const submissionData = prepareSubmissionData(values);

      // Validate required fields
      const requiredFields = ['title', 'abstract', 'publication_type', 'publication_date'];
      const missingFields = requiredFields.filter(field => !submissionData[field]);

      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(getArabicFieldName);
        setErrorAlert({
          type: 'error',
          title: 'حقول مطلوبة مفقودة',
          message: `الحقول التالية مطلوبة: ${missingFieldNames.join('، ')}`,
          icon: <WarningOutlined />
        });
        setLoading(false);
        return;
      }

      // Handle file upload if present
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        const response = isEditMode
          ? await researchService.uploadPublicationFile(id, file)
          : await researchService.createPublication({ ...submissionData, document_file: file });

        notification.success({
          message: isEditMode ? 'تم تحديث المنشور' : 'تم إنشاء المنشور',
        });
        navigate('/app/research/publications');
        return;
      }

      // Submit without file
      const response = isEditMode
        ? await researchService.updatePublication(id, submissionData)
        : await researchService.createPublication(submissionData);

      notification.success({
        message: isEditMode ? 'تم تحديث المنشور' : 'تم إنشاء المنشور',
      });

      navigate('/app/research/publications');
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Render form steps
  const renderBasicInformation = () => (
    <Card title="المعلومات الأساسية" className="shadow-sm">
      <Form.Item
        name="title"
        label={
          <span>
            {getArabicFieldName('title')} <span style={{ color: 'red' }}>*</span>
          </span>
        }
        rules={[
          { required: true, message: 'يرجى إدخال عنوان المنشور' },
          { min: 10, message: 'العنوان يجب أن يكون على الأقل 10 أحرف' },
          { max: 500, message: 'العنوان لا يمكن أن يتجاوز 500 حرف' }
        ]}
        validateStatus={fieldErrors.title ? 'error' : ''}
        help={fieldErrors.title ? fieldErrors.title[0] : null}
      >
        <Input
          placeholder="أدخل عنواناً وصفياً (على الأقل 10 أحرف)"
          showCount
          maxLength={500}
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="abstract"
        label={
          <span>
            {getArabicFieldName('abstract')} <span style={{ color: 'red' }}>*</span>
          </span>
        }
        rules={[
          { required: true, message: 'يرجى إدخال ملخص المنشور' },
          { min: 50, message: 'الملخص يجب أن يكون على الأقل 50 حرف' },
          { max: 2000, message: 'الملخص لا يمكن أن يتجاوز 2000 حرف' }
        ]}
        validateStatus={fieldErrors.abstract ? 'error' : ''}
        help={fieldErrors.abstract ? fieldErrors.abstract[0] : null}
      >
        <TextArea
          rows={6}
          placeholder="أدخل ملخص المنشور (على الأقل 50 حرف)"
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="publication_type"
            label={
              <span>
                {getArabicFieldName('publication_type')} <span style={{ color: 'red' }}>*</span>
              </span>
            }
            rules={[{ required: true, message: 'يرجى اختيار نوع المنشور' }]}
            validateStatus={fieldErrors.publication_type ? 'error' : ''}
            help={fieldErrors.publication_type ? fieldErrors.publication_type[0] : null}
          >
            <Select placeholder="اختر نوع المنشور" size="large">
              {publicationTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    {type.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="research_area"
            label={getArabicFieldName('research_area')}
            extra="المجال العلمي للبحث"
          >
            <Input
              placeholder="أدخل المجال البحثي"
              maxLength={200}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="keywords"
        label={getArabicFieldName('keywords')}
        extra="الكلمات المفتاحية مفصولة بفواصل"
      >
        <Input
          placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
          size="large"
        />
      </Form.Item>
    </Card>
  );

  const renderPublicationDetails = () => (
    <Card title="تفاصيل النشر" className="shadow-sm">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="journal_name"
            label={getArabicFieldName('journal_name')}
            extra="للمنشورات من نوع مقالة المجلة"
            validateStatus={fieldErrors.journal_name ? 'error' : ''}
            help={fieldErrors.journal_name ? fieldErrors.journal_name[0] : null}
          >
            <Input
              placeholder="أدخل اسم المجلة"
              maxLength={300}
              prefix={<BookOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="conference_name"
            label={getArabicFieldName('conference_name')}
            extra="للمنشورات من نوع ورقة المؤتمر"
            validateStatus={fieldErrors.conference_name ? 'error' : ''}
            help={fieldErrors.conference_name ? fieldErrors.conference_name[0] : null}
          >
            <Input
              placeholder="أدخل اسم المؤتمر"
              maxLength={300}
              prefix={<BookOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="publisher"
        label={getArabicFieldName('publisher')}
        validateStatus={fieldErrors.publisher ? 'error' : ''}
        help={fieldErrors.publisher ? fieldErrors.publisher[0] : null}
      >
        <Input
          placeholder="أدخل اسم الناشر"
          maxLength={200}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="volume"
            label={getArabicFieldName('volume')}
          >
            <Input placeholder="رقم المجلد" maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="issue"
            label={getArabicFieldName('issue')}
          >
            <Input placeholder="رقم العدد" maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="pages"
            label={getArabicFieldName('pages')}
          >
            <Input placeholder="123-145" maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="publication_date"
            label={
              <span>
                {getArabicFieldName('publication_date')} <span style={{ color: 'red' }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: 'يرجى اختيار تاريخ النشر' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const selectedDate = moment(value);
                  const today = moment();
                  if (selectedDate.isAfter(today, 'day')) {
                    return Promise.reject(new Error('تاريخ النشر لا يمكن أن يكون في المستقبل'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validateStatus={fieldErrors.publication_date ? 'error' : ''}
            help={fieldErrors.publication_date ? fieldErrors.publication_date[0] : null}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="اختر التاريخ"
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>الروابط والمواقع</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="url"
            label={getArabicFieldName('url')}
            rules={[{ type: 'url', message: 'يرجى إدخال رابط صحيح' }]}
            validateStatus={fieldErrors.url ? 'error' : ''}
            help={fieldErrors.url ? fieldErrors.url[0] : null}
          >
            <Input
              placeholder="https://example.com/publication"
              prefix={<LinkOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="pdf_url"
            label={getArabicFieldName('pdf_url')}
            rules={[{ type: 'url', message: 'يرجى إدخال رابط صحيح' }]}
            validateStatus={fieldErrors.pdf_url ? 'error' : ''}
            help={fieldErrors.pdf_url ? fieldErrors.pdf_url[0] : null}
          >
            <Input
              placeholder="https://example.com/paper.pdf"
              prefix={<LinkOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>ملف المنشور</Divider>

      <Form.Item label="رفع ملف">
        <Upload
          fileList={fileList}
          onChange={handleFileChange}
          onRemove={handleFileRemove}
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf,.doc,.docx"
        >
          <Button icon={<UploadOutlined />}>اختر ملف</Button>
        </Upload>
        <Text type="secondary">يسمح بملفات PDF, DOC, DOCX بحد أقصى 10MB</Text>
      </Form.Item>
    </Card>
  );

  const renderIdentifiersAndSettings = () => (
    <Space direction="vertical" className="w-full" size="large">
      <Card title="المعرفات" className="shadow-sm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doi"
              label={getArabicFieldName('doi')}
              extra={
                <div>
                  المعرف الرقمي للكائن
                  {doiCheckLoading && <span style={{ color: '#1890ff', marginLeft: '8px' }}>🔍 جاري التحقق...</span>}
                  {doiExists && <span style={{ color: '#ff4d4f', marginLeft: '8px' }}> DOI مستخدم بالفعل</span>}
                </div>
              }
              validateStatus={doiExists ? 'error' : doiCheckLoading ? 'validating' : (fieldErrors.doi ? 'error' : '')}
              help={fieldErrors.doi ? fieldErrors.doi[0] : null}
            >
              <Input
                placeholder="10.1000/journal.2021.123456"
                maxLength={200}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && value.trim().length >= 5) {
                    debouncedDoiCheck(value.trim());
                  } else {
                    setDoiExists(false);
                    setDoiCheckLoading(false);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isbn" label={getArabicFieldName('isbn')}>
              <Input
                placeholder="978-3-16-148410-0"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="issn" label={getArabicFieldName('issn')}>
              <Input
                placeholder="1234-5678"
                maxLength={20}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pmid" label={getArabicFieldName('pmid')}>
              <Input
                placeholder="12345678"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="إعدادات المنشور" className="shadow-sm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="citation_count"
              label={getArabicFieldName('citation_count')}
              extra="عدد الاستشهادات المعروف مسبقاً"
              validateStatus={fieldErrors.citation_count ? 'error' : ''}
              help={fieldErrors.citation_count ? fieldErrors.citation_count[0] : null}
            >
              <Input
                type="number"
                min={0}
                max={999999}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_public" valuePropName="checked">
              <div className="flex items-center space-x-2">
                <Switch />
                <div>
                  <div className="font-medium">{getArabicFieldName('is_public')}</div>
                  <Text type="secondary" className="text-sm">
                    سيكون المنشور مرئياً للجميع
                  </Text>
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="جاري تحميل بيانات المنشور" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/app/research/publications')}
            className="mb-4"
          >
            العودة للقائمة
          </Button>
          <Title level={2} className="mb-3">
            {isEditMode ? 'تعديل المنشور' : 'إضافة منشور جديد'}
          </Title>
        </div>
      </div>

      {errorAlert && (
        <Alert
          message={errorAlert.title}
          description={
            <div>
              {errorAlert.message && (
                <p style={{ marginBottom: errorAlert.errors ? '12px' : '0' }}>
                  {errorAlert.message}
                </p>
              )}
              {errorAlert.errors && errorAlert.errors.length > 0 && (
                errorAlert.errors.length === 1 ? (
                  <p style={{ marginBottom: '0' }}>{errorAlert.errors[0]}</p>
                ) : (
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    {errorAlert.errors.map((error, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {error}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          }
          type={errorAlert.type}
          showIcon
          icon={errorAlert.icon || <ExclamationCircleOutlined />}
          closable
          onClose={() => {
            setErrorAlert(null);
            setFieldErrors({});
          }}
          className="mb-6"
          style={{
            border: errorAlert.type === 'error' ? '1px solid #ff7875' : undefined,
            backgroundColor: errorAlert.type === 'error' ? '#fff2f0' : undefined
          }}
        />
      )}

      <Card className="mb-6">
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </Card>

      <Spin spinning={loading} tip="جاري حفظ المنشور">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            title: '',
            abstract: '',
            publication_type: 'journal_article',
            is_public: false,
            citation_count: 0,
            keywords: '',
            research_area: '',
            doi: '',
            isbn: '',
            issn: '',
            pmid: '',
            journal_name: '',
            conference_name: '',
            publisher: '',
            volume: '',
            issue: '',
            pages: '',
            url: '',
            pdf_url: '',
            publication_date: null
          }}
          scrollToFirstError
        >
          {currentStep === 0 && renderBasicInformation()}
          {currentStep === 1 && renderPublicationDetails()}
          {currentStep === 2 && renderIdentifiersAndSettings()}

          <Card className="mt-6">
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  {currentStep > 0 && (
                    <Button onClick={() => setCurrentStep(currentStep - 1)} size="large">
                      السابق
                    </Button>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)} size="large">
                      التالي
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                    >
                      {isEditMode ? 'تحديث المنشور' : 'إنشاء المنشور'}
                    </Button>
                  )}
                </Space>
              </Col>

              <Col>
                <Space size="middle">
                  <Button
                    onClick={() => {
                      if (form.isFieldsTouched()) {
                        Modal.confirm({
                          title: 'تأكيد الإلغاء',
                          content: 'ستفقد التغييرات غير المحفوظة. هل أنت متأكد؟',
                          okText: 'نعم، إلغاء',
                          cancelText: 'لا، متابعة',
                          onOk: () => navigate('/app/research/publications'),
                        });
                      } else {
                        navigate('/app/research/publications');
                      }
                    }}
                    size="large"
                  >
                    إلغاء
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Form>
      </Spin>
    </div>
  );
};

export default PublicationFormPage;