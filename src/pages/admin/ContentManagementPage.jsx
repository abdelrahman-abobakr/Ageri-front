import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Dropdown,
  Tooltip,
  Spin,
  Upload,
  DatePicker,
  Divider,
  Alert,
  Badge,
} from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SendOutlined,
  StarOutlined,
  StarFilled,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExceptionOutlined,
} from '@ant-design/icons';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { contentService } from '../../services';

// من عناصر تايبوغرافي
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const ContentManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData?.role;
  const userId = userData?.id;

  const handleImageUpload = (info) => {
    const { file } = info;
    if (!file) return;

    // Ensure we have a proper File object
    const actualFile = file.originFileObj || file;
    
    console.log('🔍 Image upload:', {
      name: actualFile.name,
      size: actualFile.size,
      type: actualFile.type,
      isFile: actualFile instanceof File
    });
    
    setImagePreview(URL.createObjectURL(actualFile));
    setImageFile(actualFile);
    form.setFieldsValue({ attachment: actualFile });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setFieldsValue({ attachment: null });
  };


  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    scheduledContent: 0,
    pendingContent: 0,
    rejectedContent: 0,
    acceptedContent: 0,
    featuredContent: 0,
    contentGrowth: 0,
    viewsThisMonth: 0,
    engagementRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const allContentRes = await contentService.getPosts({ page: 1, page_size: 1000 });
      const allPosts = allContentRes.results || [];
      
      // Filter posts based on user role
      let filteredPosts = [];
      if (userRole === "admin") {
        filteredPosts = allPosts;
      } else {
        // For moderators, only show their own posts
        filteredPosts = allPosts.filter(post => post.author?.id === userId);
      }
      
      const totalContent = filteredPosts.length;
      const publishedContent = filteredPosts.filter(p => p.status === 'published').length;
      const draftContent = filteredPosts.filter(p => p.status === 'draft').length;
      const scheduledContent = filteredPosts.filter(p => p.status === 'scheduled').length;
      const pendingContent = filteredPosts.filter(p => p.status === 'pending').length;
      const rejectedContent = filteredPosts.filter(p => p.status === 'rejected').length;
      const acceptedContent = filteredPosts.filter(p => p.status === 'accepted').length;
      const featuredContent = filteredPosts.filter(p => p.is_featured === true).length;
      
      setStats({
        totalContent,
        publishedContent,
        draftContent,
        scheduledContent,
        pendingContent,
        rejectedContent,
        acceptedContent,
        featuredContent,
        contentGrowth: 0,
        viewsThisMonth: 0,
        engagementRate: 0
      });
    } catch (err) {
      setStatsError('فشل في تحميل الإحصائيات');
    } finally {
      setStatsLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    loadContent();
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  const loadContent = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        category: typeFilter || undefined,
        status: statusFilter || undefined,
      };

      const response = await contentService.getPosts(params);
      console.log('getPosts response:', response);
      const allPosts = response.results || [];

      let filtered = [];

      if (userRole === "admin") {
        filtered = allPosts;
      } else {
        filtered = allPosts.filter(post => post.author?.id === userId);
      }

      setContent(filtered);
      setTotal(filtered.length); 
    } catch (error) {
      console.error('Failed to load posts:', error);
      message.error('فشل في تحميل المنشورات');
      setContent([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    setEditingContent(null);
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setModalVisible(true);
  };

  const handleEditContent = async (contentItem) => {
    try {
      console.log("🔥 Editing post:", contentItem);

      const detail = await contentService.getPostById(contentItem.id);
      console.log("✅ Full detail:", detail);

      setEditingContent(detail);
      
      setImageFile(null);
      setImagePreview(detail.attachment || null);
      
      // Fix: Set the attachment field properly
      form.setFieldsValue({
        title: detail.title,
        type: detail.category || '',
        status: detail.status || 'draft',
        excerpt: detail.excerpt,
        category: detail.category || '',
        content: detail.content || '', 
        publishDate: detail.publish_at ? moment(detail.publish_at) : null,
        event_date: detail.event_date ? moment(detail.event_date) : null,
        event_location: detail.event_location || '',
        registration_required: detail.registration_required || false,
        registration_deadline: detail.registration_deadline ? moment(detail.registration_deadline) : null,
        max_participants: detail.max_participants || undefined,
        featured_image: detail.featured_image || '',
        attachment: null, // Don't set the URL here, keep it null for new uploads
        isPublic: typeof detail.is_public === 'boolean' ? detail.is_public : false,
        isFeatured: typeof detail.is_featured === 'boolean' ? detail.is_featured : false,
      });

      setModalVisible(true);
    } catch (error) {
      console.error("❌ Failed to load content details:", error);
    }
  };

  const handleDeleteContent = async (contentItem) => {
    confirm({
      title: t('admin.contentManagement.confirmDelete'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          const res = await contentService.deleteContent(contentItem.id, 'post');

          if (!res || res.success === true || res.status === 204) {
            message.success(t('admin.contentManagement.contentDeleted'));
            setContent((prev) => prev.filter((post) => post.id !== contentItem.id));
            loadContent();
            fetchStats();
          } else {
            message.error(res?.message || 'فشل في حذف المحتوى (backend)');
          }
        } catch (error) {
          console.error('Delete error:', error, error?.response);
          if (error?.response?.status === 403 || error?.response?.status === 401) {
            message.error('ليس لديك صلاحية حذف هذا المحتوى');
          } else if (error?.response?.data?.detail) {
            message.error(error.response.data.detail);
          } else {
            message.error(error?.message || 'فشل في حذف المحتوى');
          }
        }
      },
    });
  };

  const handlePreviewContent = async (contentItem) => {
    try {
      setLoading(true);
      const post = await contentService.getPostById(contentItem.id);
      setPreviewContent(post);
      setPreviewVisible(true);
    } catch (err) {
      console.error('Preview error:', err);
      message.error('فشل في تحميل المعاينة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (contentItem) => {
    confirm({
      title: 'إرسال للمراجعة',
      content: 'هل أنت متأكد من إرسال هذا المنشور للمراجعة؟ سيتم إرساله للأدمن للموافقة عليه.',
      icon: <SendOutlined />,
      okText: 'إرسال للمراجعة',
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, { status: 'pending' });
          message.success('تم إرسال المنشور للمراجعة بنجاح');
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Submit for review error:', error);
          message.error('فشل في إرسال المنشور للمراجعة');
        }
      },
    });
  };

  const handleAcceptContent = async (contentItem) => {
    confirm({
      title: 'موافقة على المنشور',
      content: 'هل أنت متأكد من الموافقة على هذا المنشور؟ سيصبح مرئي للضيوف في الموقع.',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      okText: 'موافقة ونشر',
      okButtonProps: { type: 'primary', style: { backgroundColor: '#52c41a' } },
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, { 
            status: 'published', 
            approved_by: userId,
            approved_at: new Date().toISOString()
          });
          message.success('تمت الموافقة على المنشور ونشره للضيوف');
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Accept content error:', error);
          message.error('فشل في الموافقة على المنشور');
        }
      },
    });
  };

  const handleRejectContent = async (contentItem) => {
    let rejectionReason = '';
    
    Modal.confirm({
      title: 'رفض المنشور',
      content: (
        <div style={{ marginTop: 16 }}>
          <p>هل أنت متأكد من رفض هذا المنشور؟</p>
          <Input.TextArea
            placeholder="سبب الرفض (اختياري)"
            onChange={(e) => rejectionReason = e.target.value}
            rows={3}
          />
        </div>
      ),
      icon: <ExceptionOutlined style={{ color: '#ff4d4f' }} />,
      okText: 'رفض',
      okButtonProps: { danger: true },
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, { 
            status: 'rejected',
            rejection_reason: rejectionReason,
            rejected_by: userId,
            rejected_at: new Date().toISOString()
          });
          message.success('تم رفض المنشور');
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Reject content error:', error);
          message.error('فشل في رفض المنشور');
        }
      },
    });
  };

  const handleToggleFeatured = async (contentItem) => {
    const newFeaturedStatus = !contentItem.is_featured;
    const actionText = newFeaturedStatus ? 'جعل المنشور مميز' : 'إلغاء تمييز المنشور';
    const contentText = newFeaturedStatus 
      ? 'المنشور المميز سيظهر في الصفحة الرئيسية (Home) للموقع' 
      : 'سيظهر المنشور في صفحة المنشورات العادية فقط';
    const successText = newFeaturedStatus ? 'تم جعل المنشور مميز وسيظهر في الصفحة الرئيسية' : 'تم إلغاء تمييز المنشور';
    
    confirm({
      title: actionText,
      content: contentText,
      icon: newFeaturedStatus ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />,
      okText: 'تأكيد',
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          // Use patchPost method instead of updatePost
          await contentService.patchPost(contentItem.id, { 
            is_featured: newFeaturedStatus 
          });
          message.success(successText);
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Toggle featured error:', error);
          message.error('فشل في تحديث حالة التمييز');
        }
      },
    });
  };

  const handlePublishContent = async (contentItem) => {
    confirm({
      title: 'نشر المحتوى',
      content: 'هل أنت متأكد من نشر هذا المحتوى؟ سيصبح مرئي للضيوف.',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      okText: 'نشر',
      okButtonProps: { type: 'primary', style: { backgroundColor: '#52c41a' } },
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, { status: 'published' });
          message.success('تم نشر المحتوى بنجاح');
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Publish error:', error);
          message.error('فشل في نشر المحتوى');
        }
      },
    });
  };

  const handleUnpublishContent = async (contentItem) => {
    confirm({
      title: 'إلغاء نشر المحتوى',
      content: 'هل أنت متأكد من إلغاء نشر هذا المحتوى؟ سيصبح غير مرئي للضيوف.',
      icon: <ExclamationCircleOutlined />,
      okText: 'إلغاء النشر',
      okButtonProps: { danger: true },
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, {
            status: 'draft',
            published_at: null
          });
          message.success('تم إلغاء نشر المحتوى بنجاح');
          loadContent();
          fetchStats();
        } catch (error) {
          console.error('Unpublish error:', error);
          message.error('فشل في إلغاء نشر المحتوى');
        }
      },
    });
  };

  const handleSaveContent = async (values) => {
    try {
      console.log('🔍 Form values:', values);
      console.log('🔍 Image file:', imageFile);
      console.log('🔍 Editing content:', editingContent);
      
      let response;
      
      if (editingContent) {
        // Update existing post
        if (imageFile instanceof File && imageFile.size > 0) {
          // Validate file size (5MB limit)
          if (imageFile.size > 5 * 1024 * 1024) {
            message.error('حجم الصورة كبير<|im_start|>. الحد الأقصى 5 ميجا');
            return;
          }
          
          // Validate file type
          if (!imageFile.type.startsWith('image/')) {
            message.error('يجب أن يكون الملف صورة');
            return;
          }
          
          // Create FormData for file upload
          const formData = new FormData();
          
          // Add all form fields except attachment
          Object.keys(values).forEach(key => {
            if (key !== 'attachment' && values[key] !== null && values[key] !== undefined && values[key] !== '') {
              if (key === 'publishDate' && values[key]) {
                formData.append('publish_at', values[key].toISOString());
              } else if (key === 'type') {
                formData.append('category', values[key]);
              } else if (key === 'event_date' && values[key]) {
                formData.append('event_date', values[key].format('YYYY-MM-DD'));
              } else if (key === 'registration_deadline' && values[key]) {
                formData.append('registration_deadline', values[key].format('YYYY-MM-DD'));
              } else if (key === 'isPublic') {
                formData.append('is_public', values[key]);
              } else if (key === 'isFeatured') {
                formData.append('is_featured', values[key]);
              } else {
                formData.append(key, values[key]);
              }
            }
          });
          
          // Add the new file with proper name and validation
          formData.append('attachment', imageFile, imageFile.name);
          
          console.log('🔍 FormData entries for update:');
          for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
          
          response = await contentService.updatePost(editingContent.id, formData);
        } else {
          // Update without file - use JSON
          const updateData = {
            ...values,
            category: values.type,
            is_public: values.isPublic,
            is_featured: values.isFeatured,
            publish_at: values.publishDate ? values.publishDate.toISOString() : null,
            event_date: values.event_date ? values.event_date.format('YYYY-MM-DD') : null,
            registration_deadline: values.registration_deadline ? values.registration_deadline.format('YYYY-MM-DD') : null,
          };
          
          // Remove fields that shouldn't be sent
          delete updateData.attachment;
          delete updateData.type;
          delete updateData.isPublic;
          delete updateData.isFeatured;
          delete updateData.publishDate;
          
          console.log('🔍 JSON update data:', updateData);
          response = await contentService.updatePost(editingContent.id, updateData);
        }
      } else {
        // Create new post - use FormData
        const formData = new FormData();
        
        // Add all form fields except attachment
        Object.keys(values).forEach(key => {
          if (key !== 'attachment' && values[key] !== null && values[key] !== undefined && values[key] !== '') {
            if (key === 'publishDate' && values[key]) {
              formData.append('publish_at', values[key].toISOString());
            } else if (key === 'type') {
              formData.append('category', values[key]);
            } else if (key === 'event_date' && values[key]) {
              formData.append('event_date', values[key].format('YYYY-MM-DD'));
            } else if (key === 'registration_deadline' && values[key]) {
              formData.append('registration_deadline', values[key].format('YYYY-MM-DD'));
            } else if (key === 'isPublic') {
              formData.append('is_public', values[key]);
            } else if (key === 'isFeatured') {
              formData.append('is_featured', values[key]);
            } else {
              formData.append(key, values[key]);
            }
          }
        });
        
        // Add file if exists and is valid
        if (imageFile instanceof File && imageFile.size > 0) {
          // Validate file
          if (imageFile.size > 5 * 1024 * 1024) {
            message.error('حجم الصورة كبير理解和حذف الملف صورة');
            return;
          }
          
          if (!imageFile.type.startsWith('image/')) {
            message.error('يجب أن يكون الملف صورة');
            return;
          }
          
          formData.append('attachment', imageFile, imageFile.name);
          console.log('🔍 Adding image file to FormData:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
          });
        }
        
        console.log('🔍 FormData entries for create:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        response = await contentService.createPost(formData);
      }
      
      const successMessage = editingContent ? 'تم تحديث المحتوى بنجاح' : 'تم إنشاء المحتوى بنجاح';
      message.success(successMessage);
      setModalVisible(false);
      
      setImageFile(null);
      setImagePreview(null);
      
      loadContent();
      fetchStats();
    } catch (error) {
      console.error('Save content error:', error);
      console.error('Error response:', error?.response?.data);
      
      if (error?.response?.data?.attachment) {
        const attachmentErrors = error.response.data.attachment;
        const errorMessage = Array.isArray(attachmentErrors) 
          ? attachmentErrors.join(', ') 
          : attachmentErrors;
        console.error('Attachment validation errors:', errorMessage);
        message.error('خطأ في رفع الصورة: ' + errorMessage);
      } else if (error?.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else if (error?.response?.data) {
        // Show all validation errors
        const errors = Object.entries(error.response.data).map(([field, msgs]) => 
          `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
        ).join('\n');
        message.error(`خطأ في البيانات:\n${errors}`);
      } else {
        message.error('فشل في حفظ المحتوى');
      }
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      published: { color: 'green', text: 'منشور (مرئي للضيوف)' },
      draft: { color: 'orange', text: t('admin.contentManagement.draft') },
      scheduled: { color: 'blue', text: t('admin.contentManagement.scheduled') },
      archived: { color: 'red', text: t('admin.contentManagement.archived') },
      pending: { color: 'gold', text: 'انتظار موافقة الإدارة', icon: <ClockCircleOutlined /> },
      rejected: { color: 'volcano', text: 'مرفوض من الإدارة', icon: <ExceptionOutlined /> },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      post: { color: 'blue', text: t('admin.contentManagement.post') },
      news: { color: 'green', text: t('admin.contentManagement.news') },
      event: { color: 'orange', text: t('admin.contentManagement.event') },
      general: { color: 'default', text: t('admin.contentManagement.general', 'General') },
      activity: { color: 'default', text: t('admin.contentManagement.activity', 'Activity') },
      workshop: { color: 'default', text: t('admin.contentManagement.workshop', 'Workshop') },
      seminar: { color: 'default', text: t('admin.contentManagement.seminar', 'Seminar') },
      conference: { color: 'default', text: t('admin.contentManagement.conference', 'Conference') },
      training: { color: 'default', text: t('admin.contentManagement.training', 'Training') },
      collaboration: { color: 'default', text: t('admin.contentManagement.collaboration', 'Collaboration') },
      achievement: { color: 'default', text: t('admin.contentManagement.achievement', 'Achievement') },
    };
    
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionMenuItems = (contentItem) => {
    let items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: t('admin.contentManagement.preview'),
        onClick: () => handlePreviewContent(contentItem)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('admin.contentManagement.editContent'),
        onClick: () => handleEditContent(contentItem)
      },
      {
        type: 'divider'
      }
    ];

    if (userRole === 'admin') {
      if (contentItem.status === 'pending') {
        items.unshift({
          key: 'accept',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          label: 'موافقة',
          onClick: () => handleAcceptContent(contentItem),
          style: { color: '#52c41a' }
        });
        items.unshift({
          key: 'reject',
          icon: <ExceptionOutlined style={{ color: '#ff4d4f' }} />,
          label: 'رفض',
          onClick: () => handleRejectContent(contentItem),
          danger: true
        });
        items.unshift({ type: 'divider' });
      }

      items.unshift({
        key: 'toggle-featured',
        icon: contentItem.is_featured ? 
          <StarFilled style={{ color: '#faad14' }} /> : 
          <StarOutlined />,
        label: contentItem.is_featured ? 'إلغاء التمييز' : 'جعل مميز',
        onClick: () => handleToggleFeatured(contentItem)
      });

      if (contentItem.status !== 'pending') {
        items.unshift({
          key: 'publish-toggle',
          icon: contentItem.status === 'published' ? <CloseOutlined /> : <CheckOutlined />,
          label: contentItem.status === 'published' ? 'إلغاء النشر' : 'نشر',
          onClick: () => contentItem.status === 'published'
            ? handleUnpublishContent(contentItem)
            : handlePublishContent(contentItem)
        });
      }
      
      items.unshift({ type: 'divider' });
    }

    // مودريتر: إرسال للمراجعة
    if (userRole === 'moderator' && contentItem.status === 'draft') {
      items.unshift({
        key: 'submit-review',
        icon: <SendOutlined />,
        label: 'إرسال للمراجعة',
        onClick: () => handleSubmitForReview(contentItem)
      });
      items.unshift({ type: 'divider' });
    }

    // حذف (للجميع)
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('admin.contentManagement.deleteContent'),
      onClick: () => handleDeleteContent(contentItem),
      danger: true
    });

    return items;
  };

  const columns = [
    {
      title: t('admin.contentManagement.title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ 
            fontWeight: 500, 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {text}
            {record.is_featured && (
              <StarFilled style={{ color: '#faad14', fontSize: '14px' }} />
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.excerpt}
          </Text>
        </div>
      ),
    },
    {
      title: t('admin.contentManagement.type'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => getTypeTag(category),
    },
    {
      title: t('admin.contentManagement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          {getStatusTag(status)}
          {record.status === 'pending' && (
            <Badge count="!" style={{ backgroundColor: '#faad14', marginLeft: 8 }} />
          )}
        </div>
      ),
    },
    {
      title: t('admin.contentManagement.author'),
      dataIndex: 'author',
      key: 'author',
      render: (author) => author?.full_name || '-',
    },
    {
      title: t('admin.contentManagement.publishDate'),
      dataIndex: 'publish_at',
      key: 'publish_at',
      render: (date) => formatDate(date),
    },
    {
      title: t('admin.contentManagement.views'),
      dataIndex: 'view_count',
      key: 'view_count',
      render: (views) => (views || 0).toLocaleString(),
    },
    {
      title: t('admin.contentManagement.actions'),
      key: 'actions',
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title={t('admin.contentManagement.editContent')}>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditContent(record)}
              />
            </Tooltip>
            
            {/* أزرار سريعة للأدمن للمنشورات المعلقة */}
            {userRole === 'admin' && record.status === 'pending' && (
              <>
                <Tooltip title="موافقة">
                  <Button
                    size="small"
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => handleAcceptContent(record)}
                  />
                </Tooltip>
                <Tooltip title="رفض">
                  <Button
                    size="small"
                    danger
                    icon={<ExceptionOutlined />}
                    onClick={() => handleRejectContent(record)}
                  />
                </Tooltip>
              </>
            )}

            {/* زر إرسال للمراجعة للمودريتر */}
            {userRole === 'moderator' && record.status === 'draft' && (
              <Tooltip title="إرسال للمراجعة">
                <Button
                  size="small"
                  icon={<SendOutlined />}
                  style={{ color: '#1890ff', borderColor: '#1890ff' }}
                  onClick={() => handleSubmitForReview(record)}
                />
              </Tooltip>
            )}
            
            <Dropdown
              menu={{ items: getActionMenuItems(record) }}
              trigger={['click']}
            >
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          {t('admin.contentManagement.title')}
        </Title>
        <Text type="secondary">
          {t('admin.contentManagement.description')}
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('admin.contentManagement.totalContent')}
              value={stats.totalContent}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff', transition: 'all 0.3s ease' }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={statsLoading} />}
                  onClick={fetchStats}
                  style={{ marginLeft: '8px' }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('admin.contentManagement.publishedContent')}
              value={stats.publishedContent}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a', transition: 'all 0.3s ease' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('admin.contentManagement.draftContent')}
              value={stats.draftContent}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14', transition: 'all 0.3s ease' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('admin.contentManagement.scheduledContent')}
              value={stats.scheduledContent}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1', transition: 'all 0.3s ease' }}
            />
          </Card>
        </Col>
      </Row>
      {statsError && <Text type="danger">{statsError}</Text>}

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('admin.contentManagement.searchContent')}
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={loadContent}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('admin.contentManagement.filterByType')}
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="">{t('admin.contentManagement.allTypes')}</Option>
              <Option value="general">{t('admin.contentManagement.general')}</Option>
              <Option value="event">{t('admin.contentManagement.event')}</Option>
              <Option value="activity">{t('admin.contentManagement.activity')}</Option>
              <Option value="workshop">{t('admin.contentManagement.workshop')}</Option>
              <Option value="seminar">{t('admin.contentManagement.seminar')}</Option>
              <Option value="conference">{t('admin.contentManagement.conference')}</Option>
              <Option value="training">{t('admin.contentManagement.training')}</Option>
              <Option value="collaboration">{t('admin.contentManagement.collaboration')}</Option>
              <Option value="achievement">{t('admin.contentManagement.achievement')}</Option>
              <Option value="post">{t('admin.contentManagement.post')}</Option>
              <Option value="news">{t('admin.contentManagement.news')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
       <Select
            placeholder={t('admin.contentManagement.filterByStatus')}
            allowClear
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="">{t('admin.contentManagement.allStatuses')}</Option>
            <Option value="published">منشور</Option>
            <Option value="draft">{t('admin.contentManagement.draft')}</Option>
            <Option value="scheduled">{t('admin.contentManagement.scheduled')}</Option>
            <Option value="archived">{t('admin.contentManagement.archived')}</Option>
            <Option value="pending">قيد المراجعة</Option>
            <Option value="rejected">مرفوض</Option>
          </Select>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateContent}
            >
              {t('admin.contentManagement.createNew')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Content Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={content}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} عنصر`,
            }}
            locale={{
              emptyText: t('admin.contentManagement.noContent'),
            }}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* Create/Edit Content Modal */}
    <Modal
  title={editingContent ? t('admin.contentManagement.editContent') : t('admin.contentManagement.createNew')}
  open={modalVisible}
  onCancel={() => {
    setModalVisible(false);
    setImageFile(null);
    setImagePreview(null);
  }}
  footer={null}
  width={800}
  destroyOnHidden
>
  <Form
    form={form}
    layout="vertical"
    onFinish={handleSaveContent}
    initialValues={editingContent ? {
      title: editingContent.title,
      type: editingContent.category || '',
      status: editingContent.status || 'published',
      excerpt: editingContent.excerpt,
      content: editingContent.content || editingContent.body || editingContent.description || '',
      publishDate: editingContent.publish_at ? (typeof editingContent.publish_at === 'string' ? moment(editingContent.publish_at) : editingContent.publish_at) : null,
      event_date: editingContent.event_date ? moment(editingContent.event_date) : null,
      event_location: editingContent.event_location || '',
      registration_required: editingContent.registration_required || false,
      registration_deadline: editingContent.registration_deadline ? moment(editingContent.registration_deadline) : null,
      max_participants: editingContent.max_participants || undefined,
      featured_image: editingContent.featured_image || '',
      attachment: editingContent.attachment || '',
      isPublic: editingContent.is_public,
      isFeatured: editingContent.is_featured,
    } : { status: 'published' }}
  >
    <Row gutter={16}>
      <Col xs={24} md={16}>
        <Form.Item
          name="title"
          label={t('admin.contentManagement.title')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Input placeholder={t('admin.contentManagement.title')} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name="type"
          label={t('admin.contentManagement.type')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select placeholder={t('admin.contentManagement.type')} onChange={() => form.validateFields()}>
            <Option value="general">{t('admin.contentManagement.general')}</Option>
            <Option value="event">{t('admin.contentManagement.event')}</Option>
            <Option value="activity">{t('admin.contentManagement.activity')}</Option>
            <Option value="workshop">{t('admin.contentManagement.workshop')}</Option>
            <Option value="seminar">{t('admin.contentManagement.seminar')}</Option>
            <Option value="conference">{t('admin.contentManagement.conference')}</Option>
            <Option value="training">{t('admin.contentManagement.training')}</Option>
            <Option value="collaboration">{t('admin.contentManagement.collaboration')}</Option>
            <Option value="achievement">{t('admin.contentManagement.achievement')}</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      name="excerpt"
      label={t('admin.contentManagement.excerpt')}
    >
      <TextArea rows={2} placeholder={t('admin.contentManagement.excerpt')} />
    </Form.Item>

     <Form.Item
  name="attachment"
  label="الصورة المرفقة (ستُعرض كصورة مميزة)"
>
  <div>
    <Upload
      name="image"
      listType="picture-card"
      showUploadList={false}
      accept="image/*"
      beforeUpload={() => false} // منع الرفع التلقائي
      onChange={handleImageUpload}
    >
      {imagePreview || (editingContent?.attachment && !imagePreview) ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={imagePreview || editingContent?.attachment}
            alt="صورة مرفقة"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '6px'
            }}
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>
      ) : (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>تحميل صورة</div>
        </div>
      )}
    </Upload>

    <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
      فضل استخدام صور بمقاس 16:9 وحجم أقل من 5 ميجا
    </Text>
  </div>
</Form.Item>


    <Form.Item
      name="content"
      label={t('admin.contentManagement.content')}
      rules={[{ required: true, message: t('validation.required') }]}
    >
      <TextArea rows={8} placeholder={t('admin.contentManagement.content')} />
    </Form.Item>

    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="status"
          label={t('admin.contentManagement.status')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select
            value={form.getFieldValue('status') || undefined}
            onChange={val => form.setFieldsValue({ status: val })}
            disabled={
              // للأدمن: إذا كان المحتوى منشور، نعطل الفيلد بدل ما نخفيه
              JSON.parse(localStorage.getItem("user") || "{}").role === 'admin' && 
              editingContent && 
              editingContent.status === 'published'
            }
          >
            <Option value="draft">{t('admin.contentManagement.draft')}</Option>
            <Option value="scheduled">{t('admin.contentManagement.scheduled')}</Option>
            <Option value="published">{t('admin.contentManagement.published')}</Option>
          </Select>
        </Form.Item>
        
        {/* رسالة توضيحية للأدمن */}
        {JSON.parse(localStorage.getItem("user") || "{}").role === 'admin' && 
        editingContent && 
        editingContent.status === 'published' && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            * لا يمكن تغيير حالة المحتوى المنشور. استخدم أزرار النشر/إلغاء النشر من الجدول.
          </Text>
        )}
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="publishDate"
          label={t('admin.contentManagement.publishDate')}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (getFieldValue('status') === 'scheduled' && !value) {
                  return Promise.reject(new Error('يرجى تحديد موعد النشر'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      </Col>
    </Row>

    {/* باقي الحقول كما هي... */}
    {form.getFieldValue('type') === 'event' && (
      <>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="event_date" label="تاريخ الفعالية">
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="event_location" label="مكان الفعالية">
              <Input placeholder="مكان الفعالية" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="registration_required" label={t('admin.contentManagement.registrationRequired')}>
              <Select>
                <Option value={true}>{t('common.yes')}</Option>
                <Option value={false}>{t('common.no')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="registration_deadline" label="آخر موعد للتسجيل">
              <DatePicker style={{ width: '100%' }} showTime />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="max_participants" label="الحد الأقصى للمشاركين">
              <Input type="number" placeholder="عدد المشاركين" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="attachment" label="مرفق">
              <Input placeholder="رابط أو اسم الملف" />
            </Form.Item>
          </Col>
        </Row>
      </>
    )}

    {JSON.parse(localStorage.getItem("user") || "{}").role === 'admin' && (
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="isPublic"
            label={t('admin.contentManagement.isPublic')}
          >
            <Select>
              <Option value={true}>{t('common.yes')}</Option>
              <Option value={false}>{t('common.no')}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="isFeatured"
            label={t('admin.contentManagement.isFeatured')}
          >
            <Select>
              <Option value={true}>{t('common.yes')}</Option>
              <Option value={false}>{t('common.no')}</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    )}

    {userRole === 'moderator' && (
      <Alert
        message="ملاحظة للمحررين"
        description="عند اختيار 'منشور'، سيتم إرسال المحتوى للإدارة للمراجعة والموافقة قبل ظهوره للضيوف."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    )}

    <Form.Item>
      <Space>
        <Button type="primary" htmlType="submit">
          {userRole === 'moderator' && form.getFieldValue('status') === 'published' 
            ? 'إرسال للمراجعة' 
            : userRole === 'moderator' && form.getFieldValue('status') === 'draft'
            ? 'حفظ كمسودة'
            : t('admin.contentManagement.publishNow')
          }
        </Button>
        <Button onClick={() => setModalVisible(false)}>
          {t('common.cancel')}
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
    <Modal
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      footer={null}
      width={800}
      title={previewContent?.title || 'معاينة المحتوى'}
    >
      {previewContent ? (
        <Typography>
          <Paragraph type="secondary">{previewContent.excerpt}</Paragraph>

          <Divider />
          <Paragraph>
            <Text strong>التصنيف: </Text> {previewContent.category}
          </Paragraph>

          {previewContent.author && (
            <Paragraph>
              <Text strong>الكاتب: </Text> {previewContent.author.full_name}
            </Paragraph>
          )}

          {previewContent.approved_by && (
            <Paragraph>
              <Text strong>تمت الموافقة بواسطة: </Text> {previewContent.approved_by.full_name}
            </Paragraph>
          )}

          <Divider />
          <div
            dangerouslySetInnerHTML={{ __html: previewContent.content || previewContent.body || '' }}
            style={{ lineHeight: 1.8, marginTop: 16 }}
          />
        </Typography>
      ) : (
        <Spin />
      )}
    </Modal>
    </div>
  );
};

export default ContentManagementPage;
