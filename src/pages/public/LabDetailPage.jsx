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
              {lab.capacity && (
                <Col>
                  <Text>
                    <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    Capacity: {lab.capacity}
                  </Text>
                </Col>
              )}
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
            {lab.research_focus && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Research Focus:</Text>
                <Paragraph style={{ marginTop: '4px' }}>{lab.research_focus}</Paragraph>
              </div>
            )}
            
            {lab.equipment && lab.equipment.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Equipment:</Text>
                <div style={{ marginTop: '8px' }}>
                  {lab.equipment.map((item, index) => (
                    <Tag key={index} style={{ marginBottom: '4px' }}>{item}</Tag>
                  ))}
                </div>
              </div>
            )}

            {lab.established_date && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Established: </Text>
                <Text>{new Date(lab.established_date).getFullYear()}</Text>
              </div>
            )}

            {lab.contact_email && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Contact: </Text>
                <Text>
                  <MailOutlined style={{ marginRight: '4px' }} />
                  {lab.contact_email}
                </Text>
              </div>
            )}

            {lab.contact_phone && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Phone: </Text>
                <Text>
                  <PhoneOutlined style={{ marginRight: '4px' }} />
                  {lab.contact_phone}
                </Text>
              </div>
            )}
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
              <List
                dataSource={labMembers}
                renderItem={(researcher) => (
                  <List.Item>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: '100%',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background-color 0.3s'
                      }}
                      onClick={() => handleResearcherClick(researcher.id)}
                      onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                    >
                      <Avatar 
                        size={40} 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#1890ff', marginRight: '12px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: 'block' }}>
                          {researcher.first_name} {researcher.last_name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {researcher.title || 'Researcher'}
                        </Text>
                        {researcher.research_interests && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {researcher.research_interests.substring(0, 100)}
                              {researcher.research_interests.length > 100 && '...'}
                            </Text>
                          </div>
                        )}
                      </div>
                      <div>
                        {researcher.email && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <MailOutlined style={{ marginRight: '4px' }} />
                            {researcher.email}
                          </Text>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LabDetailPage;
