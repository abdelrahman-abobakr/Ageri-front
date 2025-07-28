// components/Publications/PublicationFormPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import {
  Form, Input, Button, Select, DatePicker, Card, Typography,
  Checkbox, Space, Divider, Row, Col, Spin, Steps, Alert, Tooltip, Tag,
  Modal, List, Avatar, Badge, Switch, App
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined,
  InfoCircleOutlined, CheckCircleOutlined, FileTextOutlined,
  BookOutlined, CalendarOutlined, LinkOutlined, TagsOutlined,
  SettingOutlined, EyeOutlined
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
  
  const isEditMode = !!id;

  // Helper function to get Arabic field names
  const getArabicFieldName = (field) => {
    const fieldNames = {
      title: 'العنوان',
      abstract: 'الملخص',
      publication_type: 'نوع المنشور',
      doi: 'DOI',
      isbn: 'ISBN',
      journal_name: 'اسم المجلة',
      conference_name: 'اسم المؤتمر',
      publisher: 'الناشر',
      keywords: 'الكلمات المفتاحية',
      research_area: 'المجال البحثي',
      publication_date: 'تاريخ النشر',
      url: 'الرابط',
      pdf_url: 'رابط PDF'
    };
    return fieldNames[field] || field;
  };

  // DOI validation function
  const checkDoiExists = async (doi) => {
    if (!doi || doi.trim().length < 5) {
      setDoiExists(false);
      return;
    }

    try {
      setDoiCheckLoading(true);
      console.log('🔍 Checking DOI:', doi);

      // Call API to check if DOI exists
      const response = await researchService.checkDoiExists(doi.trim());
      const exists = response.exists;

      setDoiExists(exists);
      console.log('📋 DOI check result:', { doi, exists });

      if (exists) {
        messageApi.warning('⚠️ هذا DOI مستخدم بالفعل');
      }
    } catch (error) {
      console.error('❌ Error checking DOI:', error);
      // Don't show error for DOI check failure
      setDoiExists(false);
    } finally {
      setDoiCheckLoading(false);
    }
  };

  // Debounced DOI check
  const debouncedDoiCheck = useCallback((doi) => {
    const timeoutId = setTimeout(() => checkDoiExists(doi), 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Form steps - Updated to remove authors step
  const steps = [
    {
      title: t('basic_information') || 'المعلومات الأساسية',
      icon: <InfoCircleOutlined />,
      description: t('title_abstract_type') || 'العنوان والملخص والنوع'
    },
    {
      title: t('publication_details') || 'تفاصيل النشر',
      icon: <BookOutlined />,
      description: t('journal_conference_publisher') || 'المجلة والمؤتمر والناشر'
    },
    {
      title: t('identifiers_and_settings') || 'المعرفات والإعدادات',
      icon: <SettingOutlined />,
      description: t('doi_isbn_settings') || 'DOI و ISBN والإعدادات'
    }
  ];

  // Load publication data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setInitialLoading(true);
      const fetchPublication = async () => {
        try {
          console.log('📤 Fetching publication for edit:', id);
          const data = await researchService.getPublicationById(id);
          console.log('📥 Publication data for edit:', data);
          
          // Check if user can edit this publication
          if (!canEditPublication(data)) {
            messageApi.error(t('you_dont_have_permission_to_edit') || 'ليس لديك صلاحية لتعديل هذا المنشور');
            navigate('/app/research/publications');
            return;
          }

          // Format data for form
          const formattedData = {
            // Basic Information
            title: data.title || '',
            abstract: data.abstract || '',
            publication_type: data.publication_type || 'journal_article',
            
            // Publication Details
            journal_name: data.journal_name || '',
            conference_name: data.conference_name || '',
            publisher: data.publisher || '',
            volume: data.volume || '',
            issue: data.issue || '',
            pages: data.pages || '',
            publication_date: data.publication_date ? moment(data.publication_date) : null,
            
            // Identifiers
            doi: data.doi || '',
            isbn: data.isbn || '',
            issn: data.issn || '',
            pmid: data.pmid || '',
            
            // URLs
            url: data.url || '',
            pdf_url: data.pdf_url || '',
            
            // Keywords and Research Area
            keywords: data.keywords || '',
            research_area: data.research_area || '',
            
            // Settings
            is_public: data.is_public || false,
            citation_count: data.citation_count || 0,
          };

          console.log('📋 Setting form values:', formattedData);
          form.setFieldsValue(formattedData);
          setFormData(formattedData);
          
        } catch (error) {
          console.error('❌ Error fetching publication for edit:', error);
          messageApi.error(t('failed_to_load_publication') || 'فشل في تحميل المنشور');
          navigate('/app/research/publications');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPublication();
    }
  }, [id, isEditMode, form, t, navigate]);

  // Permission check
  const canEditPublication = (publication) => {
    if (!user) return false;
    if (user.is_admin) return true;
    return publication.submitted_by === user.id;
  };

  // Data cleaning utility
  const cleanStringField = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim();
  };

  const cleanAndValidateData = (rawValues) => {
    console.log('🧹 Cleaning and validating data:', rawValues);

    // Clean all string fields
    const cleaned = {
      // Basic Information - Required
      title: cleanStringField(rawValues.title),
      abstract: cleanStringField(rawValues.abstract),
      publication_type: rawValues.publication_type || 'journal_article',

      // Publication Details
      journal_name: cleanStringField(rawValues.journal_name),
      conference_name: cleanStringField(rawValues.conference_name),
      volume: cleanStringField(rawValues.volume),
      issue: cleanStringField(rawValues.issue),
      pages: cleanStringField(rawValues.pages),
      publisher: cleanStringField(rawValues.publisher),
      publication_date: rawValues.publication_date ? rawValues.publication_date.format('YYYY-MM-DD') : null,

      // Identifiers - Clean and validate
      doi: cleanStringField(rawValues.doi),
      isbn: cleanStringField(rawValues.isbn),
      issn: cleanStringField(rawValues.issn),
      pmid: cleanStringField(rawValues.pmid),

      // URLs
      url: cleanStringField(rawValues.url),
      pdf_url: cleanStringField(rawValues.pdf_url),

      // Keywords and Research Area
      keywords: cleanStringField(rawValues.keywords),
      research_area: cleanStringField(rawValues.research_area),

      // Settings
      is_public: rawValues.is_public !== undefined ? rawValues.is_public : false,
      language: rawValues.language || 'en',
      citation_count: parseInt(rawValues.citation_count) || 0,
      impact_factor: rawValues.impact_factor ? parseFloat(rawValues.impact_factor) : null,
      open_access: rawValues.open_access || false,
      peer_reviewed: rawValues.peer_reviewed || false,

      // Additional fields
      funding_source: cleanStringField(rawValues.funding_source),
      ethics_approval: cleanStringField(rawValues.ethics_approval),
      data_availability: cleanStringField(rawValues.data_availability),
      conflict_of_interest: cleanStringField(rawValues.conflict_of_interest),
      acknowledgments: cleanStringField(rawValues.acknowledgments),
      notes: cleanStringField(rawValues.notes)
    };

    // Remove empty string fields to avoid sending unnecessary data
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    console.log('✨ Cleaned data:', cleaned);
    return cleaned;
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('=== FORM SUBMISSION DEBUG START ===');
      console.log('📤 Raw form submission values:', values);

      // Get all form values (including from all steps)
      const allFormValues = form.getFieldsValue();
      console.log('📋 All form values from all steps:', allFormValues);

      // Create a comprehensive merged values object
      const mergedValues = {
        ...formData,           // From component state
        ...allFormValues,      // From form.getFieldsValue()
        ...values              // From onFinish parameter (highest priority)
      };
      console.log('🔄 Merged values:', mergedValues);

      // Step 1: Clean and validate data
      const cleanedData = cleanAndValidateData(mergedValues);

      // Step 2: Validate required fields
      if (!cleanedData.title || cleanedData.title.length < 10) {
        console.error('❌ Title validation failed:', {
          cleanedTitle: cleanedData.title,
          length: cleanedData.title?.length || 0
        });
        messageApi.error('العنوان مطلوب ويجب أن يكون على الأقل 10 أحرف');

        // Focus on title field and go to first step
        setCurrentStep(0);
        setTimeout(() => {
          form.scrollToField('title');
        }, 100);

        setLoading(false);
        return;
      }

      if (!cleanedData.publication_type) {
        messageApi.error('نوع المنشور مطلوب');
        setLoading(false);
        return;
      }

      // Step 3: DOI validation and conflict check
      if (cleanedData.doi) {
        // Validate DOI format
        if (!cleanedData.doi.startsWith('10.')) {
          messageApi.error('DOI يجب أن يبدأ بـ 10.');
          setLoading(false);
          return;
        }

        // Check for conflicts
        if (doiExists) {
          messageApi.error('⚠️ هذا DOI مستخدم بالفعل. يرجى تغيير DOI أو تركه فارغاً');
          setLoading(false);
          return;
        }

        // Final DOI check before submission
        console.log('🔍 Final DOI check before submission...');
        const doiCheckResult = await researchService.checkDoiExists(cleanedData.doi);
        if (doiCheckResult.exists) {
          messageApi.error('⚠️ تم اكتشاف تضارب في DOI. هذا DOI مستخدم بالفعل');
          setDoiExists(true);
          setLoading(false);
          return;
        }
      }

      console.log('✅ All validations passed. Proceeding with submission...');

      // Step 4: Show submission summary
      console.log('📋 Submission Summary:');
      console.log('  📝 Title:', cleanedData.title);
      console.log('  📚 Type:', cleanedData.publication_type);
      console.log('  🔗 DOI:', cleanedData.doi || 'Not provided');
      console.log('  📄 Abstract length:', cleanedData.abstract?.length || 0);
      console.log('  🏷️ Keywords:', cleanedData.keywords || 'Not provided');

      const payload = cleanedData;

      console.log('📋 Final prepared payload:', payload);

      // Send JSON payload
      console.log('📤 Sending JSON payload');
      const response = isEditMode
        ? await researchService.updatePublication(id, payload)
        : await researchService.createPublication(payload);
      
      console.log('📥 Response:', response);

      messageApi.success(isEditMode ? (t('publication_updated_successfully') || 'تم تحديث المنشور بنجاح') : (t('publication_created_successfully') || 'تم إنشاء المنشور بنجاح'));
      navigate('/app/research/publications');
      
    } catch (error) {
      console.error('❌ Error saving publication:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Enhanced error handling
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('📋 Backend validation errors:', errorData);

        // Handle specific error types
        let errorHandled = false;

        // 1. Handle DOI duplicate errors (multiple possible formats)
        if (errorData.doi) {
          const doiErrors = Array.isArray(errorData.doi) ? errorData.doi : [errorData.doi];
          const hasDuplicateError = doiErrors.some(err =>
            err.includes('already exists') ||
            err.includes('unique') ||
            err.includes('duplicate') ||
            err.includes('must be unique')
          );

          if (hasDuplicateError) {
            messageApi.error('⚠️ هذا DOI مستخدم بالفعل، رجاءً أدخل DOI فريد أو اتركه فارغاً');
            form.scrollToField('doi');
            setDoiExists(true);
            errorHandled = true;
          }
        }

        // 2. Handle non_field_errors (general validation errors)
        if (!errorHandled && errorData.non_field_errors) {
          const nonFieldErrors = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors
            : [errorData.non_field_errors];

          nonFieldErrors.forEach(error => {
            const errorStr = String(error).toLowerCase();
            if (errorStr.includes('doi')) {
              messageApi.error('⚠️ خطأ في DOI: هذا DOI مستخدم بالفعل أو غير صالح');
              form.scrollToField('doi');
              setDoiExists(true);
            } else if (errorStr.includes('title')) {
              messageApi.error('⚠️ خطأ في العنوان: ' + error);
              form.scrollToField('title');
            } else if (errorStr.includes('publication_type')) {
              messageApi.error('⚠️ خطأ في نوع المنشور: ' + error);
              form.scrollToField('publication_type');
            } else {
              messageApi.error('خطأ: ' + error);
            }
          });
          errorHandled = true;
        }

        // 3. Handle specific field errors
        if (!errorHandled) {
          const fieldErrorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (field === 'non_field_errors') return; // Already handled above

            const fieldErrors = Array.isArray(errorData[field])
              ? errorData[field]
              : [errorData[field]];

            fieldErrors.forEach(error => {
              const arabicFieldName = getArabicFieldName(field);
              fieldErrorMessages.push(`${arabicFieldName}: ${error}`);
            });
          });

          if (fieldErrorMessages.length > 0) {
            fieldErrorMessages.forEach(msg => messageApi.error(msg));
            errorHandled = true;
          }
        }

        // 4. Fallback for unhandled errors
        if (!errorHandled) {
          messageApi.error('حدث خطأ في حفظ المنشور. يرجى التحقق من البيانات والمحاولة مرة أخرى');
        }

      } else {
        // Network or other errors
        if (error.code === 'NETWORK_ERROR') {
          messageApi.error('خطأ في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت');
        } else {
          messageApi.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle step navigation
  const next = async () => {
    try {
      console.log('🔄 Validating form fields for step:', currentStep);
      const values = await form.validateFields();
      console.log('✅ Form validation passed:', values);
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('❌ Form validation failed:', error);
      messageApi.error(t('please_fill_required_fields') || 'يرجى ملء الحقول المطلوبة');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Debug form value changes
  const onValuesChange = (changedValues, allValues) => {
    console.log('🔄 Form values changed:', changedValues);
    console.log('📋 All current form values:', allValues);

    if (changedValues.title !== undefined) {
      console.log('📝 Title changed to:', changedValues.title);
    }
  };

  // Form field validation rules
  const getFieldRules = (field) => {
    const rules = {
      title: [
        { required: true, message: t('please_enter_publication_title') || 'يرجى إدخال عنوان المنشور' },
        { min: 10, message: t('title_must_be_at_least_10_characters') || 'العنوان يجب أن يكون على الأقل 10 أحرف' },
        { max: 500, message: t('title_cannot_exceed_500_characters') || 'العنوان لا يمكن أن يتجاوز 500 حرف' }
      ],
      publication_type: [
        { required: true, message: t('please_select_publication_type') || 'يرجى اختيار نوع المنشور' }
      ],
      doi: [
        { pattern: /^10\./, message: t('doi_must_start_with_10') || 'DOI يجب أن يبدأ بـ 10.' }
      ],
      url: [
        { type: 'url', message: t('please_enter_valid_url') || 'يرجى إدخال رابط صحيح' }
      ],
      pdf_url: [
        { type: 'url', message: t('please_enter_valid_url') || 'يرجى إدخال رابط صحيح' }
      ],
      abstract: [
        { max: 2000, message: t('abstract_cannot_exceed_2000_characters') || 'الملخص لا يمكن أن يتجاوز 2000 حرف' }
      ],
    };
    return rules[field] || [];
  };

  // Basic Information Step
  const renderBasicInformation = () => (
    <Card title={t('basic_information') || 'المعلومات الأساسية'} className="shadow-sm">
      {/* Alert for publication title removed as requested */}
      <Form.Item
        name="title"
        label={
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {t('publication_title') || 'عنوان المنشور'} <span style={{ color: 'red' }}>*</span>
          </span>
        }
        rules={getFieldRules('title')}
        hasFeedback
        required
      >
        <Input
          placeholder={t('enter_descriptive_title') || 'أدخل عنواناً وصفياً'}
          showCount
          maxLength={500}
          size="large"
          style={{ fontSize: '16px' }}
        />
      </Form.Item>
      
      <Form.Item
        name="abstract"
        label={t('abstract') || 'الملخص'}
        rules={getFieldRules('abstract')}
        extra={t('abstract_description_help') || 'وصف موجز للمنشور'}
      >
        <TextArea 
          rows={6} 
          placeholder={t('enter_publication_abstract') || 'أدخل ملخص المنشور'} 
          maxLength={2000} 
          showCount 
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="publication_type"
            label={t('publication_type') || 'نوع المنشور'}
            rules={getFieldRules('publication_type')}
          >
            <Select 
              placeholder={t('select_publication_type') || 'اختر نوع المنشور'}
              size="large"
            >
              {publicationTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    {t(type.label.toLowerCase().replace(' ', '_')) || type.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="research_area"
            label={t('research_area') || 'المجال البحثي'}
            extra={t('research_area_help') || 'المجال العلمي للبحث'}
          >
            <Input 
              placeholder={t('enter_research_field') || 'أدخل المجال البحثي'} 
              maxLength={200} 
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="keywords"
        label={t('keywords') || 'الكلمات المفتاحية'}
        extra={t('keywords_help') || 'الكلمات المفتاحية مفصولة بفواصل'}
      >
        <Input 
          placeholder={t('enter_keywords_comma_separated') || 'أدخل الكلمات المفتاحية مفصولة بفواصل'} 
          size="large"
        />
      </Form.Item>
    </Card>
  );

  const renderPublicationDetails = () => (
    <Card title={t('publication_details') || 'تفاصيل النشر'} className="shadow-sm">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="journal_name"
            label={t('journal_name') || 'اسم المجلة'}
          >
            <Input 
              placeholder={t('enter_journal_name') || 'أدخل اسم المجلة'} 
              maxLength={300}
              prefix={<BookOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="conference_name"
            label={t('conference_name') || 'اسم المؤتمر'}
          >
            <Input 
              placeholder={t('enter_conference_name') || 'أدخل اسم المؤتمر'} 
              maxLength={300}
              prefix={<BookOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="publisher"
        label={t('publisher') || 'الناشر'}
      >
        <Input 
          placeholder={t('enter_publisher_name') || 'أدخل اسم الناشر'} 
          maxLength={200}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            name="volume"
            label={t('volume') || 'المجلد'}
          >
            <Input placeholder={t('vol_number') || 'رقم المجلد'} maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="issue"
            label={t('issue') || 'العدد'}
          >
            <Input placeholder={t('issue_number') || 'رقم العدد'} maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="pages"
            label={t('pages') || 'الصفحات'}
          >
            <Input placeholder="123-145" maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="publication_date"
            label={t('publication_date') || 'تاريخ النشر'}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              placeholder={t('select_date') || 'اختر التاريخ'}
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>{t('urls_and_links') || 'الروابط والمواقع'}</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item 
            name="url" 
            label={t('publication_url') || 'رابط المنشور'}
            rules={getFieldRules('url')}
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
            label={t('pdf_url') || 'رابط PDF'}
            rules={getFieldRules('pdf_url')}
          >
            <Input 
              placeholder="https://example.com/paper.pdf"
              prefix={<LinkOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderIdentifiersAndSettings = () => (
    <Space direction="vertical" className="w-full" size="large">
      {/* Identifiers */}
      <Card title={t('identifiers') || 'المعرفات'} className="shadow-sm">
        {/* Alert for DOI validation removed as requested */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doi"
              label="DOI"
              rules={[
                ...getFieldRules('doi'),
                {
                  validator: async (_, value) => {
                    if (!value || value.trim().length === 0) {
                      return Promise.resolve();
                    }

                    if (doiExists) {
                      return Promise.reject(new Error('⚠️ هذا DOI مستخدم بالفعل، رجاءً أدخل DOI فريد'));
                    }

                    return Promise.resolve();
                  }
                }
              ]}
              extra={
                <div>
                  {t('doi_help') || 'المعرف الرقمي للكائن'}
                  {doiCheckLoading && <span style={{ color: '#1890ff', marginLeft: '8px' }}>🔍 جاري التحقق...</span>}
                  {doiExists && <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>⚠️ DOI مستخدم بالفعل</span>}
                </div>
              }
              hasFeedback
              validateStatus={doiExists ? 'error' : doiCheckLoading ? 'validating' : ''}
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
            <Form.Item name="isbn" label="ISBN">
              <Input 
                placeholder="978-3-16-148410-0" 
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="issn" label="ISSN">
              <Input 
                placeholder="1234-5678" 
                maxLength={20}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pmid" label="PMID">
              <Input 
                placeholder="12345678" 
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Publication Settings */}
      <Card title={t('publication_settings') || 'إعدادات المنشور'} className="shadow-sm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="citation_count"
              label={t('initial_citation_count') || 'عدد الاستشهادات الأولي'}
              extra={t('citation_count_help') || 'عدد الاستشهادات المعروف مسبقاً'}
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
                  <div className="font-medium">{t('make_publicly_visible') || 'جعله مرئياً للجمهور'}</div>
                  <Text type="secondary" className="text-sm">
                    {t('public_visibility_help') || 'سيكون المنشور مرئياً للجميع'}
                  </Text>
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  // Loading state for initial data
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip={t('loading_publication_data') || 'جاري تحميل بيانات المنشور'} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/app/research/publications')} 
            className="mb-4"
          >
            {t('back_to_list') || 'العودة للقائمة'}
          </Button>
          <Title level={2} className="mb-0">
            {isEditMode ? (t('edit_publication') || 'تعديل المنشور') : (t('add_new_publication') || 'إضافة منشور جديد')}
          </Title>
          <Text type="secondary">
            {isEditMode ? (t('update_publication_information') || 'تحديث معلومات المنشور') : (t('create_new_research_publication') || 'إنشاء منشور بحثي جديد')}
          </Text>
        </div>
      </div>

      {/* Steps */}
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

      {/* Form */}
      <Spin spinning={loading} tip={t('saving_publication') || 'جاري حفظ المنشور'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
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
            journal_name: '',
            conference_name: '',
            publisher: '',
            volume: '',
            issue: '',
            pages: '',
            url: '',
            pdf_url: '',
            language: 'en',
            open_access: false,
            peer_reviewed: false,
            funding_source: '',
            ethics_approval: '',
            data_availability: '',
            conflict_of_interest: '',
            acknowledgments: '',
            notes: ''
          }}
          scrollToFirstError
        >
          {/* Step Content */}
          {currentStep === 0 && renderBasicInformation()}
          {currentStep === 1 && renderPublicationDetails()}
          {currentStep === 2 && renderIdentifiersAndSettings()}

          {/* Navigation */}
          <Card className="mt-6">
            <div className="flex justify-between">
              <div>
                {currentStep > 0 && (
                  <Button onClick={prev} size="large">
                    {t('previous') || 'السابق'}
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < steps.length - 1 && (
                  <Space>
                    <Button type="primary" onClick={next} size="large">
                      {t('next') || 'التالي'}
                    </Button>
                    <Button
                      type="default"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                    >
                      {isEditMode ? (t('update_publication') || 'تحديث المنشور') : (t('create_publication') || 'إنشاء المنشور')}
                    </Button>
                  </Space>
                )}

                {currentStep === steps.length - 1 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    {isEditMode ? (t('update_publication') || 'تحديث المنشور') : (t('create_publication') || 'إنشاء المنشور')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Form>
      </Spin>
    </div>
  );
};

export default PublicationFormPage;