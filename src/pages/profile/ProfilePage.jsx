import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Typography, Divider, List, Tag } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, BookOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { researchService } from '../../services';
import { PUBLICATION_STATUS } from '../../constants';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      dispatch(setUser(updatedUser));
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  useEffect(() => {
    if (user && user.role === 'researcher') {
      loadUserPublications();
    }
  }, [user]);

  const loadUserPublications = async () => {
    try {
      setPublicationsLoading(true);
      const response = await researchService.getPublications({
        author: user.id,
        page_size: 50
      });
      setPublications(response.results || []);
    } catch (error) {
      console.error('Failed to load publications:', error);
      setPublications([]);
    } finally {
      setPublicationsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PUBLICATION_STATUS.PUBLISHED:
        return 'green';
      case PUBLICATION_STATUS.PENDING:
        return 'orange';
      case PUBLICATION_STATUS.REJECTED:
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Title level={2}>Profile Settings</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Profile Picture" style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              style={{ marginBottom: 16, backgroundColor: '#1890ff' }}
            />
            <br />
            <Upload
              name="avatar"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  await authService.uploadAvatar(file);
                  const updatedUser = await authService.getCurrentUser();
                  dispatch(setUser(updatedUser));
                  message.success(`${file.name} uploaded successfully`);
                  onSuccess();
                } catch (error) {
                  message.error(`${file.name} upload failed.`);
                  onError(error);
                }
              }}
              onChange={handleAvatarUpload}
            >
              <Button icon={<UploadOutlined />}>
                Change Avatar
              </Button>
            </Upload>
          </Card>

          <Card title="Account Information" style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Role: </Text>
              <Text>{user?.role || 'N/A'}</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Status: </Text>
              <Text>{user?.status || 'N/A'}</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Member Since: </Text>
              <Text>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                username: user?.username,
                email: user?.email,
                first_name: user?.first_name,
                last_name: user?.last_name,
                phone: user?.phone,
                bio: user?.bio,
                research_interests: user?.research_interests,
                orcid: user?.orcid,
              }}
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please enter your username' }]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="bio"
                label="Bio"
              >
                <Input.TextArea rows={4} placeholder="Tell us about yourself..." />
              </Form.Item>

              <Form.Item
                name="research_interests"
                label="Research Interests"
              >
                <Input.TextArea rows={3} placeholder="Describe your research interests..." />
              </Form.Item>

              <Form.Item
                name="orcid"
                label="ORCID ID"
              >
                <Input placeholder="0000-0000-0000-0000" />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Publications Section - Only for researchers */}
      {user?.role === 'researcher' && (
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BookOutlined style={{ marginRight: '8px' }} />
                    My Publications ({publications.length})
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/app/research/submit')}
                  >
                    Add Publication
                  </Button>
                </div>
              }
              loading={publicationsLoading}
            >
              {publications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Title level={4} type="secondary">No Publications Yet</Title>
                  <Text type="secondary">You haven't published any papers yet.</Text>
                  <br />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/app/research/submit')}
                    style={{ marginTop: '16px' }}
                  >
                    Submit Your First Publication
                  </Button>
                </div>
              ) : (
                <List
                  dataSource={publications}
                  renderItem={(publication) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <Title level={5} style={{ marginBottom: '4px' }}>
                            {publication.title}
                          </Title>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Tag color={getStatusColor(publication.status)}>
                              {publication.status?.toUpperCase()}
                            </Tag>
                            {publication.publication_date && (
                              <Text type="secondary">
                                <CalendarOutlined style={{ marginRight: '4px' }} />
                                {formatDate(publication.publication_date)}
                              </Text>
                            )}
                          </div>
                        </div>

                        {publication.abstract && (
                          <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                            {publication.abstract.substring(0, 200)}
                            {publication.abstract.length > 200 && '...'}
                          </Text>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {publication.authors && publication.authors.length > 0 && (
                              <Text type="secondary">
                                <UserOutlined style={{ marginRight: '4px' }} />
                                {publication.authors.map(author => author.name || author.user?.full_name).join(', ')}
                              </Text>
                            )}
                          </div>
                          <div>
                            {publication.journal && (
                              <Tag color="blue">{publication.journal}</Tag>
                            )}
                            {publication.doi && (
                              <Button
                                type="link"
                                size="small"
                                href={`https://doi.org/${publication.doi}`}
                                target="_blank"
                              >
                                DOI: {publication.doi}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ProfilePage;
