import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Spin, 
  Button, 
  Divider, 
  Space,
  message 
} from 'antd';
import { 
  MailOutlined, 
  PhoneOutlined, 
  LinkOutlined, 
  FilePdfOutlined, 
  UserOutlined,
  BookOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  GoogleOutlined,
  BankOutlined,
  CalendarOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PublicResearcherProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auth/profiles/public/${id}`)
      .then(async res => {
        if (res.status === 404) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // If the API returns an empty object or missing key fields, treat as not found
        if (!data || Object.keys(data).length === 0 || data.detail === 'Not found.') {
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setProfile(null);
        setLoading(false);
      });
  }, [id]);

  // Construct proper image URL
  const constructMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    if (mediaPath.startsWith('http')) return mediaPath;
    return `http://localhost:8000${mediaPath}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Researcher Not Found</Title>
        <Text type="secondary">The researcher profile you're looking for doesn't exist.</Text>
        <div style={{ marginTop: '20px' }}>
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const user = profile.user_info || {};
  const avatarUrl = constructMediaUrl(profile.profile_picture);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Card */}
      <Card style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />} 
              style={{ 
                backgroundColor: '#1890ff',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginBottom: '16px'
              }}
            />
            <div>
              <Tag color={user.role === 'admin' ? 'red' : user.role === 'researcher' ? 'blue' : 'green'} style={{ fontSize: '12px' }}>
                {user.role?.toUpperCase() || 'RESEARCHER'}
              </Tag>
            </div>
          </Col>
          
          <Col xs={24} sm={18}>
            <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
              {user.full_name || profile.full_name}
            </Title>
            
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {profile.position && (
                <Text style={{ fontSize: '16px', fontWeight: 500, color: '#52c41a' }}>
                  <TrophyOutlined style={{ marginRight: '8px' , marginLeft:'8px'}} />
                  {profile.position}
                </Text>
              )}
              
              {user.institution && (
                <Text style={{ fontSize: '15px' }}>
                  <BankOutlined style={{ marginRight: '8px', color: '#1890ff', marginLeft:'8px' }} />
                  {user.institution}
                </Text>
              )}
              
              {profile.academic_degree && (
                <Text style={{ fontSize: '14px' }}>
                  <BookOutlined style={{ marginRight: '8px', color: '#722ed1', marginLeft:'8px' }} />
                  {profile.academic_degree}
                </Text>
              )}
              
              {profile.specialization && (
                <Text style={{ fontSize: '14px' }}>
                  <ExperimentOutlined style={{ marginRight: '8px', color: '#eb2f96', marginLeft:'8px' }} />
                  {profile.specialization}
                </Text>
              )}
            </Space>

            {/* Quick Contact */}
            <div style={{ marginTop: '16px' }}>
              <Space wrap>
                {user.email && (
                  <Button 
                    type="primary" 
                    icon={<MailOutlined />} 
                    href={`mailto:${user.email}`}
                    style={{ borderRadius: '20px' }}
                  >
                    Contact
                  </Button>
                )}
                {profile.cv_file && (
                  <Button 
                    icon={<FilePdfOutlined />} 
                    href={constructMediaUrl(profile.cv_file)} 
                    target="_blank"
                    style={{ borderRadius: '20px' }}
                  >
                    Download CV
                  </Button>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column - Contact & Academic Info */}
        <Col xs={24} lg={8}>
          {/* Contact Information */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ marginRight: '12px', color: '#1890ff', marginLeft:'8px' }} />
                Contact Information
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {user.email && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>Email:</Text>
                  <Text>
                    <MailOutlined style={{ marginRight: '8px', color: '#1890ff', marginLeft:'8px' }} />
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </Text>
                </div>
              )}
              
              {profile.phone && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>Phone:</Text>
                  <Text>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a', marginLeft:'8px' }} />
                    {profile.phone}
                  </Text>
                </div>
              )}
              
              {profile.website && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>Website:</Text>
                  <Text>
                    <GlobalOutlined style={{ marginRight: '8px', color: '#722ed1', marginLeft:'8px' }} />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </a>
                  </Text>
                </div>
              )}
            </Space>
          </Card>

          {/* Academic Information */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: '12px', color: '#722ed1', marginLeft:'8px' }} />
                Academic Information
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {profile.academic_degree && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>Academic Degree:</Text>
                  <Text>{profile.academic_degree}</Text>
                </div>
              )}
              
              {profile.specialization && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>Specialization:</Text>
                  <Text>{profile.specialization}</Text>
                </div>
              )}
              
              {profile.orcid_id && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>ORCID ID:</Text>
                  <Text>{profile.orcid_id}</Text>
                </div>
              )}
            </Space>
          </Card>


        </Col>

        {/* Right Column - Research & Bio */}
        <Col xs={24} lg={16}>
          {/* Research Interests */}
          {profile.research_interests && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ExperimentOutlined style={{ marginRight: '12px', color: '#eb2f96', marginLeft:'8px' }} />
                  Research Interests
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '12px' }}
            >
              <Paragraph style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                {profile.research_interests}
              </Paragraph>
            </Card>
          )}

          {/* Biography */}
          {profile.bio && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: '12px', color: '#13c2c2', marginLeft:'8px' }} />
                  Biography
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '12px' }}
            >
              <Paragraph style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                {profile.bio}
              </Paragraph>
            </Card>
          )}

          {/* Social Links & Publications */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LinkOutlined style={{ marginRight: '12px', color: '#52c41a', marginLeft:'8px' }} />
                Professional Links
              </div>
            }
            style={{ borderRadius: '12px' }}
          >
            <Row gutter={[16, 16]}>
              {profile.linkedin && (
                <Col xs={24} sm={12} md={8}>
                  <Button 
                    type="primary" 
                    icon={<LinkedinOutlined />} 
                    href={profile.linkedin} 
                    target="_blank"
                    style={{ width: '100%', borderRadius: '8px', backgroundColor: '#0077b5', borderColor: '#0077b5' }}
                  >
                    LinkedIn
                  </Button>
                </Col>
              )}
              
              {profile.google_scholar && (
                <Col xs={24} sm={12} md={8}>
                  <Button 
                    type="primary" 
                    icon={<GoogleOutlined />} 
                    href={profile.google_scholar} 
                    target="_blank"
                    style={{ width: '100%', borderRadius: '8px', backgroundColor: '#4285f4', borderColor: '#4285f4' }}
                  >
                    Google Scholar
                  </Button>
                </Col>
              )}
              
              {profile.researchgate && (
                <Col xs={24} sm={12} md={8}>
                  <Button 
                    type="primary" 
                    icon={<ExperimentOutlined />} 
                    href={profile.researchgate} 
                    target="_blank"
                    style={{ width: '100%', borderRadius: '8px', backgroundColor: '#00d0af', borderColor: '#00d0af' }}
                  >
                    ResearchGate
                  </Button>
                </Col>
              )}
            </Row>

            {/* CV Download Section */}
            {profile.cv_file && (
              <>
                <Divider />
                <div style={{ textAlign: 'center' }}>
                  <Title level={5} style={{ marginBottom: '16px' }}>Curriculum Vitae</Title>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<FilePdfOutlined />} 
                    href={constructMediaUrl(profile.cv_file)} 
                    target="_blank"
                    style={{ borderRadius: '25px', height: '45px', paddingLeft: '24px', paddingRight: '24px' }}
                  >
                    Download CV (PDF)
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Back Button */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button 
          type="default" 
          size="large"
          icon={<HomeOutlined />}
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          style={{ borderRadius: '20px' }}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default PublicResearcherProfilePage;