import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import {
  Form, Input, Button, Select, DatePicker, Card, Typography,
  Checkbox, Space, Divider, Row, Col, Spin, Steps, Alert, Tooltip, Tag,
  Modal, List, Avatar, Badge, Switch, App, notification
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined,
  InfoCircleOutlined, CheckCircleOutlined, FileTextOutlined,
  BookOutlined, CalendarOutlined, LinkOutlined, TagsOutlined,
  SettingOutlined, EyeOutlined, ExclamationCircleOutlined,
  WarningOutlined, CloseCircleOutlined
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

  // Enhanced error message formatting
  const formatErrorMessage = (field, error) => {
    const fieldName = getArabicFieldName(field);
    
    if (typeof error === 'string') {
      const errorLower = error.toLowerCase();
      
      // Handle common error types with specific Arabic messages
      if (errorLower.includes('required') || errorLower.includes('blank')) {
        return `${fieldName}: هذا الحقل مطلوب ولا يمكن تركه فارغاً`;
      }
      if (errorLower.includes('unique') || errorLower.includes('already exists')) {
        return `${fieldName}: هذه القيمة مستخدمة بالفعل، يرجى اختيار قيمة أخرى`;
      }
      if (errorLower.includes('future') || errorLower.includes('cannot be in the future')) {
        return `${fieldName}: التاريخ لا يمكن أن يكون في المستقبل`;
      }
      if (errorLower.includes('invalid') || errorLower.includes('format')) {
        if (field === 'doi') {
          return `${fieldName}: تنسيق غير صحيح. يجب أن يبدأ بـ 10. (مثال: 10.1000/journal.123)`;
        }
        if (field === 'url' || field === 'pdf_url') {
          return `${fieldName}: رابط غير صحيح. يجب أن يبدأ بـ http:// أو https://`;
        }
        return `${fieldName}: تنسيق غير صحيح`;
      }
      if (errorLower.includes('max') || errorLower.includes('length')) {
        if (field === 'title') {
          return `${fieldName}: طويل جداً. الحد الأقصى 500 حرف`;
        }
        if (field === 'abstract') {
          return `${fieldName}: طويل جداً. الحد الأقصى 2000 حرف`;
        }
        return `${fieldName}: النص طويل جداً`;
      }
      if (errorLower.includes('min') || errorLower.includes('too short')) {
        if (field === 'title') {
          return `${fieldName}: قصير جداً. الحد الأدنى 10 أحرف`;
        }
        return `${fieldName}: النص قصير جداً`;
      }
      
      // Return the original error with field name
      return `${fieldName}: ${error}`;
    }
    
    return `${fieldName}: خطأ غير محدد`;
  };

  // Enhanced API error handling function
  const handleApiError = (error) => {
    console.error('⚠️ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });

    // Clear existing errors
    setErrorAlert(null);
    setFieldErrors({});

    // Handle network errors
    if (!error.response) {
      setErrorAlert({
        type: 'error',
        title: 'خطأ في الاتصال',
        message: 'لا يمكن الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        icon: <ExclamationCircleOutlined />
      });
      return;
    }

    const { status, data } = error.response;
    
    // Handle different status codes
    switch (status) {
      case 400: // Bad Request - Validation errors
        handleValidationErrors(data);
        break;
        
      case 401: // Unauthorized
        setErrorAlert({
          type: 'error',
          title: 'خطأ في التصريح',
          message: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
          icon: <ExclamationCircleOutlined />
        });
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        break;
        
      case 403: // Forbidden
        setErrorAlert({
          type: 'error',
          title: 'ليس لديك صلاحية',
          message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
          icon: <ExclamationCircleOutlined />
        });
        break;
        
      case 404: // Not Found
        setErrorAlert({
          type: 'error',
          title: 'المنشور غير موجود',
          message: 'المنشور المطلوب غير موجود أو تم حذفه.',
          icon: <ExclamationCircleOutlined />
        });
        break;
        
      case 500: // Internal Server Error
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
          message: `حدث خطأ غير متوقع (رمز الخطأ: ${status}). يرجى المحاولة مرة أخرى.`,
          icon: <ExclamationCircleOutlined />
        });
    }
  };

  // Handle validation errors from backend
  const handleValidationErrors = (errorData) => {
    console.log('🔍 Processing validation errors:', errorData);
    
    const errors = [];
    const newFieldErrors = {};
    let firstErrorField = null;

    // Process field-specific errors
    Object.keys(errorData).forEach(field => {
      if (field === 'non_field_errors') return; // Handle separately
      
      const fieldErrorList = Array.isArray(errorData[field]) 
        ? errorData[field] 
        : [errorData[field]];

      const formattedErrors = fieldErrorList.map(err => formatErrorMessage(field, err));
      
      // Store for form field display
      newFieldErrors[field] = formattedErrors;
      
      // Add to general error list
      errors.push(...formattedErrors);
      
      // Track first error field for scrolling
      if (!firstErrorField) {
        firstErrorField = field;
      }
      
      // Special handling for DOI conflicts
      if (field === 'doi' && fieldErrorList.some(err => 
        typeof err === 'string' && (
          err.toLowerCase().includes('unique') || 
          err.toLowerCase().includes('already exists')
        )
      )) {
        setDoiExists(true);
      }
    });

    // Handle non-field errors (general validation errors)
    if (errorData.non_field_errors) {
      const nonFieldErrors = Array.isArray(errorData.non_field_errors)
        ? errorData.non_field_errors
        : [errorData.non_field_errors];

      nonFieldErrors.forEach(error => {
        const formattedError = formatErrorMessage('non_field_errors', error);
        errors.push(formattedError);
      });
    }

    // Set field errors in form
    if (Object.keys(newFieldErrors).length > 0) {
      const formFields = Object.keys(newFieldErrors).map(field => ({
        name: field,
        errors: newFieldErrors[field]
      }));
      
      form.setFields(formFields);
      setFieldErrors(newFieldErrors);
      
      // Scroll to first error field
      if (firstErrorField) {
        setTimeout(() => {
          form.scrollToField(firstErrorField);
        }, 100);
      }
    }

    // Show general error alert
    if (errors.length > 0) {
      setErrorAlert({
        type: 'error',
        title: 'خطأ في حفظ المنشور',
        message: 'يرجى تصحيح الأخطاء التالية:',
        errors: errors,
        icon: <CloseCircleOutlined />
      });
      
      // Show notification for better UX
      notification.error({
        message: 'فشل في حفظ المنشور',
        description: `تم العثور على ${errors.length} خطأ. يرجى مراجعة النموذج وتصحيح الأخطاء.`,
        duration: 5,
        placement: 'topRight'
      });
    } else {
      // Fallback if no specific errors found
      setErrorAlert({
        type: 'error',
        title: 'خطأ في البيانات المدخلة',
        message: 'البيانات المدخلة غير صحيحة. يرجى مراجعة جميع الحقول والمحاولة مرة أخرى.',
        icon: <ExclamationCircleOutlined />
      });
    }
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
      console.error('⚠️ Error checking DOI:', error);
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

  // Form steps
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
            // Basic Information (now required)
            title: data.title || '',
            abstract: data.abstract || '',
            publication_type: data.publication_type || 'journal_article',
            publication_date: data.publication_date ? moment(data.publication_date) : null,

            // Publication Details
            journal_name: data.journal_name || '',
            conference_name: data.conference_name || '',
            publisher: data.publisher || '',
            volume: data.volume || '',
            issue: data.issue || '',
            pages: data.pages || '',

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
          console.error('⚠️ Error fetching publication for edit:', error);
          handleApiError(error);
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
      // Basic Information - Now Required
      title: cleanStringField(rawValues.title),
      abstract: cleanStringField(rawValues.abstract),
      publication_type: rawValues.publication_type || 'journal_article',
      publication_date: rawValues.publication_date ? rawValues.publication_date.format('YYYY-MM-DD') : null,

      // Publication Details
      journal_name: cleanStringField(rawValues.journal_name),
      conference_name: cleanStringField(rawValues.conference_name),
      volume: cleanStringField(rawValues.volume),
      issue: cleanStringField(rawValues.issue),
      pages: cleanStringField(rawValues.pages),
      publisher: cleanStringField(rawValues.publisher),

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
      citation_count: parseInt(rawValues.citation_count) || 0,
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
    setErrorAlert(null);
    setFieldErrors({});
    
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

      // Step 2: Client-side validation for required fields
      const requiredFields = ['title', 'abstract', 'publication_type', 'publication_date'];
      const missingFields = [];

      requiredFields.forEach(field => {
        if (!cleanedData[field] || (typeof cleanedData[field] === 'string' && cleanedData[field].trim() === '')) {
          missingFields.push(getArabicFieldName(field));
        }
      });

      if (missingFields.length > 0) {
        setErrorAlert({
          type: 'error',
          title: 'حقول مطلوبة مفقودة',
          message: `الحقول التالية مطلوبة: ${missingFields.join('، ')}`,
          errors: missingFields.map(field => `${field}: هذا الحقل مطلوب`),
          icon: <WarningOutlined />
        });
        
        // Focus on first missing field
        const firstMissingField = requiredFields.find(field => 
          !cleanedData[field] || (typeof cleanedData[field] === 'string' && cleanedData[field].trim() === '')
        );
        
        if (firstMissingField) {
          // Navigate to appropriate step
          if (['title', 'abstract', 'publication_type'].includes(firstMissingField)) {
            setCurrentStep(0);
          } else if (firstMissingField === 'publication_date') {
            setCurrentStep(1);
          }
          
          setTimeout(() => {
            form.scrollToField(firstMissingField);
          }, 100);
        }
        
        setLoading(false);
        return;
      }

      // Step 3: DOI validation and conflict check
      if (cleanedData.doi) {
        // Validate DOI format
        if (!cleanedData.doi.startsWith('10.')) {
          setErrorAlert({
            type: 'error',
            title: 'خطأ في DOI',
            message: 'DOI يجب أن يبدأ بـ 10.',
            icon: <ExclamationCircleOutlined />
          });
          setCurrentStep(2); // Go to identifiers step
          setTimeout(() => form.scrollToField('doi'), 100);
          setLoading(false);
          return;
        }

        // Check for conflicts
        if (doiExists) {
          setErrorAlert({
            type: 'error',
            title: 'تضارب في DOI',
            message: 'هذا DOI مستخدم بالفعل. يرجى تغيير DOI أو تركه فارغاً',
            icon: <ExclamationCircleOutlined />
          });
          setLoading(false);
          return;
        }

        // Final DOI check before submission
        console.log('🔍 Final DOI check before submission...');
        try {
          const doiCheckResult = await researchService.checkDoiExists(cleanedData.doi);
          if (doiCheckResult.exists) {
            setDoiExists(true);
            setErrorAlert({
              type: 'error',
              title: 'تضارب في DOI',
              message: 'تم اكتشاف تضارب في DOI. هذا DOI مستخدم بالفعل',
              icon: <ExclamationCircleOutlined />
            });
            setLoading(false);
            return;
          }
        } catch (doiCheckError) {
          console.warn('⚠️ DOI check failed, proceeding anyway:', doiCheckError);
        }
      }

      console.log('✅ All validations passed. Proceeding with submission...');

      // Step 4: Show submission summary
      console.log('📋 Submission Summary:');
      console.log('  📝 Title:', cleanedData.title);
      console.log('  📚 Type:', cleanedData.publication_type);
      console.log('  🔗 DOI:', cleanedData.doi || 'Not provided');
      console.log('  📄 Abstract length:', cleanedData.abstract?.length || 0);
      console.log('  📅 Publication date:', cleanedData.publication_date || 'Not provided');

      const payload = cleanedData;
      console.log('📋 Final prepared payload:', payload);

      // Send JSON payload
      console.log('📤 Sending JSON payload to API...');
      const response = isEditMode
        ? await researchService.updatePublication(id, payload)
        : await researchService.createPublication(payload);

      console.log('📥 Success Response:', response);

      // Success notification
      notification.success({
        message: isEditMode ? 'تم تحديث المنشور' : 'تم إنشاء المنشور',
        description: isEditMode 
          ? 'تم تحديث المنشور بنجاح' 
          : 'تم إنشاء المنشور الجديد بنجاح',
        duration: 4,
        placement: 'topRight'
      });

      messageApi.success(isEditMode 
        ? (t('publication_updated_successfully') || 'تم تحديث المنشور بنجاح') 
        : (t('publication_created_successfully') || 'تم إنشاء المنشور بنجاح')
      );
      
      navigate('/app/research/publications');

    } catch (error) {
      console.error('⚠️ Error saving publication:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle step navigation
  const next = async () => {
    try {
      console.log('📄 Validating form fields for step:', currentStep);
      
      // Define which fields to validate for each step
      let fieldsToValidate = [];
      
      switch (currentStep) {
        case 0: // Basic Information - all required
          fieldsToValidate = ['title', 'abstract', 'publication_type'];
          break;
        case 1: // Publication Details - publication_date is required
          fieldsToValidate = ['publication_date'];
          break;
        case 2: // Final step - validate all
          fieldsToValidate = [];
          break;
        default:
          fieldsToValidate = [];
      }
      
      const values = fieldsToValidate.length > 0 
        ? await form.validateFields(fieldsToValidate)
        : await form.validateFields();
        
      console.log('✅ Form validation passed:', values);
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
      setErrorAlert(null);
      setFieldErrors({});
      
    } catch (error) {
      console.error('⚠️ Form validation failed:', error);
      
      // Extract specific field errors
      const failedFields = error.errorFields || [];
      const fieldNames = failedFields.map(field => getArabicFieldName(field.name[0]));
      
      if (fieldNames.length > 0) {
        setErrorAlert({
          type: 'warning',
          title: 'يرجى ملء الحقول المطلوبة',
          message: `الحقول التالية مطلوبة: ${fieldNames.join('، ')}`,
          icon: <WarningOutlined />
        });
      } else {
        messageApi.error(t('please_fill_required_fields') || 'يرجى ملء الحقول المطلوبة');
      }
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
    setErrorAlert(null);
    setFieldErrors({});
  };

  // Handle cancel with confirmation
  const handleCancel = () => {
    const hasChanges = Object.keys(formData).length > 0 || form.isFieldsTouched();

    if (hasChanges) {
      Modal.confirm({
        title: t('confirm_cancel') || 'تأكيد الإلغاء',
        content: t('unsaved_changes_will_be_lost') || 'ستفقد التغييرات غير المحفوظة. هل أنت متأكد؟',
        okText: t('yes_cancel') || 'نعم، إلغاء',
        cancelText: t('no_continue') || 'لا، متابعة',
        onOk: () => navigate('/app/research/publications'),
      });
    } else {
      navigate('/app/research/publications');
    }
  };

  // Clear errors when form values change
  const onValuesChange = (changedValues, allValues) => {
    console.log('📄 Form values changed:', changedValues);
    
    // Clear error alert when form values change
    if (errorAlert) {
      setErrorAlert(null);
    }
    
    // Clear specific field errors when those fields change
    if (Object.keys(fieldErrors).length > 0) {
      const clearedFieldErrors = { ...fieldErrors };
      Object.keys(changedValues).forEach(field => {
        if (clearedFieldErrors[field]) {
          delete clearedFieldErrors[field];
        }
      });
      setFieldErrors(clearedFieldErrors);
    }
    
    if (changedValues.title !== undefined) {
      console.log('📝 Title changed to:', changedValues.title);
    }
  };

  // Enhanced form field validation rules
  const getFieldRules = (field) => {
    const rules = {
      title: [
        { required: true, message: t('please_enter_publication_title') || 'يرجى إدخال عنوان المنشور' },
        { min: 10, message: t('title_must_be_at_least_10_characters') || 'العنوان يجب أن يكون على الأقل 10 أحرف' },
        { max: 500, message: t('title_cannot_exceed_500_characters') || 'العنوان لا يمكن أن يتجاوز 500 حرف' }
      ],
      abstract: [
        { required: true, message: t('please_enter_publication_abstract') || 'يرجى إدخال ملخص المنشور' },
        { min: 50, message: t('abstract_must_be_at_least_50_characters') || 'الملخص يجب أن يكون على الأقل 50 حرف' },
        { max: 2000, message: t('abstract_cannot_exceed_2000_characters') || 'الملخص لا يمكن أن يتجاوز 2000 حرف' }
      ],
      publication_type: [
        { required: true, message: t('please_select_publication_type') || 'يرجى اختيار نوع المنشور' }
      ],
      publication_date: [
        { required: true, message: t('please_select_publication_date') || 'يرجى اختيار تاريخ النشر' },
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            
            const selectedDate = moment(value);
            const today = moment();
            
            if (selectedDate.isAfter(today, 'day')) {
              return Promise.reject(new Error('تاريخ النشر لا يمكن أن يكون في المستقبل'));
            }
            
            // Check if date is too far in the past (optional)
            const minimumDate = moment().subtract(150, 'years');
            if (selectedDate.isBefore(minimumDate)) {
              return Promise.reject(new Error('تاريخ النشر قديم جداً'));
            }
            
            return Promise.resolve();
          }
        }
      ],
      doi: [
        { 
          pattern: /^10\./, 
          message: t('doi_must_start_with_10') || 'DOI يجب أن يبدأ بـ 10.' 
        },
        {
          validator: async (_, value) => {
            if (!value || value.trim().length === 0) {
              return Promise.resolve();
            }

            // Additional DOI format validation
            const doiRegex = /^10\.\d{4,}\/[^\s]+$/;
            if (!doiRegex.test(value.trim())) {
              return Promise.reject(new Error('تنسيق DOI غير صحيح. المثال: 10.1000/journal.2021.123456'));
            }

            if (doiExists) {
              return Promise.reject(new Error('⚠️ هذا DOI مستخدم بالفعل، رجاءً أدخل DOI فريد'));
            }

            return Promise.resolve();
          }
        }
      ],
      url: [
        { 
          type: 'url', 
          message: t('please_enter_valid_url') || 'يرجى إدخال رابط صحيح' 
        }
      ],
      pdf_url: [
        { 
          type: 'url', 
          message: t('please_enter_valid_url') || 'يرجى إدخال رابط صحيح' 
        }
      ],
      citation_count: [
        {
          validator: (_, value) => {
            if (value === undefined || value === null || value === '') {
              return Promise.resolve();
            }
            
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 0) {
              return Promise.reject(new Error('عدد الاستشهادات يجب أن يكون رقماً موجباً'));
            }
            
            if (num > 999999) {
              return Promise.reject(new Error('عدد الاستشهادات كبير جداً'));
            }
            
            return Promise.resolve();
          }
        }
      ]
    };
    return rules[field] || [];
  };

  // Basic Information Step
  const renderBasicInformation = () => (
    <Card title={t('basic_information') || 'المعلومات الأساسية'} className="shadow-sm">
      <Form.Item
        name="title"
        label={
          <span>
            {getArabicFieldName('title')} <span style={{ color: 'red' }}>*</span>
          </span>
        }
        rules={getFieldRules('title')}
        hasFeedback
        required
        validateStatus={fieldErrors.title ? 'error' : ''}
        help={fieldErrors.title ? fieldErrors.title[0] : null}
      >
        <Input
          placeholder={t('enter_descriptive_title') || 'أدخل عنواناً وصفياً (على الأقل 10 أحرف)'}
          showCount
          maxLength={500}
          size="large"
          style={{ fontSize: '16px' }}
        />
      </Form.Item>

      <Form.Item
        name="abstract"
        label={
          <span>
            {getArabicFieldName('abstract')} <span style={{ color: 'red' }}>*</span>
          </span>
        }
        rules={getFieldRules('abstract')}
        extra={t('abstract_description_help') || 'وصف موجز للمنشور (على الأقل 50 حرف)'}
        required
        validateStatus={fieldErrors.abstract ? 'error' : ''}
        help={fieldErrors.abstract ? fieldErrors.abstract[0] : null}
      >
        <TextArea
          rows={6}
          placeholder={t('enter_publication_abstract') || 'أدخل ملخص المنشور (على الأقل 50 حرف)'}
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
            rules={getFieldRules('publication_type')}
            required
            validateStatus={fieldErrors.publication_type ? 'error' : ''}
            help={fieldErrors.publication_type ? fieldErrors.publication_type[0] : null}
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
            label={getArabicFieldName('research_area')}
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
        label={getArabicFieldName('keywords')}
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
            label={getArabicFieldName('journal_name')}
            extra="للمنشورات من نوع مقالة المجلة"
            validateStatus={fieldErrors.journal_name ? 'error' : ''}
            help={fieldErrors.journal_name ? fieldErrors.journal_name[0] : null}
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
            label={getArabicFieldName('conference_name')}
            extra="للمنشورات من نوع ورقة المؤتمر"
            validateStatus={fieldErrors.conference_name ? 'error' : ''}
            help={fieldErrors.conference_name ? fieldErrors.conference_name[0] : null}
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
        label={getArabicFieldName('publisher')}
        validateStatus={fieldErrors.publisher ? 'error' : ''}
        help={fieldErrors.publisher ? fieldErrors.publisher[0] : null}
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
            label={getArabicFieldName('volume')}
          >
            <Input placeholder={t('vol_number') || 'رقم المجلد'} maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="issue"
            label={getArabicFieldName('issue')}
          >
            <Input placeholder={t('issue_number') || 'رقم العدد'} maxLength={50} />
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
            rules={getFieldRules('publication_date')}
            required
            validateStatus={fieldErrors.publication_date ? 'error' : ''}
            help={fieldErrors.publication_date ? fieldErrors.publication_date[0] : null}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={t('select_date') || 'اختر التاريخ'}
              disabledDate={(current) => {
                // Disable future dates
                if (current && current > moment().endOf('day')) {
                  return true;
                }
                // Optionally disable very old dates
                const minimumDate = moment().subtract(150, 'years');
                if (current && current < minimumDate) {
                  return true;
                }
                return false;
              }}
              showToday={false}
              allowClear={true}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>{t('urls_and_links') || 'الروابط والمواقع'}</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="url"
            label={getArabicFieldName('url')}
            rules={getFieldRules('url')}
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
            rules={getFieldRules('pdf_url')}
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
    </Card>
  );

  const renderIdentifiersAndSettings = () => (
    <Space direction="vertical" className="w-full" size="large">
      {/* Identifiers */}
      <Card title={t('identifiers') || 'المعرفات'} className="shadow-sm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doi"
              label={getArabicFieldName('doi')}
              rules={getFieldRules('doi')}
              extra={
                <div>
                  {t('doi_help') || 'المعرف الرقمي للكائن'}
                  {doiCheckLoading && <span style={{ color: '#1890ff', marginLeft: '8px' }}>🔍 جاري التحقق...</span>}
                  {doiExists && <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>⚠️ DOI مستخدم بالفعل</span>}
                </div>
              }
              hasFeedback
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

      {/* Publication Settings */}
      <Card title={t('publication_settings') || 'إعدادات المنشور'} className="shadow-sm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="citation_count"
              label={getArabicFieldName('citation_count')}
              extra={t('citation_count_help') || 'عدد الاستشهادات المعروف مسبقاً'}
              rules={getFieldRules('citation_count')}
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
          <Title level={2} className="mb-3">
            {isEditMode ? (t('edit_publication') || 'تعديل المنشور') : (t('Add a new publication') || 'إضافة منشور جديد')}
          </Title>

        </div>
      </div>

      {/* Enhanced Error Alert */}
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
          validateTrigger={['onBlur', 'onChange']}
        >
          {/* Step Content */}
          {currentStep === 0 && renderBasicInformation()}
          {currentStep === 1 && renderPublicationDetails()}
          {currentStep === 2 && renderIdentifiersAndSettings()}

          {/* Navigation */}
          <Card className="mt-6">
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  {currentStep > 0 && (
                    <Button onClick={prev} size="large">
                      {t('previous') || 'السابق'}
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <>
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
                    </>
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
                </Space>
              </Col>

              <Col>
                <Space size="middle">
                  <Button
                    onClick={handleCancel}
                    size="large"
                  >
                    {t('cancel') || 'إلغاء'}
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