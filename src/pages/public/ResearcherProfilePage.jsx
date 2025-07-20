import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Avatar, Typography, Row, Col, List, Tag, Button, Spin, message, Divider } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  CalendarOutlined, 
  MailOutlined, 
  PhoneOutlined,
  ExperimentOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { authService, researchService } from '../../services';
import { PUBLICATION_STATUS } from '../../constants';

const { Title, Text, Paragraph } = Typography;

const ResearcherProfilePage = () => {
  const { id } = useParams();
  const [researcher, setResearcher] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicationsLoading, setPublicationsLoading] = useState(false);

  useEffect(() => {
    loadResearcherProfile();
  }, [id]);

  const loadResearcherProfile = async () => {
    try {
      setLoading(true);
      // Load researcher profile
      const researcherData = await authService.getUserById(id);
      setResearcher(researcherData);
      
      // Load researcher's publications
      await loadResearcherPublications(id);
    } catch (error) {
      console.error('Failed to load researcher profile:', error);
      message.error('Failed to load researcher profile');
    } finally {
      setLoading(false);
    }
  };

  const loadResearcherPublications = async (researcherId) => {
    try {
      setPublicationsLoading(true);
      const response = await researchService.getPublications({
        author: researcherId,
        status: PUBLICATION_STATUS.PUBLISHED,
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!researcher) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Researcher Not Found</Title>
        <Text type="secondary">The researcher profile you're looking for doesn't exist.</Text>
      </div>
    );
  }

  return (
    <div>
      {/* Researcher Profile Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff', marginBottom: '16px' }}
            />
          </Col>
          <Col xs={24} sm={18}>
            <Title level={2} style={{ marginBottom: '8px' }}>
              {researcher.first_name} {researcher.last_name}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              {researcher.role === 'researcher' ? 'Researcher' : researcher.role}
            </Text>
            
            <Row gutter={[16, 8]}>
              {researcher.email && (
                <Col>
                  <Text>
                    <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    {researcher.email}
                  </Text>
                </Col>
              )}
              {researcher.phone && (
                <Col>
                  <Text>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    {researcher.phone}
                  </Text>
                </Col>
              )}
            </Row>

            {researcher.orcid && (
              <div style={{ marginTop: '12px' }}>
                <Button 
                  type="link" 
                  icon={<LinkOutlined />}
                  href={`https://orcid.org/${researcher.orcid}`}
                  target="_blank"
                  style={{ padding: 0 }}
                >
                  ORCID: {researcher.orcid}
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Bio and Research Interests */}
        <Col xs={24} lg={8}>
          {researcher.bio && (
            <Card title="About" style={{ marginBottom: '24px' }}>
              <Paragraph>{researcher.bio}</Paragraph>
            </Card>
          )}

          {researcher.research_interests && (
            <Card title="Research Interests" style={{ marginBottom: '24px' }}>
              <Paragraph>{researcher.research_interests}</Paragraph>
            </Card>
          )}

          <Card title="Profile Information">
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Member Since: </Text>
              <Text>{researcher.date_joined ? formatDate(researcher.date_joined) : 'N/A'}</Text>
            </div>
            {researcher.department && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Department: </Text>
                <Text>{researcher.department}</Text>
              </div>
            )}
            {researcher.lab && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Laboratory: </Text>
                <Text>{researcher.lab}</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Publications */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: '8px' }} />
                Publications ({publications.length})
              </div>
            }
            loading={publicationsLoading}
          >
            {publications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ExperimentOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} type="secondary">No Publications Yet</Title>
                <Text type="secondary">This researcher hasn't published any papers yet.</Text>
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
                        <Paragraph 
                          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                          style={{ marginBottom: '12px' }}
                        >
                          {publication.abstract}
                        </Paragraph>
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
    </div>
  );
};

export default ResearcherProfilePage;
