import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Modal, message, Typography, Divider, Form, Select, Upload, Space, Row, Col, Tag, Card, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, ArrowLeftOutlined, UploadOutlined, UserOutlined, CalendarOutlined, FileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { researchService } from '../../services';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PublicationDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [publication, setPublication] = useState(null);
  const [error, setError] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        console.log('Fetching publication with ID:', id);
        const data = await researchService.getPublicationById(id);
        console.log('Fetched publication data:', data);
        setPublication(data);
        setFile(data.document_file ? { id: 'document', name: 'Publication File', file: data.document_file } : null);
        setError(null);
        await researchService.incrementView(id);
      } catch (err) {
        console.error('Failed to fetch publication:', err.response?.data || err.message);
        setError(t('failed_to_load_publication_details'));
        message.error(t('failed_to_load_publication_details'));
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id, t]);

  useEffect(() => {
    if (publication?.id) {
      fetchAuthors();
    }
  }, [publication]);

  const fetchAuthors = async () => {
    setAuthorLoading(true);
    try {
      console.log('Fetching authors for publication ID:', publication.id);
      const response = await researchService.getPublicationAuthors(publication.id);
      console.log('Fetched authors:', response);
      setAuthors(response.results || []);
    } catch (err) {
      console.error('Failed to fetch authors:', err.response?.data || err.message);
      message.error(t('failed_to_load_authors'));
    } finally {
      setAuthorLoading(false);
    }
  };

  const handleDelete = () => {
    console.log('Attempting to delete publication with ID:', id);
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
          console.error('Failed to delete publication:', err.response?.data || err.message);
          message.error(t('failed_to_delete_publication'));
        }
      },
    });
  };

  const handleDeleteFile = () => {
    Modal.confirm({
      title: t('confirm_delete_file'),
      content: t('are_you_sure_you_want_to_delete_this_file'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await researchService.deletePublicationFile(publication.id);
          setFile(null);
          message.success(t('file_deleted_successfully'));
        } catch (err) {
          console.error('Failed to delete file:', err.response?.data || err.message);
          message.error(t('failed_to_delete_file'));
        }
      },
    });
  };

  const handleDownload = async () => {
    try {
      await researchService.incrementDownload(id);
      if (publication?.document_file) {
        window.open(publication.document_file, '_blank');
      } else {
        message.warning(t('no_file_to_download'));
      }
    } catch (err) {
      console.error('Failed to increment download count:', err.response?.data || err.message);
      message.error(t('failed_to_increment_download_count'));
    }
  };

  const handleFileUpload = async ({ file }) => {
    setFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('document_file', file);
      const response = await researchService.updatePublication(publication.id, formData);
      setPublication(response);
      setFile({ id: 'document', name: file.name, file: response.document_file });
      message.success(t('file_uploaded_successfully'));
    } catch (error) {
      console.error('File upload failed:', error.response?.data || error.message);
      message.error(t('failed_to_upload_file'));
    } finally {
      setFileLoading(false);
    }
  };

  const handleRemoveAuthor = async (authorId) => {
    console.log('Attempting to remove author with ID:', authorId);
    Modal.confirm({
      title: t('confirm_remove_author'),
      content: t('are_you_sure_you_want_to_remove_this_author'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await researchService.removeAuthorFromPublication(publication.id, authorId);
          message.success(t('author_removed_successfully'));
          fetchAuthors();
        } catch (err) {
          console.error('Failed to remove author:', err.response?.data || err.message);
          message.error(t('failed_to_remove_author'));
        }
      },
    });
  };

  const handleAddAuthor = () => {
    Modal.confirm({
      title: t('add_author'),
      content: (
        <Form form={form} layout="vertical">
          <Form.Item name="author_id" label={t('author_id')} rules={[{ required: true, message: t('please_enter_author_id') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('role')}>
            <Input />
          </Form.Item>
        </Form>
      ),
      okText: t('add'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          await researchService.addAuthorToPublication(publication.id, {
            author: values.author_id,
            role: values.role,
          });
          message.success(t('author_added_successfully'));
          fetchAuthors();
          form.resetFields();
        } catch (error) {
          console.error('Failed to add author:', error.response?.data || error.message);
          message.error(t('failed_to_add_author'));
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'pending': 'processing',
      'approved': 'success',
      'rejected': 'error',
      'published': 'purple'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <Paragraph>{t('error_loading_publication')}</Paragraph>
      </div>
    );
  }

  if (!publication) {
    return null;
  }

  const isOwner =
    user &&
    (user.is_admin ||
      publication.submitted_by === user.id ||
      (Array.isArray(publication.authors) && publication.authors.some(a => a.author?.id === user.id)));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/research/publications')} className="mb-4">
        {t('back_to_list')}
      </Button>
      
      <div className="text-center mb-8">
        <Title level={2} className="mb-4">{publication.title}</Title>
        <Space size="middle">
          <Tag color={getStatusColor(publication.status)} icon={<FileOutlined />}>
            {t(publication.status)}
          </Tag>
          {publication.is_public && <Tag color="green">Public</Tag>}
          <Text type="secondary">
            <CalendarOutlined /> {formatDate(publication.publication_date)}
          </Text>
        </Space>
      </div>

      <Card title={t('basic_information')} className="mb-6">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label={t('publication_type')} span={1}>
            {t(publication.publication_type)}
          </Descriptions.Item>
          <Descriptions.Item label={t('status')} span={1}>
            <Tag color={getStatusColor(publication.status)}>{t(publication.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('publication_date')} span={1}>
            {formatDate(publication.publication_date)}
          </Descriptions.Item>
          <Descriptions.Item label={t('citation_count')} span={1}>
            {publication.citation_count || 0}
          </Descriptions.Item>
          <Descriptions.Item label={t('corresponding_author')} span={2}>
            {publication.corresponding_author_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={t('research_area')} span={2}>
            {publication.research_area || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={t('keywords')} span={2}>
            {publication.keywords ? (
              <div>
                {publication.keywords.split(',').map((keyword, index) => (
                  <Tag key={index} color="blue" className="mb-1">
                    {keyword.trim()}
                  </Tag>
                ))}
              </div>
            ) : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {publication.abstract && (
        <Card title={t('abstract')} className="mb-6">
          <Paragraph>{publication.abstract}</Paragraph>
        </Card>
      )}

      <Card title={t('publication_details')} className="mb-6">
        <Descriptions bordered column={2} size="small">
          {publication.journal_name && (
            <Descriptions.Item label={t('journal_name')} span={2}>
              {publication.journal_name}
            </Descriptions.Item>
          )}
          {publication.conference_name && (
            <Descriptions.Item label={t('conference_name')} span={2}>
              {publication.conference_name}
            </Descriptions.Item>
          )}
          {publication.publisher && (
            <Descriptions.Item label={t('publisher')} span={2}>
              {publication.publisher}
            </Descriptions.Item>
          )}
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
        </Descriptions>
      </Card>

      <Card title={t('identifiers')} className="mb-6">
        <Descriptions bordered column={2} size="small">
          {publication.doi && (
            <Descriptions.Item label="DOI" span={2}>
              <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                {publication.doi}
              </a>
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
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`} target="_blank" rel="noopener noreferrer">
                {publication.pmid}
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {(publication.url || publication.pdf_url) && (
        <Card title={t('urls_and_links')} className="mb-6">
          <Descriptions bordered column={1} size="small">
            {publication.url && (
              <Descriptions.Item label={t('url')}>
                <a href={publication.url} target="_blank" rel="noopener noreferrer">
                  {publication.url}
                </a>
              </Descriptions.Item>
            )}
            {publication.pdf_url && (
              <Descriptions.Item label={t('pdf_url')}>
                <a href={publication.pdf_url} target="_blank" rel="noopener noreferrer">
                  {publication.pdf_url}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      <Card 
        title={t('authors')} 
        className="mb-6"
        extra={
          isOwner && (
            <Button type="dashed" size="small" onClick={handleAddAuthor}>
              {t('add_author')}
            </Button>
          )
        }
      >
        {authorLoading ? (
          <Spin />
        ) : (
          <div>
            {authors.length > 0 ? (
              authors.map((author, index) => (
                <Card 
                  key={author.id || index} 
                  size="small" 
                  className="mb-3"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <Row align="middle" justify="space-between">
                    <Col span={20}>
                      <div>
                        <Text strong>
                          <UserOutlined /> {author.author_name}
                        </Text>
                        {author.role && <Tag color="blue" className="ml-2">{author.role}</Tag>}
                        {author.is_corresponding && <Tag color="gold">Corresponding</Tag>}
                        {author.is_first_author && <Tag color="green">First Author</Tag>}
                        {author.is_last_author && <Tag color="purple">Last Author</Tag>}
                      </div>
                      {author.affiliation_at_publication && (
                        <div className="mt-1">
                          <Text type="secondary" className="text-sm">
                            Affiliation: {author.affiliation_at_publication}
                          </Text>
                        </div>
                      )}
                      {author.contribution && (
                        <div className="mt-1">
                          <Text type="secondary" className="text-sm">
                            Contribution: {author.contribution}
                          </Text>
                        </div>
                      )}
                      {author.order && (
                        <div className="mt-1">
                          <Text type="secondary" className="text-sm">
                            Order: {author.order}
                          </Text>
                        </div>
                      )}
                    </Col>
                    <Col span={4} className="text-right">
                      {isOwner && (
                        <Button
                          size="small"
                          danger
                          onClick={() => handleRemoveAuthor(author.id)}
                        >
                          {t('remove')}
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Text type="secondary">No authors found</Text>
            )}
          </div>
        )}
      </Card>

      <Card 
        title={t('files')} 
        className="mb-6"
        extra={
          isOwner && (
            <Button type="dashed" size="small">
              <label className="cursor-pointer">
                {t('upload_file')}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files[0] && handleFileUpload({ file: e.target.files[0] })}
                />
              </label>
            </Button>
          )
        }
      >
        {fileLoading ? (
          <Spin />
        ) : (
          <div>
            {file ? (
              <Card size="small" style={{ backgroundColor: '#f6f8ff' }}>
                <Row align="middle" justify="space-between">
                  <Col span={20}>
                    <Space>
                      <FileOutlined />
                      <a href={file.file} target="_blank" rel="noopener noreferrer">
                        {file.name}
                      </a>
                    </Space>
                  </Col>
                  <Col span={4} className="text-right">
                    {isOwner && (
                      <Button
                        size="small"
                        danger
                        onClick={handleDeleteFile}
                      >
                        {t('delete')}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>
            ) : (
              <Text type="secondary">No files uploaded</Text>
            )}
          </div>
        )}
      </Card>


      <div className="mt-8 text-center">
        <Space size="large">
          {isOwner && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/app/research/publications/${id}/edit`)}
            >
              {t('edit')}
            </Button>
          )}
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            {t('delete')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PublicationDetailPage;