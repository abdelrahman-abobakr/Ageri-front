import { useState, useEffect } from 'react';
import { Card, List, Input, Button, Tag, Typography, Row, Col, Pagination } from 'antd';
import { SearchOutlined, FileTextOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contentService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const AnnouncementsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadAnnouncements = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        ordering: '-created_at', // Show newest first
      };

      if (search) params.search = search;

      const response = await contentService.getPublicAnnouncements(params);
      setAnnouncements(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          Announcements
        </Title>
        <Paragraph type="secondary">
          Stay updated with the latest news, events, and important announcements.
        </Paragraph>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search announcements..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={16}>
            <Text type="secondary">
              Showing {announcements.length} of {total} announcements
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Announcements List */}
      <List
        loading={loading}
        dataSource={announcements}
        renderItem={(announcement) => (
          <List.Item>
            <Card
              style={{ width: '100%' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {announcement.title}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  {announcement.priority && (
                    <Tag color={getPriorityColor(announcement.priority)}>
                      {announcement.priority?.toUpperCase()}
                    </Tag>
                  )}
                  {announcement.category && (
                    <Tag color="blue">{announcement.category}</Tag>
                  )}
                  {announcement.created_at && (
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      {formatDate(announcement.created_at)}
                    </Text>
                  )}
                </div>
              </div>

              <Paragraph 
                ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}
                style={{ marginBottom: '16px' }}
              >
                {announcement.content || announcement.description || 'No content available.'}
              </Paragraph>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {announcement.author && (
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {announcement.author.full_name || announcement.author.username}
                    </Text>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {announcement.expires_at && (
                    <Text type="secondary">
                      Expires: {formatDate(announcement.expires_at)}
                    </Text>
                  )}
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/announcements/${announcement.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} announcements`
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && announcements.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No Announcements Found</Title>
          <Paragraph type="secondary">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'No announcements are currently available.'}
          </Paragraph>
          <Button type="primary" onClick={() => navigate('/register')}>
            Register for More Updates
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsPage;
