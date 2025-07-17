import React, { useEffect } from 'react';
import { Form, Input, Button, Upload, Select, message, Card, Typography } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { researchService } from '../../services';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { Option } = Select;

const PublicationForm = ({ isEdit = false, initialValues = {} }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isEdit && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [isEdit, initialValues, form]);

  const handleFinish = async (values) => {
    try {
      if (isEdit) {
        await researchService.updatePublication(id, values);
        message.success('Publication updated successfully');
      } else {
        // If researcher, set submitted_by to current user
        let data = { ...values };
        if (user && user.role === 'researcher') {
          data.submitted_by = user.id;
        }
        await researchService.createPublication(data);
        message.success('Publication created successfully');
      }
      navigate('/app/research/publications');
    } catch (error) {
      message.error('Failed to save publication');
    }
  };

  const handleFileUpload = async ({ file }) => {
    try {
      await researchService.uploadPublicationFile(id, file);
      message.success('File uploaded successfully');
    } catch (error) {
      message.error('File upload failed');
    }
  };

  return (
    <Card style={{ maxWidth: 700, margin: 'auto' }}>
      <Title level={3}>{isEdit ? 'Edit Publication' : 'New Publication'}</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}> <Input /> </Form.Item>
        <Form.Item name="abstract" label="Abstract" rules={[{ required: true, message: 'Abstract is required' }]}> <Input.TextArea rows={4} /> </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="draft">Draft</Option> <Option value="pending">Pending</Option> <Option value="published">Published</Option> </Select> </Form.Item>
        <Form.Item name="authors" label="Authors" rules={[{ required: true, message: 'At least one author is required' }]}> <Select mode="tags" placeholder="Enter author names" /> </Form.Item>
        {isEdit && (
          <Form.Item label="Upload File">
            <Upload customRequest={handleFileUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PublicationForm;
