import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Form, Input, Button, Upload, Select, DatePicker, message, Card, Typography, Checkbox, Space, Divider, Row, Col, Spin } from 'antd';
import { UploadOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { researchService } from '../../services';
import { authService } from '../../services/authService';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const publicationTypes = [
  { value: 'journal_article', label: 'Journal Article' },
  { value: 'conference_paper', label: 'Conference Paper' },
  { value: 'book_chapter', label: 'Book Chapter' },
  { value: 'book', label: 'Book' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'report', label: 'Report' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'published', label: 'Published' },
];

const PublicationForm = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const isEditMode = !!id;

  // Fetch available users for authors and corresponding_author
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getAllUsers();
        setAvailableUsers(response.results || response);
      } catch (error) {
        message.error(t('failed_to_load_users_for_authors'));
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [t]);

  // Fetch publication data for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      setInitialLoading(true);
      const fetchPublication = async () => {
        try {
          console.log('Fetching publication with ID:', id);
          const data = await researchService.getPublicationById(id);
          console.log('Fetched publication data:', data);
          
          // Format data to match backend structure exactly
          const formattedData = {
            // Basic fields - exactly as in backend
            title: data.title || '',
            abstract: data.abstract || '',
            publication_type: data.publication_type || 'journal_article',
            journal_name: data.journal_name || '',
            conference_name: data.conference_name || '',
            publisher: data.publisher || '',
            volume: data.volume || '',
            issue: data.issue || '',
            pages: data.pages || '',
            publication_date: data.publication_date ? moment(data.publication_date) : null,
            
            // Identifiers - exactly as in backend
            doi: data.doi || '',
            isbn: data.isbn || '',
            issn: data.issn || '',
            pmid: data.pmid || '',
            
            // URLs - exactly as in backend
            url: data.url || '',
            pdf_url: data.pdf_url || '',
            
            // Keywords and research area - exactly as in backend
            keywords: data.keywords || '',
            research_area: data.research_area || '',
            
            // Corresponding author - exactly as in backend
            corresponding_author: data.corresponding_author || null,
            
            // Status and visibility - exactly as in backend
            status: data.status || 'draft',
            is_public: data.is_public || false,
            
            // Citation count - exactly as in backend
            citation_count: data.citation_count || 0,
            
            // Authors data - format to match backend PublicationAuthor model
            authors_data: data.authors?.map(author => ({
              author: author.author,
              order: author.order || 1,
              role: author.role || '',
              affiliation_at_publication: author.affiliation_at_publication || '',
              contribution: author.contribution || '',
              is_corresponding: author.is_corresponding || false,
              is_first_author: author.is_first_author || false,
              is_last_author: author.is_last_author || false,
            })) || [],
          };

          form.setFieldsValue(formattedData);
          
          // Handle document file
          if (data.document_file) {
            setFileList([{
              uid: '-1',
              name: data.document_file.split('/').pop(),
              status: 'done',
              url: data.document_file,
            }]);
          }
          
          console.log('Form set with formatted data:', formattedData);
        } catch (error) {
          message.error(t('failed_to_load_publication'));
          console.error('Error fetching publication:', error.response?.data || error.message);
          navigate('/app/research/publications');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPublication();
    }
  }, [id, isEditMode, form, t, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare data exactly as backend expects
      const payload = {
        // Basic Information - exactly as backend model fields
        title: values.title,
        abstract: values.abstract || '',
        publication_type: values.publication_type,
        
        // Publication Details - exactly as backend model fields
        journal_name: values.journal_name || '',
        conference_name: values.conference_name || '',
        publisher: values.publisher || '',
        volume: values.volume || '',
        issue: values.issue || '',
        pages: values.pages || '',
        publication_date: values.publication_date ? values.publication_date.format('YYYY-MM-DD') : null,
        
        // Identifiers - exactly as backend model fields
        doi: values.doi || '',
        isbn: values.isbn || '',
        issn: values.issn || '',
        pmid: values.pmid || '',
        
        // URLs and Links - exactly as backend model fields
        url: values.url || '',
        pdf_url: values.pdf_url || '',
        
        // Keywords and Categories - exactly as backend model fields
        keywords: values.keywords || '',
        research_area: values.research_area || '',
        
        // Corresponding Author - exactly as backend model field
        corresponding_author: values.corresponding_author || null,
        
        // Citation Count - exactly as backend model field
        citation_count: values.citation_count || 0,
        
        // Visibility - exactly as backend model field
        is_public: values.is_public || false,
        
        // Authors Data - exactly as backend serializer expects
        authors_data: values.authors_data?.map(author => ({
          author: author.author,
          order: parseInt(author.order) || 1,
          role: author.role || '',
          affiliation_at_publication: author.affiliation_at_publication || '',
          contribution: author.contribution || '',
          is_corresponding: author.is_corresponding || false,
          is_first_author: author.is_first_author || false,
          is_last_author: author.is_last_author || false,
        })) || [],
      };

      // Handle file upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        
        // Add all payload fields to FormData
        Object.keys(payload).forEach(key => {
          if (key === 'authors_data') {
            // Handle authors_data specially for FormData
            payload[key].forEach((author, index) => {
              Object.keys(author).forEach(authorKey => {
                formData.append(`authors_data[${index}][${authorKey}]`, author[authorKey]);
              });
            });
          } else if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });
        
        // Add file
        formData.append('document_file', fileList[0].originFileObj);
        
        console.log('Sending FormData with file');
        if (isEditMode) {
          await researchService.updatePublication(id, formData);
        } else {
          await researchService.createPublication(formData);
        }
      } else {
        // Send JSON payload without file
        console.log('Sending JSON payload:', payload);
        if (isEditMode) {
          await researchService.updatePublication(id, payload);
        } else {
          await researchService.createPublication(payload);
        }
      }

      message.success(isEditMode ? t('publication_updated_successfully') : t('publication_created_successfully'));
      navigate('/app/research/publications');
      
    } catch (error) {
      message.error(t('failed_to_save_publication'));
      console.error('Error saving publication:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('Backend validation errors:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isPdfDocDocx = file.type === 'application/pdf' ||
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isPdfDocDocx) {
      message.error(t('you_can_only_upload_pdf_doc_docx_file'));
      return false;
    }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error(t('file_must_be_smaller_than_100mb'));
      return false;
    }
    return false; // Prevent auto upload
  };

  const onRemove = () => {
    setFileList([]);
    return true;
  };

  if (initialLoading) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/research/publications')} className="mb-4">
        {t('back_to_list')}
      </Button>
      <Title level={2} className="text-center mb-6">{isEditMode ? t('edit_publication') : t('add_new_publication')}</Title>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            publication_type: 'journal_article',
            status: 'draft',
            is_public: false,
            authors_data: [],
            citation_count: 0,
          }}
        >
          <Card title={t('basic_information')} className="mb-6 shadow-sm">
            <Form.Item
              name="title"
              label={t('title')}
              rules={[{ required: true, message: t('please_enter_publication_title') }]}
            >
              <Input placeholder={t('enter_title')} />
            </Form.Item>
            
            <Form.Item
              name="abstract"
              label={t('abstract')}
            >
              <TextArea rows={4} placeholder={t('enter_abstract')} maxLength={2000} showCount />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publication_type"
                  label={t('publication_type')}
                  rules={[{ required: true, message: t('please_select_publication_type') }]}
                >
                  <Select placeholder={t('select_type')}>
                    {publicationTypes.map((type) => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="publication_date"
                  label={t('publication_date')}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="YYYY-MM-DD" 
                    placeholder={t('select_date')}
                    disabledDate={(current) => current && current > moment().endOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="corresponding_author"
              label={t('corresponding_author')}
            >
              <Select
                showSearch
                placeholder={t('select_corresponding_author')}
                optionFilterProp="children"
                allowClear
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableUsers.map(userOption => (
                  <Option key={userOption.id} value={userOption.id}>
                    {userOption.first_name} {userOption.last_name} ({userOption.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="keywords" label={t('keywords')}>
                  <Input placeholder={t('enter_keywords_comma_separated')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="research_area" label={t('research_area')}>
                  <Input placeholder={t('enter_research_area')} maxLength={200} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('publication_details')} className="mb-6 shadow-sm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="journal_name" label={t('journal_name')}>
                  <Input placeholder={t('enter_journal_name')} maxLength={300} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="conference_name" label={t('conference_name')}>
                  <Input placeholder={t('enter_conference_name')} maxLength={300} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="publisher" label={t('publisher')}>
              <Input placeholder={t('enter_publisher')} maxLength={200} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="volume" label={t('volume')}>
                  <Input placeholder={t('enter_volume')} maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="issue" label={t('issue')}>
                  <Input placeholder={t('enter_issue')} maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="pages" label={t('pages')}>
                  <Input placeholder={t('enter_pages_e_g_123_145')} maxLength={50} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('identifiers')} className="mb-6 shadow-sm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="doi" 
                  label={t('doi')}
                  rules={[
                    {
                      pattern: /^10\./,
                      message: t('doi_must_start_with_10')
                    }
                  ]}
                >
                  <Input placeholder={t('enter_doi')} maxLength={200} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isbn" label={t('isbn')}>
                  <Input placeholder={t('enter_isbn')} maxLength={20} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="issn" label={t('issn')}>
                  <Input placeholder={t('enter_issn')} maxLength={20} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pmid" label={t('pmid')}>
                  <Input placeholder={t('enter_pmid')} maxLength={20} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('urls_and_links')} className="mb-6 shadow-sm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="url" 
                  label={t('url')}
                  rules={[
                    {
                      type: 'url',
                      message: t('please_enter_valid_url')
                    }
                  ]}
                >
                  <Input placeholder={t('enter_url')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="pdf_url" 
                  label={t('pdf_url')}
                  rules={[
                    {
                      type: 'url',
                      message: t('please_enter_valid_url')
                    }
                  ]}
                >
                  <Input placeholder={t('enter_pdf_url')} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('authors_information')} className="mb-6 shadow-sm">
            <Form.List name="authors_data">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="mb-4" style={{ border: '1px solid #f0f0f0' }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'author']}
                            label={t('author')}
                            rules={[{ required: true, message: t('missing_author') }]}
                          >
                            <Select
                              showSearch
                              placeholder={t('select_author')}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {availableUsers.map(userOption => (
                                <Option key={userOption.id} value={userOption.id}>
                                  {userOption.first_name} {userOption.last_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'order']}
                            label={t('order')}
                            rules={[{ required: true, message: t('missing_order') }]}
                          >
                            <Input type="number" min={1} placeholder={t('order')} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'role']}
                            label={t('role')}
                          >
                            <Input placeholder={t('role')} maxLength={100} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            className="mt-8"
                          >
                            {t('remove')}
                          </Button>
                        </Col>
                      </Row>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'affiliation_at_publication']}
                            label={t('affiliation')}
                          >
                            <Input placeholder={t('affiliation')} maxLength={300} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'contribution']}
                            label={t('contribution')}
                          >
                            <TextArea rows={2} placeholder={t('contribution')} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'is_corresponding']} valuePropName="checked">
                            <Checkbox>{t('corresponding_author')}</Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'is_first_author']} valuePropName="checked">
                            <Checkbox>{t('first_author')}</Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'is_last_author']} valuePropName="checked">
                            <Checkbox>{t('last_author')}</Checkbox>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      {t('add_author')}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Card title={t('document_file')} className="mb-6 shadow-sm">
            <Form.Item name="document_file" label={t('document_file')}>
              <Upload
                beforeUpload={beforeUpload}
                fileList={fileList}
                onRemove={onRemove}
                onChange={handleFileChange}
                maxCount={1}
                accept=".pdf,.doc,.docx"
              >
                <Button icon={<UploadOutlined />}>{t('select_file')}</Button>
              </Upload>
              <div className="text-gray-500 text-sm mt-2">
                {t('supported_formats')}: PDF, DOC, DOCX (Max: 100MB)
              </div>
            </Form.Item>
          </Card>

          <Card title={t('settings')} className="mb-6 shadow-sm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="citation_count" label={t('citation_count')}>
                  <Input type="number" min={0} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="is_public" valuePropName="checked">
                  <Checkbox>{t('make_publicly_visible')}</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isEditMode ? t('update_publication') : t('create_publication')}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default PublicationForm;