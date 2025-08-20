import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Typography, Row, Col, Spin, message, Divider, Statistic } from 'antd';
import { 
  ExperimentOutlined,
  UserOutlined, 
  CrownOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  UserAddOutlined
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

  // Utility function to handle profile picture URLs
  const getProfilePictureUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/media/')) {
      return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`;
    }
    return url;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const labData = await organizationService.getLabById(id);
        setLab(labData);
        await loadLabResearchers(id);
      } catch (error) {
        message.error('Failed to load lab details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const loadLabResearchers = async (labId) => {
    try {
      setResearchersLoading(true);
      const response = await organizationService.getLabResearchers(labId);
      setResearchers(response.results || []);
    } catch (error) {
      setResearchers([]);
    } finally {
      setResearchersLoading(false);
    }
  };

  const handleResearcherClick = (researcher) => {
    // Use the id from researcher_profile if available
    const profileId = researcher?.researcher_profile?.id;
    if (profileId) {
      navigate(`/researchers/${profileId}`);
    } else {
      message.info('لا يوجد ملف باحث عام لهذا المستخدم');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lab) {
    return <div>Laboratory not found</div>;
  }

  const headOfLab = lab.head || null;
  const labMembers = researchers.filter(r => !r.is_head);

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
              <Col>
                <Text>
                  <BankOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  {lab.department?.name || 'No department specified'}
                </Text>
              </Col>
 
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
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Department: </Text>
              <Text>{lab.department?.name || 'Not specified'}</Text>
            </div>

            {/* Head of Lab Information */}
            {headOfLab && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#faad14', marginBottom: 12 }}
                />
                <Title level={4} style={{ marginBottom: 4 }}>
                  {headOfLab.full_name || lab.department?.head_name || 'Head of Laboratory'}
                </Title>
                {headOfLab.email && (
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    <Text type="secondary">{headOfLab.email}</Text>
                  </div>
                )}
              </div>
            )}

            {lab.description && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Description: </Text>
                <Paragraph style={{ margin: 0 }}>{lab.description}</Paragraph>
              </div>
            )}

            {lab.phone && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Phone: </Text>
                <Text>
                  <PhoneOutlined style={{ marginRight: '4px' }} />
                  {lab.phone}
                </Text>
              </div>
            )}

            <Divider />

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Status: </Text>
              <Text>{lab.status === 'active' ? 'Active' : 'Inactive'}</Text>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Capacity: </Text>
              <Text>{lab.current_researchers_count}/{lab.capacity} researchers</Text>
            </div>

            <div>
              <Text strong>Available Spots: </Text>
              <Text>{lab.available_spots}</Text>
            </div>
          </Card>
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
                  const pastelColors = [
                    '#ffe4e1', '#e0f7fa', '#fff9c4', '#e1bee7', '#f8bbd0', 
                    '#dcedc8', '#ffe0b2', '#b3e5fc', '#f0f4c3', '#f3e5f5'
                  ];
                  const cardColor = pastelColors[idx % pastelColors.length];
                  
                  return (
                    <Col xs={24} sm={12} md={8} key={researcher.id}>
                      <Card
                        hoverable
                        onClick={() => handleResearcherClick(researcher)}
                        style={{ 
                          borderRadius: 12, 
                          minHeight: 220, 
                          background: cardColor, 
                          boxShadow: '0 2px 8px #f0f1f2',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
                          <Avatar
                            size={64}
                            src={getProfilePictureUrl(profile.profile_picture)}
                            icon={!profile.profile_picture && <UserOutlined />}
                            style={{ marginBottom: 8, backgroundColor: '#d9d9d9' }}
                          />
                        </div>
                        <Title level={5} style={{ marginBottom: 0, textAlign: 'center' }}>
                          {profile.full_name || `${researcher.first_name} ${researcher.last_name}`}
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