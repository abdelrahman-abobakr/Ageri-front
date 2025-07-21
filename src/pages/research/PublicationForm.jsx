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
        <Form.Item name="publication_type" label="Publication Type" rules={[{ required: true, message: 'Type is required' }]}> <Select> <Option value="journal_article">Journal Article</Option> <Option value="conference_paper">Conference Paper</Option> <Option value="book">Book</Option> <Option value="thesis">Thesis</Option> </Select> </Form.Item>
        <Form.Item name="journal_name" label="Journal Name"> <Input /> </Form.Item>
        <Form.Item name="conference_name" label="Conference Name"> <Input /> </Form.Item>
        <Form.Item name="publisher" label="Publisher"> <Input /> </Form.Item>
        <Form.Item name="volume" label="Volume"> <Input /> </Form.Item>
        <Form.Item name="issue" label="Issue"> <Input /> </Form.Item>
        <Form.Item name="pages" label="Pages"> <Input /> </Form.Item>
        <Form.Item name="publication_date" label="Publication Date" rules={[{ required: true, message: 'Date is required' }]}> <Input type="date" /> </Form.Item>
        <Form.Item name="doi" label="DOI"> <Input /> </Form.Item>
        <Form.Item name="isbn" label="ISBN"> <Input /> </Form.Item>
        <Form.Item name="issn" label="ISSN"> <Input /> </Form.Item>
        <Form.Item name="pmid" label="PMID"> <Input /> </Form.Item>
        <Form.Item name="url" label="URL"> <Input /> </Form.Item>
        <Form.Item name="pdf_url" label="PDF URL"> <Input /> </Form.Item>
        <Form.Item name="keywords" label="Keywords"> <Input /> </Form.Item>
        <Form.Item name="research_area" label="Research Area"> <Input /> </Form.Item>
        {/* Remove is_public from the form, it is set by admin approval */}
        {/* Authors and file upload logic can be expanded as needed */}
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PublicationForm;
