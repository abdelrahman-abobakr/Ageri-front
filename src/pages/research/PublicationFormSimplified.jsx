import React, { useEffect, useState } from 'react';
import {
  Form, Input, Button, Select, DatePicker, Card, Typography,
  Row, Col, Spin, Alert, Switch, Space, Divider, App
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, InfoCircleOutlined,
  BookOutlined, LinkOutlined, TagsOutlined, SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';
import researchService from '../../services/researchService';

const { Title, Text } = Typography;
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

const PublicationFormSimplified = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { message: messageApi } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [doiExists, setDoiExists] = useState(false);

  const isEditMode = !!id;

  // Load publication data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setInitialLoading(true);
      const fetchPublication = async () => {
        try {
          const data = await researchService.getPublicationById(id);
          form.setFieldsValue({
            ...data,
            publication_date: data.publication_date ? moment(data.publication_date) : null,
          });
        } catch (error) {
          messageApi.error('Failed to load publication');
          navigate('/app/research/publications');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPublication();
    }
  }, [id, isEditMode, form, navigate, messageApi]);

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        publication_date: values.publication_date ? values.publication_date.format('YYYY-MM-DD') : null,
      };

      if (isEditMode) {
        await researchService.updatePublication(id, payload);
        messageApi.success('Publication updated successfully');
      } else {
        await researchService.createPublication(payload);
        messageApi.success('Publication created successfully');
      }

      navigate('/app/research/publications');
    } catch (error) {
      messageApi.error('Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading publication data..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app/research/publications')}
          className="mb-4"
        >
          Back to Publications
        </Button>
        <Title level={2}>
          {isEditMode ? 'Edit Publication' : 'Add New Publication'}
        </Title>
        <Text type="secondary">
          {isEditMode ? 'Update publication information' : 'Create a new research publication'}
        </Text>
      </div>

      <Spin spinning={loading} tip="Saving publication...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            publication_type: 'journal_article',
            is_public: false,
            // citation_count: 0,
          }}
        >
          {/* Basic Information */}
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                Basic Information
              </Space>
            }
            className="mb-6"
          >
            <Form.Item
              name="title"
              label="Publication Title"
              rules={[
                { required: true, message: 'Please enter publication title' },
                { min: 10, message: 'Title must be at least 10 characters' },
                { max: 500, message: 'Title cannot exceed 500 characters' }
              ]}
            >
              <Input
                placeholder="Enter descriptive title"
                showCount
                maxLength={500}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="abstract"
              label="Abstract"
              rules={[
                { required: true, message: 'Please enter publication abstract' },
                { min: 50, message: 'Abstract must be at least 50 characters' },
                { max: 2000, message: 'Abstract cannot exceed 2000 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter publication abstract"
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publication_type"
                  label="Publication Type"
                  rules={[{ required: true, message: 'Please select publication type' }]}
                >
                  <Select
                    placeholder="Select publication type"
                    size="large"
                    allowClear={false}
                  >
                    {publicationTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="research_area" label="Research Area">
                  <Input
                    placeholder="Enter research field"
                    maxLength={200}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="keywords" label="Keywords">
              <Input
                placeholder="Enter keywords separated by commas"
                size="large"
              />
            </Form.Item>
          </Card>

          {/* Publication Details */}
          <Card
            title={
              <Space>
                <BookOutlined />
                Publication Details
              </Space>
            }
            className="mb-6"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="journal_name" label="Journal Name">
                  <Input placeholder="Enter journal name" maxLength={300} />
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item name="conference_name" label="Conference Name">
                  <Input placeholder="Enter conference name" maxLength={300} />
                </Form.Item>
              </Col> */}
            </Row>

            {/* <Form.Item name="publisher" label="Publisher">
              <Input placeholder="Enter publisher name" maxLength={200} />
            </Form.Item> */}

            <Row gutter={16}>
              {/* <Col span={6}>
                <Form.Item name="volume" label="Volume">
                  <Input placeholder="Vol. number" maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="issue" label="Issue">
                  <Input placeholder="Issue number" maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="pages" label="Pages">
                  <Input placeholder="123-145" maxLength={50} />
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item name="publication_date" label="Publication Date">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                    disabledDate={(current) => current && current > moment().endOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Links & Identifiers */}
          <Card
            title={
              <Space>
                <LinkOutlined />
                Links & Identifiers
              </Space>
            }
            className="mb-6"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="url"
                  label="Publication URL"
                  rules={[{ type: 'url', message: 'Please enter valid URL' }]}
                >
                  <Input placeholder="https://example.com/publication" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="pdf_url"
                  label="PDF URL"
                  rules={[{ type: 'url', message: 'Please enter valid URL' }]}
                >
                  <Input placeholder="https://example.com/paper.pdf" />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="doi"
                  label="DOI"
                  rules={[{ pattern: /^10\./, message: 'DOI must start with 10.' }]}
                >
                  <Input placeholder="10.1000/journal.2021.123456" maxLength={200} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isbn" label="ISBN">
                  <Input placeholder="978-3-16-148410-0" maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="issn" label="ISSN">
                  <Input placeholder="1234-5678" maxLength={20} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pmid" label="PMID">
                  <Input placeholder="12345678" maxLength={20} />
                </Form.Item>
              </Col>
            </Row> */}
          </Card>

          {/* Settings */}
          <Card
            title={
              <Space>
                <SettingOutlined />
                Publication Settings
              </Space>
            }
            className="mb-6"
          >
            <Row gutter={16}>
              {/* <Col span={12}>
                <Form.Item name="citation_count" label="Initial Citation Count">
                  <Input
                    type="number"
                    min={0}
                    max={999999}
                    placeholder="0"
                  />
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item name="is_public" valuePropName="checked">
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <div>
                      <div className="font-medium">Make Publicly Visible</div>
                      <Text type="secondary" className="text-sm">
                        Publication will be visible to everyone
                      </Text>
                    </div>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Action Buttons */}
          <Card>
            <div className="flex justify-between">
              <Button onClick={() => navigate('/app/research/publications')}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                {isEditMode ? 'Update Publication' : 'Create Publication'}
              </Button>
            </div>
          </Card>
        </Form>
      </Spin>
    </div>
  );
};

export default PublicationFormSimplified;