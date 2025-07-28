// components/Publications/PublicationDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, Spin, Modal, message, Typography, Divider, Form, Select, Upload, 
  Space, Row, Col, Tag, Card, Descriptions, Badge, Alert, Tooltip, 
  Avatar, List, Empty, Input, Drawer, Tabs
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, DownloadOutlined, ArrowLeftOutlined, 
  UploadOutlined, UserOutlined, CalendarOutlined, FileOutlined,
  StarOutlined, StarFilled, EyeOutlined, ShareAltOutlined,
  LinkOutlined, BookOutlined, TeamOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, 
  PlusOutlined, MinusOutlined, SettingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';
import researchService from '../../services/researchService';
import { authService } from '../../services/authService';

const { Title, Paragraph, Text, Link } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const PublicationDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [publication, setPublication] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [addAuthorVisible, setAddAuthorVisible] = useState(false);
  const [reviewDrawerVisible, setReviewDrawerVisible] = useState(false);

  // Forms
  const [addAuthorForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  // Load publication data
  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        console.log('📤 Fetching publication with ID:', id);
        const data = await researchService.getPublicationById(id);
        console.log('📥 Publication data received:', data);

        setPublication(data);
        setError(null);

        // Increment view count (don't wait for response)
        researchService.incrementView(id);
        
      } catch (err) {
        console.error('❌ Failed to fetch publication:', err);
        setError(t('failed_to_load_publication_details'));
        message.error(t('failed_to_load_publication_details'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id, t]);

  // Load authors
  useEffect(() => {
    if (publication?.id) {
      fetchAuthors();
    }
  }, [publication?.id]);

  // Load available users for adding authors
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getAllUsers();
        setAvailableUsers(response.results || response);
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
      }
    };
    
    if (user?.is_admin || canEditPublication()) {
      fetchUsers();
    }
  }, [user, publication]);

  const fetchAuthors = async () => {
    setAuthorLoading(true);
    try {
      console.log('📤 Fetching authors for publication ID:', publication.id);
      const response = await researchService.getPublicationAuthors(publication.id);
      console.log('📥 Authors data received:', response);
      setAuthors(response.results || []);
    } catch (err) {
      console.error('❌ Failed to fetch authors:', err);
      message.error(t('failed_to_load_authors'));
    } finally {
      setAuthorLoading(false);
    }
  };

  // Permission checks
  const canEditPublication = () => {
    if (!user || !publication) return false;
    if (user.is_admin) return true;
    return publication.submitted_by === user.id || 
           (publication.authors && publication.authors.some(a => a.author === user.id));
  };

  const canApprovePublication = () => {
    return user?.is_admin && publication?.status === 'pending';
  };

  // Handle delete
  const handleDelete = () => {
    Modal.confirm({
      title: t('confirm_delete'),
      content: t('are_you_sure_you_want_to_delete_this_publication'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await researchService.deletePublication(id);
          message.success(t('publication_deleted_successfully'));
          navigate('/app/research/publications');
        } catch (err) {
          console.error('❌ Failed to delete publication:', err);
          message.error(t('failed_to_delete_publication'));
        }
      },
    });
  };

  // Handle file operations
  const handleFileUpload = async ({ file }) => {
    setFileUploadLoading(true);
    try {
      console.log('📤 Uploading file for publication:', publication.id);
      const response = await researchService.uploadPublicationFile(publication.id, file);
      console.log('📥 File upload response:', response);
      
      setPublication(prev => ({ ...prev, document_file: response.document_file }));
      message.success(t('file_uploaded_successfully'));
    } catch (error) {
      console.error('❌ File upload failed:', error);
      message.error(t('failed_to_upload_file'));
    } finally {
      setFileUploadLoading(false);
    }
  };

  const handleFileDelete = () => {
    Modal.confirm({
      title: t('confirm_delete_file'),
      content: t('are_you_sure_you_want_to_delete_this_file'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await researchService.deletePublicationFile(publication.id);
          setPublication(prev => ({ ...prev, document_file: null }));
          message.success(t('file_deleted_successfully'));
        } catch (err) {
          console.error('❌ Failed to delete file:', err);
          message.error(t('failed_to_delete_file'));
        }
      },
    });
  };

  const handleDownload = async () => {
    try {
      // Increment download count
      await researchService.incrementDownload(id);
      
      if (publication?.document_file) {
        window.open(publication.document_file, '_blank');
      } else {
        message.warning(t('no_file_to_download'));
      }
    } catch (err) {
      console.error('❌ Failed to increment download count:', err);
      // Still allow download even if increment fails
      if (publication?.document_file) {
        window.open(publication.document_file, '_blank');
      }
    }
  };

  // Handle author operations
  const handleAddAuthor = async (values) => {
    try {
      console.log('📤 Adding author to publication:', values);
      await researchService.addAuthorToPublication({
        publication: publication.id,
        author: values.author,
        order: values.order || authors.length + 1,
        role: values.role || '',
        is_corresponding: values.is_corresponding || false,
        is_first_author: values.is_first_author || false,
        is_last_author: values.is_last_author || false,
      });
      
      message.success(t('author_added_successfully'));
      setAddAuthorVisible(false);
      addAuthorForm.resetFields();
      fetchAuthors();
    } catch (error) {
      console.error('❌ Failed to add author:', error);
      message.error(t('failed_to_add_author'));
    }
  };

  const handleRemoveAuthor = async (authorId) => {
    Modal.confirm({
      title: t('confirm_remove_author'),
      content: t('are_you_sure_you_want_to_remove_this_author'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await researchService.removeAuthorFromPublication(authorId);
          message.success(t('author_removed_successfully'));
          fetchAuthors();
        } catch (err) {
          console.error('❌ Failed to remove author:', err);
          message.error(t('failed_to_remove_author'));
        }
      },
    });
  };

  // Handle feature toggle
  const handleFeatureToggle = async () => {
    try {
      await researchService.featurePublication(publication.id);
      setPublication(prev => ({ ...prev, is_featured: !prev.is_featured }));
      message.success(publication.is_featured ? t('publication_unfeatured') : t('publication_featured'));
    } catch (error) {
      console.error('❌ Failed to toggle feature:', error);
      message.error(t('failed_to_toggle_feature'));
    }
  };

  // Handle publication approval/rejection
  const handleReview = async (values) => {
    try {
      console.log('📤 Reviewing publication:', values);
      await researchService.approvePublication(publication.id, values);
      
      setPublication(prev => ({ 
        ...prev, 
        status: values.status,
        review_notes: values.review_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by_name: user.first_name + ' ' + user.last_name
      }));
      
      message.success(t('publication_reviewed_successfully'));
      setReviewDrawerVisible(false);
      reviewForm.resetFields();
    } catch (error) {
      console.error('❌ Failed to review publication:', error);
      message.error(t('failed_to_review_publication'));
    }
  };

  // Utility functions
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { color: 'default', icon: <EditOutlined /> },
      'pending': { color: 'processing', icon: <ClockCircleOutlined /> },
      'approved': { color: 'success', icon: <CheckCircleOutlined /> },
      'rejected': { color: 'error', icon: <ExclamationCircleOutlined /> },
      'published': { color: 'purple', icon: <FileOutlined /> },
    };
    return configs[status] || configs.draft;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('not_specified');
    return moment(dateString).format('MMMM DD, YYYY');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip={t('loading_publication')} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          message={t('error')}
          description={error}
          type="error"
          action={
            <Space>
              <Button size="small" onClick={() => navigate('/app/research/publications')}>
                {t('back_to_list')}
              </Button>
              <Button size="small" type="primary" onClick={() => window.location.reload()}>
                {t('retry')}
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Empty description={t('publication_not_found')} />
      </div>
    );
  }

  const statusConfig = getStatusConfig(publication.status);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/app/research/publications')}
          className="mb-4"
        >
          {t('back_to_list')}
        </Button>
        
        <Space>
          {user?.is_admin && (
            <Button
              icon={publication.is_featured ? <StarFilled /> : <StarOutlined />}
              onClick={handleFeatureToggle}
              type={publication.is_featured ? "primary" : "default"}
            >
              {publication.is_featured ? t('featured') : t('feature')}
            </Button>
          )}
          
          {canApprovePublication() && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => setReviewDrawerVisible(true)}
            >
              {t('review')}
            </Button>
          )}
          
          {canEditPublication() && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/app/research/publications/${id}/edit`)}
            >
              {t('edit')}
            </Button>
          )}

          {canEditPublication() && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              {t('delete')}
            </Button>
          )}
        </Space>
      </div>

      {/* Title and Status */}
      <div className="text-center mb-8">
        <Title level={1} className="mb-4">
          {publication.title}
          {publication.is_featured && (
            <StarFilled className="text-yellow-500 ml-2" />
          )}
        </Title>
        
        <Space size="large" className="mb-4">
          <Tag 
            color={statusConfig.color} 
            icon={statusConfig.icon}
            className="px-3 py-1 text-sm"
          >
            {t(publication.status)}
          </Tag>
          
          {publication.is_public && (
            <Tag color="green" className="px-3 py-1 text-sm">
              {t('public')}
            </Tag>
          )}
          
          <Text type="secondary" className="flex items-center">
            <CalendarOutlined className="mr-1" />
            {t('published_on')}: {formatDate(publication.publication_date)}
          </Text>
          
          <Text type="secondary" className="flex items-center">
            <EyeOutlined className="mr-1" />
            {t('created_on')}: {formatDate(publication.created_at)}
          </Text>
        </Space>

        {/* Quick Actions */}
        <Space size="middle">
          {publication.document_file && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              loading={fileUploadLoading}
            >
              {t('download')}
            </Button>
          )}
          
          <Button icon={<ShareAltOutlined />}>
            {t('share')}
          </Button>
          
          {publication.doi && (
            <Button 
              icon={<LinkOutlined />}
              onClick={() => window.open(`https://doi.org/${publication.doi}`, '_blank')}
            >
              DOI
            </Button>
          )}
        </Space>
      </div>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Left Column - Main Information */}
        <Col span={16}>
          <Tabs defaultActiveKey="overview" size="large">
            <TabPane tab={t('overview')} key="overview">
              {/* Abstract */}
              {publication.abstract && (
                <Card title={t('abstract')} className="mb-6">
                  <Paragraph className="text-justify leading-relaxed">
                    {publication.abstract}
                  </Paragraph>
                </Card>
              )}

              {/* Publication Details */}
              <Card title={t('publication_details')} className="mb-6">
                <Descriptions bordered column={2} size="middle">
                  <Descriptions.Item label={t('publication_type')} span={1}>
                    <Tag color="blue">{t(publication.publication_type)}</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={t('research_area')} span={1}>
                    {publication.research_area || t('not_specified')}
                  </Descriptions.Item>

                  {publication.journal_name && (
                    <Descriptions.Item label={t('journal_name')} span={2}>
                      <Text strong>{publication.journal_name}</Text>
                    </Descriptions.Item>
                  )}

                  {publication.conference_name && (
                    <Descriptions.Item label={t('conference_name')} span={2}>
                      <Text strong>{publication.conference_name}</Text>
                    </Descriptions.Item>
                  )}

                  {publication.publisher && (
                    <Descriptions.Item label={t('publisher')} span={2}>
                      {publication.publisher}
                    </Descriptions.Item>
                  )}

                  {(publication.volume || publication.issue || publication.pages) && (
                    <>
                      {publication.volume && (
                        <Descriptions.Item label={t('volume')} span={1}>
                          {publication.volume}
                        </Descriptions.Item>
                      )}
                      {publication.issue && (
                        <Descriptions.Item label={t('issue')} span={1}>
                          {publication.issue}
                        </Descriptions.Item>
                      )}
                      {publication.pages && (
                        <Descriptions.Item label={t('pages')} span={2}>
                          {publication.pages}
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
              </Card>

              {/* Identifiers */}
              <Card title={t('identifiers')} className="mb-6">
                <Descriptions bordered column={2} size="middle">
                  {publication.doi && (
                    <Descriptions.Item label="DOI" span={2}>
                      <Link href={`https://doi.org/${publication.doi}`} target="_blank">
                        {publication.doi}
                      </Link>
                    </Descriptions.Item>
                  )}
                  
                  {publication.isbn && (
                    <Descriptions.Item label="ISBN" span={1}>
                      {publication.isbn}
                    </Descriptions.Item>
                  )}
                  
                  {publication.issn && (
                    <Descriptions.Item label="ISSN" span={1}>
                      {publication.issn}
                    </Descriptions.Item>
                  )}
                  
                  {publication.pmid && (
                    <Descriptions.Item label="PMID" span={2}>
                      <Link 
                        href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`} 
                        target="_blank"
                      >
                        {publication.pmid}
                      </Link>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Keywords */}
              {publication.keywords && (
                <Card title={t('keywords')} className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {publication.keywords.split(',').map((keyword, index) => (
                      <Tag key={index} color="blue" className="mb-1">
                        {keyword.trim()}
                      </Tag>
                    ))}
                  </div>
                </Card>
              )}

              {/* URLs and Links */}
              {(publication.url || publication.pdf_url) && (
                <Card title={t('links')} className="mb-6">
                  <Space direction="vertical" className="w-full">
                    {publication.url && (
                      <div>
                        <Text strong>{t('publication_url')}: </Text>
                        <Link href={publication.url} target="_blank">
                          {publication.url}
                        </Link>
                      </div>
                    )}
                    {publication.pdf_url && (
                      <div>
                        <Text strong>{t('pdf_url')}: </Text>
                        <Link href={publication.pdf_url} target="_blank">
                          {publication.pdf_url}
                        </Link>
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </TabPane>

            <TabPane tab={t('authors')} key="authors">
              <Card 
                title={
                  <div className="flex justify-between items-center">
                    <span>{t('authors')} ({authors.length})</span>
                    {canEditPublication() && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setAddAuthorVisible(true)}
                      >
                        {t('add_author')}
                      </Button>
                    )}
                  </div>
                }
                loading={authorLoading}
              >
                {authors.length > 0 ? (
                  <List
                    dataSource={authors.sort((a, b) => a.order - b.order)}
                    renderItem={(author) => (
                      <List.Item
                        actions={canEditPublication() ? [
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => handleRemoveAuthor(author.id)}
                          >
                            {t('remove')}
                          </Button>
                        ] : []}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <div className="flex items-center space-x-2">
                              <Text strong>{author.author_name}</Text>
                              <Badge count={author.order} color="blue" />
                              {author.is_corresponding && (
                                <Tag color="gold" size="small">
                                  {t('corresponding')}
                                </Tag>
                              )}
                              {author.is_first_author && (
                                <Tag color="green" size="small">
                                  {t('first_author')}
                                </Tag>
                              )}
                              {author.is_last_author && (
                                <Tag color="purple" size="small">
                                  {t('last_author')}
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              {author.role && (
                                <div>
                                  <Text type="secondary">{t('role')}: </Text>
                                  <Text>{author.role}</Text>
                                </div>
                              )}
                              {author.affiliation_at_publication && (
                                <div>
                                  <Text type="secondary">{t('affiliation')}: </Text>
                                  <Text>{author.affiliation_at_publication}</Text>
                                </div>
                              )}
                              {author.contribution && (
                                <div className="mt-1">
                                  <Text type="secondary">{t('contribution')}: </Text>
                                  <Text>{author.contribution}</Text>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description={t('no_authors_found')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </TabPane>

            <TabPane tab={t('files')} key="files">
              <Card 
                title={t('document_files')}
                extra={
                  canEditPublication() && (
                    <Upload
                      beforeUpload={() => false}
                      onChange={handleFileUpload}
                      maxCount={1}
                      accept=".pdf,.doc,.docx"
                      showUploadList={false}
                    >
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />}
                        loading={fileUploadLoading}
                      >
                        {t('upload_file')}
                      </Button>
                    </Upload>
                  )
                }
              >
                {publication.document_file ? (
                  <div className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <FileOutlined className="text-blue-500 text-lg" />
                        <div>
                          <Text strong>{t('document_file')}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            {t('uploaded_on')}: {formatDate(publication.updated_at)}
                          </Text>
                        </div>
                      </div>
                      <Space>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={handleDownload}
                        >
                          {t('download')}
                        </Button>
                        {canEditPublication() && (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleFileDelete}
                          >
                            {t('delete')}
                          </Button>
                        )}
                      </Space>
                    </div>
                  </div>
                ) : (
                  <Empty 
                    description={t('no_files_uploaded')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    {canEditPublication() && (
                      <Upload
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                        maxCount={1}
                        accept=".pdf,.doc,.docx"
                        showUploadList={false}
                      >
                        <Button 
                          type="primary" 
                          icon={<UploadOutlined />}
                          loading={fileUploadLoading}
                        >
                          {t('upload_first_file')}
                        </Button>
                      </Upload>
                    )}
                  </Empty>
                )}
              </Card>
            </TabPane>

            {user?.is_admin && (
              <TabPane tab={t('admin_info')} key="admin">
                <Card title={t('submission_information')}>
                  <Descriptions bordered column={2} size="middle">
                    <Descriptions.Item label={t('submitted_by')} span={1}>
                      {publication.submitted_by_name || t('unknown')}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={t('submitted_at')} span={1}>
                      {formatDate(publication.submitted_at)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={t('corresponding_author')} span={2}>
                      {publication.corresponding_author_name || t('not_specified')}
                    </Descriptions.Item>
                    
                    {publication.reviewed_by_name && (
                      <>
                        <Descriptions.Item label={t('reviewed_by')} span={1}>
                          {publication.reviewed_by_name}
                        </Descriptions.Item>
                        
                        <Descriptions.Item label={t('reviewed_at')} span={1}>
                          {formatDate(publication.reviewed_at)}
                        </Descriptions.Item>
                        
                        {publication.review_notes && (
                          <Descriptions.Item label={t('review_notes')} span={2}>
                            <Text>{publication.review_notes}</Text>
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                  </Descriptions>
                </Card>
              </TabPane>
            )}
          </Tabs>
        </Col>

        {/* Right Column - Sidebar */}
        <Col span={8}>
          {/* Publication Info Card */}
          <Card title={t('publication_info')} className="mb-6">
            <Space direction="vertical" className="w-full">
              <div>
                <Text type="secondary">{t('publication_type')}: </Text>
                <Tag color="blue">{t(publication.publication_type)}</Tag>
              </div>
              
              <div>
                <Text type="secondary">{t('status')}: </Text>
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {t(publication.status)}
                </Tag>
              </div>
              
              {publication.citation_count > 0 && (
                <div>
                  <Text type="secondary">{t('citations')}: </Text>
                  <Text strong>{publication.citation_count}</Text>
                </div>
              )}
              
              <div>
                <Text type="secondary">{t('visibility')}: </Text>
                <Tag color={publication.is_public ? 'green' : 'orange'}>
                  {publication.is_public ? t('public') : t('private')}
                </Tag>
              </div>
              
              {publication.is_featured && (
                <div>
                  <Text type="secondary">{t('featured')}: </Text>
                  <Tag color="gold" icon={<StarFilled />}>
                    {t('yes')}
                  </Tag>
                </div>
              )}
            </Space>
          </Card>

          {/* Actions Card */}
          <Card title={t('actions')}>
            <Space direction="vertical" className="w-full">
              {canEditPublication() && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/app/research/publications/${id}/edit`)}
                  block
                >
                  {t('edit_publication')}
                </Button>
              )}
              
              {publication.document_file && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  block
                >
                  {t('download_file')}
                </Button>
              )}
              
              <Button
                icon={<ShareAltOutlined />}
                block
              >
                {t('share_publication')}
              </Button>
              
              {canEditPublication() && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  block
                >
                  {t('delete_publication')}
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Add Author Modal */}
      <Modal
        title={t('add_author')}
        open={addAuthorVisible}
        onCancel={() => {
          setAddAuthorVisible(false);
          addAuthorForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={addAuthorForm}
          layout="vertical"
          onFinish={handleAddAuthor}
        >
          <Form.Item
            name="author"
            label={t('select_author')}
            rules={[{ required: true, message: t('please_select_author') }]}
          >
            <Select
              showSearch
              placeholder={t('search_and_select_author')}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableUsers.map(userOption => (
                <Select.Option key={userOption.id} value={userOption.id}>
                  {userOption.first_name} {userOption.last_name} ({userOption.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="order"
            label={t('author_order')}
            rules={[{ required: true, message: t('please_enter_order') }]}
          >
            <Input 
              type="number" 
              min={1} 
              placeholder={t('enter_author_order')}
              defaultValue={authors.length + 1}
            />
          </Form.Item>

          <Form.Item name="role" label={t('role')}>
            <Input placeholder={t('enter_author_role')} />
          </Form.Item>

          <Form.Item name="is_corresponding" valuePropName="checked">
            <Checkbox>{t('corresponding_author')}</Checkbox>
          </Form.Item>

          <Form.Item name="is_first_author" valuePropName="checked">
            <Checkbox>{t('first_author')}</Checkbox>
          </Form.Item>

          <Form.Item name="is_last_author" valuePropName="checked">
            <Checkbox>{t('last_author')}</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setAddAuthorVisible(false)}>
                {t('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('add_author')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Drawer */}
      <Drawer
        title={t('review_publication')}
        placement="right"
        width={400}
        onClose={() => setReviewDrawerVisible(false)}
        open={reviewDrawerVisible}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReview}
        >
          <Form.Item
            name="status"
            label={t('review_decision')}
            rules={[{ required: true, message: t('please_select_status') }]}
          >
            <Select placeholder={t('select_status')}>
              <Select.Option value="approved">{t('approve')}</Select.Option>
              <Select.Option value="rejected">{t('reject')}</Select.Option>
              <Select.Option value="published">{t('publish')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="review_notes" label={t('review_notes')}>
            <TextArea
              rows={4}
              placeholder={t('enter_review_notes')}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item name="is_public" valuePropName="checked">
            <Checkbox>{t('make_public')}</Checkbox>
          </Form.Item>

          <Form.Item name="is_featured" valuePropName="checked">
            <Checkbox>{t('feature_publication')}</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setReviewDrawerVisible(false)}>
                {t('cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('submit_review')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PublicationDetailPage;
