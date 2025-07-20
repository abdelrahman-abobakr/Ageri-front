import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Spin, message, Row, Col, Divider } from 'antd';
import { 
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { contentService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const AnnouncementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncementDetails();
  }, [id]);

  const loadAnnouncementDetails = async () => {
    try {
      setLoading(true);
      const response = await contentService.getPublicAnnouncementById(id);
      setAnnouncement(response);
    } catch (error) {
      console.error('Failed to load announcement details:', error);
      message.error('Failed to load announcement details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'red',
      'medium': 'orange',
      'low': 'blue',
      'urgent': 'magenta',
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Announcement Not Found</Title>
        <Text type="secondary">The announcement you're looking for doesn't exist or has been removed.</Text>
        <br />
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginTop: '16px' }}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px' }}
        >
          Back
        </Button>
      </div>

      {/* Announcement Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2} style={{ marginBottom: '12px' }}>
            <FileTextOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            {announcement.title}
          </Title>
          
          {/* Tags and Meta Information */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {announcement.priority && (
              <Tag color={getPriorityColor(announcement.priority)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                {announcement.priority?.toUpperCase()}
              </Tag>
            )}
            {announcement.category && (
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {announcement.category}
              </Tag>
            )}
            {announcement.is_pinned && (
              <Tag color="gold" style={{ fontSize: '14px', padding: '4px 8px' }}>
                PINNED
              </Tag>
            )}
          </div>

          {/* Date and Author Information */}
          <Row gutter={[16, 8]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12}>
              <Text type="secondary">
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Published: {formatDate(announcement.created_at)}
              </Text>
            </Col>
            {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
              <Col xs={24} sm={12}>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  Updated: {formatDate(announcement.updated_at)}
                </Text>
              </Col>
            )}
          </Row>

          <Row gutter={[16, 8]}>
            {announcement.author && (
              <Col xs={24} sm={12}>
                <Text type="secondary">
                  <UserOutlined style={{ marginRight: '8px' }} />
                  By: {announcement.author.full_name || announcement.author.username}
                </Text>
              </Col>
            )}
            {announcement.views && (
              <Col xs={24} sm={12}>
                <Text type="secondary">
                  <EyeOutlined style={{ marginRight: '8px' }} />
                  {announcement.views} views
                </Text>
              </Col>
            )}
          </Row>
        </div>
      </Card>

      {/* Announcement Content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Content">
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              {announcement.content ? (
                <div dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br />') }} />
              ) : (
                <Paragraph>
                  {announcement.description || 'No content available for this announcement.'}
                </Paragraph>
              )}
            </div>
          </Card>
        </Col>

        {/* Sidebar with Additional Information */}
        <Col xs={24} lg={8}>
          <Card title="Details" style={{ marginBottom: '24px' }}>
            {announcement.expires_at && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Expires:</Text>
                <br />
                <Text type={new Date(announcement.expires_at) < new Date() ? 'danger' : 'secondary'}>
                  {formatDate(announcement.expires_at)}
                  {new Date(announcement.expires_at) < new Date() && ' (Expired)'}
                </Text>
              </div>
            )}

            {announcement.target_audience && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Target Audience:</Text>
                <br />
                <Text type="secondary">{announcement.target_audience}</Text>
              </div>
            )}

            {announcement.department && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Department:</Text>
                <br />
                <Text type="secondary">{announcement.department}</Text>
              </div>
            )}

            {announcement.tags && announcement.tags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Tags:</Text>
                <br />
                <div style={{ marginTop: '8px' }}>
                  {announcement.tags.map((tag, index) => (
                    <Tag key={index} style={{ marginBottom: '4px' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Contact Information */}
          {(announcement.contact_email || announcement.contact_phone) && (
            <Card title="Contact Information">
              {announcement.contact_email && (
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>Email:</Text>
                  <br />
                  <Text type="secondary">{announcement.contact_email}</Text>
                </div>
              )}
              {announcement.contact_phone && (
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>Phone:</Text>
                  <br />
                  <Text type="secondary">{announcement.contact_phone}</Text>
                </div>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AnnouncementDetailPage;
