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
  const [submitting, setSubmitting] = useState(false); // Added missing state
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
  const [pageSize, setPageSize] = useState(10);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');

  const handleImagesChange = ({ fileList }) => {
    setImageList(fileList);
  };

  const handleImagePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };

  const handleRemoveImage = (file) => {
    setImageList(imageList.filter(img => img.uid !== file.uid));
  };

  // Get user data
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData?.role;
  const userId = userData?.id;
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

      let filteredPosts = [];
      if (userRole === "admin") {
        filteredPosts = allPosts;
      } else {
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

  const handlePageChange = (page, size) => {
    // Update page size if changed
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
      // Reload with new page size
      loadContent(1);
    } else {
      // Just change page
      loadContent(page);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
    loadContent(1);
  }, [searchTerm, typeFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
      loadContent(1);
    } else {
      loadContent(1);
    }
  }, [pageSize]);

  useEffect(() => {
    loadContent(1);
    fetchStats();
  }, [fetchStats]);

  const loadContent = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        page_size: 1000,
        search: searchTerm || undefined,
        category: typeFilter || undefined,
        status: statusFilter || undefined,
      };

      const response = await contentService.getPosts(params);

      const allPosts = response.results || [];

      // Filter based on user role
      let filtered = [];
      if (userRole === "admin") {
        filtered = allPosts;
      } else {
        filtered = allPosts.filter(post => post.author?.id === userId);
      }

      // Client-side pagination
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      // Ensure page is within valid range
      const validPage = Math.max(1, Math.min(page, totalPages || 1));

      const startIndex = (validPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedContent = filtered.slice(startIndex, endIndex);

      setContent(paginatedContent);
      setTotal(totalItems);
      setCurrentPage(validPage);

    } catch (error) {
      // Handle 404 errors gracefully
      if (error.response?.status === 404) {
        if (currentPage > 1) {
          setCurrentPage(1);
          // Try loading page 1
          setTimeout(() => loadContent(1), 100);
          return;
        }
      }

      message.error('فشل في تحميل المنشورات');
      setContent([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Reset form helper function
  const resetForm = () => {
    form.resetFields();
    setEditingContent(null);
    setImageFile(null);
    setImagePreview(null);
    setImageList([]);
  };

  const handleCreateContent = () => {
    resetForm();
    // Set all default values consistently
    form.setFieldsValue({
      title: '',
      category: '',
      status: 'draft',
      excerpt: '',
      content: '',
      publishDate: null,
      event_date: null,
      event_location: '',
      registration_required: false,
      registration_deadline: null,
      max_participants: undefined,
      featured_image: '',
      attachment: '',
      isPublic: false,
      isFeatured: false,
    });
    setModalVisible(true);
  };

  const handleEditContent = async (contentItem) => {
    try {
      if (userRole === 'moderator' && contentItem.author?.id !== userId) {
        message.error('ليس لديك صلاحية تعديل هذا المحتوى. يمكنك تعديل المحتوى الخاص بك فقط.');
        return;
      }

      const detail = await contentService.getPostByIdForAdmin(contentItem.id);

      setEditingContent(detail);
      setImageFile(null);
      setImagePreview(detail.attachment || null);

      const fileList = Array.isArray(detail.images)
        ? detail.images.map((img, idx) => ({
          uid: img.id ? String(img.id) : `old-${idx}`,
          name: img.caption || `image-${idx + 1}`,
          status: 'done',
          url: img.image_url || img.image,
          thumbUrl: img.image_url || img.image,
          originFileObj: null
        }))
        : [];
      setImageList(fileList);

      form.setFieldsValue({
        title: detail.title,
        category: detail.category || '',
        status: detail.status || 'draft',
        excerpt: detail.excerpt,
        content: detail.content || '',
        publishDate: detail.publish_at ? moment(detail.publish_at) : null,
        event_date: detail.event_date ? moment(detail.event_date) : null,
        event_location: detail.event_location || '',
        registration_required: detail.registration_required || false,
        registration_deadline: detail.registration_deadline ? moment(detail.registration_deadline) : null,
        max_participants: detail.max_participants || undefined,
        featured_image: detail.featured_image || '',
        attachment: detail.attachment || '',
        isPublic: typeof detail.is_public === 'boolean' ? detail.is_public : false,
        isFeatured: typeof detail.is_featured === 'boolean' ? detail.is_featured : false,
      });

      setModalVisible(true);
    } catch (error) {
      message.error('فشل في تحميل تفاصيل المحتوى للتعديل');
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
      const post = await contentService.getPostByIdForAdmin(contentItem.id);
      setPreviewContent(post);
      setPreviewVisible(true);
    } catch (err) {
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

          // Update local state immediately
          setContent(prev => prev.map(item =>
            item.id === contentItem.id
              ? { ...item, status: 'published', approved_by: userId, approved_at: new Date().toISOString() }
              : item
          ));

          message.success('تمت الموافقة على المنشور ونشره للضيوف');

          // Refresh data
          await loadContent();
          fetchStats();
        } catch (error) {
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

          // Update local state immediately
          setContent(prev => prev.map(item =>
            item.id === contentItem.id
              ? {
                ...item,
                status: 'rejected',
                rejection_reason: rejectionReason,
                rejected_by: userId,
                rejected_at: new Date().toISOString()
              }
              : item
          ));

          message.success('تم رفض المنشور');

          // Refresh data
          await loadContent();
          fetchStats();
        } catch (error) {
          message.error('فشل في رفض المنشور');
        }
      },
    });
  };

  const handleToggleFeatured = async (contentItem) => {
    const newFeaturedStatus = !contentItem.is_featured;
    const actionText = newFeaturedStatus ? 'تمييز المحتوى' : 'إلغاء تمييز المحتوى';
    const contentText = newFeaturedStatus
      ? 'هل أنت متأكد من تمييز هذا المحتوى؟ سيظهر في القسم المميز.'
      : 'هل أنت متأكد من إلغاء تمييز هذا المحتوى؟';
    const successText = newFeaturedStatus ? 'تم تمييز المحتوى بنجاح' : 'تم إلغاء تمييز المحتوى بنجاح';

    confirm({
      title: actionText,
      content: contentText,
      icon: newFeaturedStatus ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />,
      okText: 'تأكيد',
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await contentService.patchPost(contentItem.id, {
            is_featured: newFeaturedStatus
          });
          message.success(successText);
          loadContent();
          fetchStats();
        } catch (error) {
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
          message.error('فشل في إلغاء نشر المحتوى');
        }
      },
    });
  };

  const handleSaveContent = async (values) => {

    try {
      setSubmitting(true);

      const postData = {
        title: values.title,
        content: values.content || '',
        excerpt: values.excerpt || '',
        category: values.category,
        status: values.status || 'draft',
        is_public: Boolean(values.isPublic),
        is_featured: Boolean(values.isFeatured),
      };

      // Add optional fields
      if (values.publishDate) {
        postData.publish_at = values.publishDate.toISOString();
      }
      if (values.event_date) {
        postData.event_date = values.event_date.format('YYYY-MM-DD');
      }
      if (values.event_location) {
        postData.event_location = values.event_location;
      }
      if (typeof values.registration_required === 'boolean') {
        postData.registration_required = values.registration_required;
      }
      if (values.registration_deadline) {
        postData.registration_deadline = values.registration_deadline.format('YYYY-MM-DD');
      }
      if (values.max_participants) {
        postData.max_participants = parseInt(values.max_participants);
      }
      if (values.featured_image) {
        postData.featured_image = values.featured_image;
      }
      if (values.attachment) {
        postData.attachment = values.attachment;
      }

      let response;

      if (editingContent) {
        // Update existing post
        response = await contentService.patchPost(editingContent.id, postData);

        // Handle image updates
        const originalImages = editingContent.images || [];
        const currentImageIds = imageList
          .filter(img => !img.originFileObj && img.uid)
          .map(img => img.uid);

        // Delete removed images
        const deletedImages = originalImages.filter(img =>
          !currentImageIds.includes(String(img.id))
        );

        for (const img of deletedImages) {
          try {
            await contentService.deletePostImage(editingContent.id, img.id);
          } catch (err) {
            // console.error('Error deleting image:', err);
          }
        }

        // Upload new images
        const newImages = imageList.filter(img => img.originFileObj instanceof File);
        for (const img of newImages) {
          try {
            const imageFormData = new FormData();
            imageFormData.append('image', img.originFileObj, img.name || img.originFileObj.name);
            await contentService.uploadPostImage(editingContent.id, imageFormData);
          } catch (err) {
            message.error(`فشل في رفع الصورة: ${img.name}`);
          }
        }

        // Get updated post data
        response = await contentService.getPostByIdForAdmin(editingContent.id);

      } else {

        // Create new post
        response = await contentService.createPostJSON(postData);

        // Upload images for new post
        const validImages = imageList.filter(img => img.originFileObj instanceof File);
        if (validImages.length > 0 && response.id) {
          for (const img of validImages) {
            try {
              const imageFormData = new FormData();
              imageFormData.append('image', img.originFileObj, img.name || img.originFileObj.name);
              await contentService.uploadPostImage(response.id, imageFormData);
            } catch (imageError) {
              message.error(`فشل في رفع الصورة: ${img.name}`);
            }
          }
          // Get updated post with images
          response = await contentService.getPostByIdForAdmin(response.id);
        }
      }

      const successMessage = editingContent ? 'تم تحديث المحتوى بنجاح' : 'تم إنشاء المحتوى بنجاح';
      message.success(successMessage);

      setModalVisible(false);
      resetForm();
      await loadContent(currentPage);
      await fetchStats();

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'فشل في حفظ المحتوى';
      message.error('فشل في حفظ المحتوى: ' + errorMessage);
    } finally {
      setSubmitting(false);
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

  const getActionMenuItems = (record) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: t('admin.contentManagement.preview'),
        onClick: () => handlePreviewContent(record)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('admin.contentManagement.editContent'),
        onClick: () => handleEditContent(record)
      },
      {
        type: 'divider'
      }
    ];

    if (userRole === 'admin') {
      if (record.status === 'pending') {
        items.unshift({
          key: 'accept',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          label: 'موافقة',
          onClick: () => handleAcceptContent(record),
          style: { color: '#52c41a' }
        });
        items.unshift({
          key: 'reject',
          icon: <ExceptionOutlined style={{ color: '#ff4d4f' }} />,
          label: 'رفض',
          onClick: () => handleRejectContent(record),
          danger: true
        });
        items.unshift({ type: 'divider' });
      }

      items.unshift({
        key: 'toggle-featured',
        icon: record.is_featured ?
          <StarFilled style={{ color: '#faad14' }} /> :
          <StarOutlined />,
        label: record.is_featured ? 'إلغاء التمييز' : 'جعل مميز',
        onClick: () => handleToggleFeatured(record)
      });

      if (record.status !== 'pending') {
        items.unshift({
          key: 'publish-toggle',
          icon: record.status === 'published' ? <CloseOutlined /> : <CheckOutlined />,
          label: record.status === 'published' ? 'إلغاء النشر' : 'نشر',
          onClick: () => record.status === 'published'
            ? handleUnpublishContent(record)
            : handlePublishContent(record)
        });
      }

      items.unshift({ type: 'divider' });
    }

    // مودريتر: إرسال للمراجعة
    if (userRole === 'moderator' && record.status === 'draft') {
      items.unshift({
        key: 'submit-review',
        icon: <SendOutlined />,
        label: 'إرسال للمراجعة',
        onClick: () => handleSubmitForReview(record)
      });
      items.unshift({ type: 'divider' });
    }

    // حذف (للجميع)
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('admin.contentManagement.deleteContent'),
      onClick: () => handleDeleteContent(record),
      danger: true
    });

    return items;
  };

  const handleMenuClick = (menuInfo, contentItem) => {
    const { key } = menuInfo;

    switch (key) {
      case 'view':
        handlePreviewContent(contentItem);
        break;
      case 'edit':
        handleEditContent(contentItem);
        break;
      case 'accept':
        handleAcceptContent(contentItem);
        break;
      case 'reject':
        handleRejectContent(contentItem);
        break;
      case 'toggle-featured':
        handleToggleFeatured(contentItem);
        break;
      case 'publish-toggle':
        if (contentItem.status === 'published') {
          handleUnpublishContent(contentItem);
        } else {
          handlePublishContent(contentItem);
        }
        break;
      case 'submit-review':
        handleSubmitForReview(contentItem);
        break;
      case 'delete':
        handleDeleteContent(contentItem);
        break;
      default:
        // console.log('Unknown action!');
    }
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
              menu={{
                items: getActionMenuItems(record),
                onClick: (menuInfo) => handleMenuClick(menuInfo, record)
              }}
              trigger={['click']}
            >
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    }
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
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => {
                if (total === 0) return 'لا يوجد عناصر';
                return `${range[0]}-${range[1]} من ${total} عنصر`;
              },
              pageSizeOptions: ['10', '20', '50', '100'],
              hideOnSinglePage: false,
              simple: false,
            }}
            locale={{
              emptyText: t('admin.contentManagement.noContent') || 'لا يوجد محتوى',
            }}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* Create/Edit Content Modal - UNIFIED FORM */}
      <Modal
        title={editingContent ? t('admin.contentManagement.editContent') : t('admin.contentManagement.createNew')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={800}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveContent}
          initialValues={{
            status: 'draft',
            isPublic: false,
            isFeatured: false,
            registration_required: false
          }}
        >
          {/* Basic Information */}
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
                name="category"
                label={t('admin.contentManagement.type')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select placeholder={t('admin.contentManagement.type')}>
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
            name="content"
            label={t('admin.contentManagement.content')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <TextArea rows={8} placeholder={t('admin.contentManagement.content')} />
          </Form.Item>

          {/* Images Section */}
          <Form.Item
            name="images"
            label="الصور المرفقة (يمكن رفع أكثر من صورة)"
          >
            <div>
              <Upload
                listType="picture-card"
                fileList={imageList}
                multiple
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleImagesChange}
                onPreview={handleImagePreview}
                onRemove={handleRemoveImage}
              >
                {imageList.length < 8 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>تحميل صور</div>
                  </div>
                )}
              </Upload>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                فضل استخدام صور بمقاس 16:9 وحجم أقل من 5 ميجا
              </Text>
            </div>
          </Form.Item>

          {/* Status and Publishing */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label={t('admin.contentManagement.status')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select
                  disabled={
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

          {/* Event-specific fields */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
            prevValues.category !== currentValues.category
          }>
            {({ getFieldValue }) =>
              getFieldValue('category') === 'event' && (
                <>
                  <Divider>تفاصيل الفعالية</Divider>
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
                    <Col xs={24} md={8}>
                      <Form.Item name="registration_required" label="التسجيل مطلوب؟">
                        <Select>
                          <Option value={true}>{t('common.yes')}</Option>
                          <Option value={false}>{t('common.no')}</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="registration_deadline" label="آخر موعد للتسجيل">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="max_participants" label="الحد الأقصى للمشاركين">
                        <Input type="number" placeholder="عدد المشاركين" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
          </Form.Item>

          

          {/* Admin-only fields */}
          {JSON.parse(localStorage.getItem("user") || "{}").role === 'admin' && (
            <>
              <Divider>إعدادات الإدارة</Divider>
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
            </>
          )}

          {/* Moderator Alert */}
          {userRole === 'moderator' && (
            <Alert
              message="ملاحظة للمحررين"
              description="عند اختيار 'منشور'، سيتم إرسال المحتوى للإدارة للمراجعة والموافقة قبل ظهوره للضيوف."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Form Actions */}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting}
              >
                {submitting
                  ? 'جاري الحفظ...'
                  : userRole === 'moderator' && form.getFieldValue('status') === 'published'
                    ? 'إرسال للمراجعة'
                    : userRole === 'moderator' && form.getFieldValue('status') === 'draft'
                      ? 'حفظ كمسودة'
                      : editingContent
                        ? 'تحديث المحتوى'
                        : 'إنشاء المحتوى'
                }
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                resetForm();
              }}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewVisible && previewImage === ''}
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

      {/* Image Preview Modal */}
      <Modal
        open={previewImage !== ''}
        title="معاينة الصورة"
        footer={null}
        onCancel={() => setPreviewImage('')}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ContentManagementPage;