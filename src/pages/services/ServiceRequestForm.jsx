import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Upload, message, 
  Row, Col, Typography, Space, Alert, Spin, Steps
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, UploadOutlined,
  FileTextOutlined, UserOutlined, ToolOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { servicesService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ServiceRequestForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [service, setService] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Get service ID from URL params or location state
  const selectedServiceId = serviceId || location.state?.serviceId;

  // Load service details
  useEffect(() => {
    if (selectedServiceId) {
      loadServiceDetails(selectedServiceId);
    }
  }, [selectedServiceId]);

  const loadServiceDetails = async (id) => {
    try {
      setServiceLoading(true);
      console.log('📤 Loading service details for ID:', id);
      const serviceData = await servicesService.getTestServiceById(id);
      console.log('📥 Service details loaded:', serviceData);
      setService(serviceData);
    } catch (error) {
      console.error('❌ Failed to load service details:', error);
      message.error('Failed to load service details');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('📤 Submitting service request:', values);
      
      // Prepare request data
      const requestData = {
        service: selectedServiceId,
        description: values.description,
        priority: values.priority || 'medium',
        requirements: values.requirements,
        expected_completion_date: values.expected_completion_date,
        contact_phone: values.contact_phone,
        contact_email: values.contact_email || user?.email,
        additional_notes: values.additional_notes,
      };

      // Handle file upload if present
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        
        // Add all request data to FormData
        Object.keys(requestData).forEach(key => {
          if (requestData[key] !== null && requestData[key] !== undefined && requestData[key] !== '') {
            formData.append(key, requestData[key]);
          }
        });
        
        // Add file
        formData.append('attachment', fileList[0].originFileObj);
        
        console.log('📤 Sending FormData with file');
        const response = await servicesService.createServiceRequest(formData);
        console.log('📥 Response with file:', response);
      } else {
        // Send JSON payload without file
        console.log('📤 Sending JSON payload without file');
        const response = await servicesService.createServiceRequest(requestData);
        console.log('📥 Response without file:', response);
      }

      message.success('Service request submitted successfully!');
      navigate('/app/services/my-requests');
      
    } catch (error) {
      console.error('❌ Error submitting service request:', error);
      
      // Handle validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('📋 Backend validation errors:', errorData);
        
        // Show specific field errors
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            message.error(`${field}: ${errorData[field].join(', ')}`);
          } else {
            message.error(`${field}: ${errorData[field]}`);
          }
        });
      } else {
        message.error('Failed to submit service request');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const beforeUpload = (file) => {
    const isValidType = file.type === 'application/pdf' || 
                       file.type === 'application/msword' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                       file.type.startsWith('image/');
    
    if (!isValidType) {
      message.error('You can only upload PDF, DOC, DOCX, or image files!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return false;
    }
    
    return false; // Prevent auto upload
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    console.log('📁 File list changed:', newFileList);
    setFileList(newFileList);
  };

  const steps = [
    {
      title: 'Service Details',
      description: 'Review service information',
      icon: <ToolOutlined />
    },
    {
      title: 'Request Information',
      description: 'Provide request details',
      icon: <FileTextOutlined />
    },
    {
      title: 'Contact & Submit',
      description: 'Contact info and submit',
      icon: <UserOutlined />
    }
  ];

  const next = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('❌ Form validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderServiceDetails = () => (
    <Card title="Service Information" className="shadow-sm">
      {serviceLoading ? (
        <Spin size="large" />
      ) : service ? (
        <div>
          <Title level={4}>{service.name}</Title>
          <Paragraph>{service.description}</Paragraph>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Category: </Text>
              <Text>{service.category}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Price: </Text>
              <Text>${service.price}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Estimated Duration: </Text>
              <Text>{service.estimated_duration} hours</Text>
            </Col>
            <Col span={12}>
              <Text strong>Available: </Text>
              <Text>{service.available ? 'Yes' : 'No'}</Text>
            </Col>
          </Row>
        </div>
      ) : (
        <Alert message="Service not found" type="error" />
      )}
    </Card>
  );

  const renderRequestDetails = () => (
    <Card title="Request Details" className="shadow-sm">
      <Form.Item
        name="description"
        label="Request Description"
        rules={[{ required: true, message: 'Please provide a description of your request' }]}
      >
        <TextArea 
          rows={4} 
          placeholder="Describe what you need for this service..."
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Priority Level"
            initialValue="medium"
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="expected_completion_date"
            label="Expected Completion Date"
          >
            <Input type="date" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="requirements"
        label="Special Requirements"
      >
        <TextArea 
          rows={3} 
          placeholder="Any special requirements or instructions..."
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="attachment"
        label="Attachment (Optional)"
      >
        <Upload
          beforeUpload={beforeUpload}
          fileList={fileList}
          onRemove={() => setFileList([])}
          onChange={handleFileChange}
          maxCount={1}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        >
          <Button icon={<UploadOutlined />}>
            Upload Supporting Document
          </Button>
        </Upload>
      </Form.Item>
      
      <Alert
        message="File Requirements"
        description="Supported formats: PDF, DOC, DOCX, JPG, PNG. Maximum size: 10MB"
        type="info"
        showIcon
        className="mb-4"
      />
    </Card>
  );

  const renderContactInfo = () => (
    <Card title="Contact Information" className="shadow-sm">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="contact_email"
            label="Contact Email"
            initialValue={user?.email}
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="your.email@example.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="contact_phone"
            label="Contact Phone"
            rules={[{ required: true, message: 'Phone number is required' }]}
          >
            <Input placeholder="+1234567890" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="additional_notes"
        label="Additional Notes"
      >
        <TextArea 
          rows={3} 
          placeholder="Any additional information you'd like to share..."
          maxLength={300}
          showCount
        />
      </Form.Item>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderServiceDetails();
      case 1:
        return renderRequestDetails();
      case 2:
        return renderContactInfo();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/services')} 
            className="mb-4"
          >
            Back to Services
          </Button>
          <Title level={2} className="mb-0">
            Create Service Request
          </Title>
          <Text type="secondary">
            Submit a request for the selected service
          </Text>
        </div>
      </div>

      {/* Steps */}
      <Card className="mb-6">
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </Card>

      {/* Form */}
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <Card className="mt-6">
            <div className="flex justify-between">
              <div>
                {currentStep > 0 && (
                  <Button onClick={prev} size="large">
                    Previous
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={next} size="large">
                    Next
                  </Button>
                )}
                
                {currentStep === steps.length - 1 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Submit Request
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

export default ServiceRequestForm;
