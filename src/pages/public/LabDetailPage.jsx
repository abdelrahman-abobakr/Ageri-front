import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Typography, Row, Col, List, Tag, Button, Spin, message, Divider } from 'antd';
import { 
  ExperimentOutlined,
  UserOutlined, 
  CrownOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { organizationService } from '../../services';

const { Title, Text, Paragraph } = Typography;

const LabDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [researchersLoading, setResearchersLoading] = useState(false);

  useEffect(() => {
    loadLabDetails();
  }, [id]);

  const loadLabDetails = async () => {
    try {
      setLoading(true);
      // Load lab details
      const labData = await organizationService.getLabById(id);
      setLab(labData);
      
      // Load lab researchers
      await loadLabResearchers(id);
    } catch (error) {
      console.error('Failed to load lab details:', error);
      message.error('Failed to load lab details');
    } finally {
      setLoading(false);
    }
  };

  const loadLabResearchers = async (labId) => {
    try {
      setResearchersLoading(true);
      const response = await organizationService.getLabResearchers(labId);
      setResearchers(response.results || []);
    } catch (error) {
      console.error('Failed to load lab researchers:', error);
      setResearchers([]);
    } finally {
      setResearchersLoading(false);
    }
  };

  const handleResearcherClick = (researcherId) => {
    navigate(`/researchers/${researcherId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Laboratory Not Found</Title>
        <Text type="secondary">The laboratory you're looking for doesn't exist.</Text>
      </div>
    );
  }

  // Find the head of lab
  const headOfLab = researchers.find(researcher => researcher.is_head || researcher.role === 'head');
  const labMembers = researchers.filter(researcher => !researcher.is_head && researcher.role !== 'head');

  return (
    <div>
      {/* Lab Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              icon={<ExperimentOutlined />} 
              style={{ backgroundColor: '#52c41a', marginBottom: '16px' }}
            />
          </Col>
          <Col xs={24} sm={20}>
            <Title level={2} style={{ marginBottom: '8px' }}>
              {lab.name}
            </Title>
            
            <Row gutter={[16, 8]} style={{ marginBottom: '16px' }}>
              {lab.department && (
                <Col>
                  <Text>
                    <BankOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    {lab.department.name || lab.department}
                  </Text>
                </Col>
              )}
              {lab.location && (
                <Col>
                  <Text>
                    <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    {lab.location}
                  </Text>
                </Col>
              )}
              {/* Capacity removed as per request */}
            </Row>

            {lab.description && (
              <Paragraph style={{ marginBottom: 0 }}>
                {lab.description}
              </Paragraph>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Lab Information */}
        <Col xs={24} lg={8}>
          <Card title="Laboratory Information" style={{ marginBottom: '24px' }}>
            {/* Department Info */}
            {lab.department && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Department: </Text>
                <Text>{lab.department.name}</Text>
               
                
              </div>
            )}

            {/* Head of Lab */}
            {lab.head && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Head of Lab: </Text>
                <Text>{lab.head.full_name}</Text>
                {lab.head.email && (
                  <div style={{ fontSize: 12 }}>
                    <MailOutlined style={{ marginRight: 4 }} />{lab.head.email}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {lab.description && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Description: </Text>
                <Paragraph style={{ margin: 0 }}>{lab.description}</Paragraph>
              </div>
            )}

            {/* Equipment */}
            {lab.equipment && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Equipment: </Text>
                <Text>{lab.equipment}</Text>
              </div>
            )}

            {/* Phone */}
            {lab.phone && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Phone: </Text>
                <Text><PhoneOutlined style={{ marginRight: 4 }} />{lab.phone}</Text>
              </div>
            )}

            {/* Current Researchers Count & Available Spots */}
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Current Researchers: </Text>
              <Text>{lab.current_researchers_count}</Text>
              <br />
              <Text strong>Available Spots: </Text>
              <Text>{lab.available_spots}</Text>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Status: </Text>
              <Tag color={lab.status === 'active' ? 'green' : lab.status === 'pending' ? 'orange' : 'red'}>
                {lab.status}
              </Tag>
            </div>

            {/* Created/Updated At */}
            <div style={{ fontSize: 12, color: '#888' }}>
              Created: {lab.created_at && new Date(lab.created_at).toLocaleDateString()}<br />
              Updated: {lab.updated_at && new Date(lab.updated_at).toLocaleDateString()}
            </div>
          </Card>

          {/* Head of Lab */}
          {headOfLab && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CrownOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                  Head of Laboratory
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s'
                }}
                onClick={() => handleResearcherClick(headOfLab.id)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Avatar 
                  size={48} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#faad14', marginRight: '12px' }}
                />
                <div>
                  <Text strong style={{ display: 'block' }}>
                    {headOfLab.first_name} {headOfLab.last_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {headOfLab.title || 'Head of Laboratory'}
                  </Text>
                  {headOfLab.email && (
                    <div style={{ marginTop: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <MailOutlined style={{ marginRight: '4px' }} />
                        {headOfLab.email}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Lab Members */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: '8px' }} />
                Lab Members ({labMembers.length})
              </div>
            }
            loading={researchersLoading}
          >
            {labMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} type="secondary">No Members Yet</Title>
                <Text type="secondary">This laboratory doesn't have any assigned members yet.</Text>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {labMembers.map((researcher, idx) => {
                  const profile = researcher.researcher_profile || {};
                  // Generate a pastel color for each card
                  const pastelColors = [
                    '#ffe4e1', '#e0f7fa', '#fff9c4', '#e1bee7', '#f8bbd0', '#dcedc8', '#ffe0b2', '#b3e5fc', '#f0f4c3', '#f3e5f5'
                  ];
                  const cardColor = pastelColors[idx % pastelColors.length];
                  return (
                    <Col xs={24} sm={12} md={8} key={researcher.id}>
                      <Card
                        hoverable
                        onClick={() => handleResearcherClick(researcher.researcher_id || researcher.id)}
                        style={{ borderRadius: 12, minHeight: 220, background: cardColor, boxShadow: '0 2px 8px #f0f1f2' }}
                      >
                        <Title level={5} style={{ marginBottom: 0, textAlign: 'center' }}>
                          {profile.full_name || researcher.researcher_name}
                        </Title>
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 13 }}>
                          {researcher.position || profile.role || 'Researcher'}
                        </Text>
                        {profile.email && (
                          <div style={{ textAlign: 'center', marginTop: 4 }}>
                            <MailOutlined style={{ marginRight: 4 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>{profile.email}</Text>
                          </div>
                        )}
                        {profile.bio && (
                          <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}>
                            {profile.bio}
                          </Paragraph>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LabDetailPage;
