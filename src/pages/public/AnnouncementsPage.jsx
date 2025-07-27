import { useState, useEffect } from 'react';
import { Card, List, Input, Typography, Row, Col, Pagination, Spin, Tag, Button, Avatar } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const AnnouncementsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageSize = 12;

  const loadPosts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        status: 'published', // Only show published posts
        is_public: true, // Only show public posts
        ordering: '-created_at', // Show newest first
      };

      if (search) params.search = search;

      const response = await contentService.getPublicPosts(params);
      setPosts(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general': 'blue',
      'event': 'green',
      'activity': 'orange',
      'workshop': 'purple',
      'seminar': 'cyan',
      'conference': 'red',
      'training': 'magenta',
      'collaboration': 'gold',
      'achievement': 'lime',
      'post': 'geekblue',
      'news': 'volcano'
    };
    return colors[category] || 'default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'general': 'عام',
      'event': 'فعالية',
      'activity': 'نشاط',
      'workshop': 'ورشة عمل',
      'seminar': 'ندوة',
      'conference': 'مؤتمر',
      'training': 'تدريب',
      'collaboration': 'تعاون',
      'achievement': 'إنجاز',
      'post': 'منشور',
      'news': 'أخبار'
    };
    return labels[category] || category;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1}>المنشورات</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          ابق على اطلاع بآخر الأخبار والفعاليات والإعلانات المهمة
        </Paragraph>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Search
              placeholder="البحث في المنشورات..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: '16px' }}>
              إجمالي المنشورات: {total}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Posts Grid */}
      <Spin spinning={loading}>
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  post.featured_image || post.attachment ? (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img
                        alt={post.title}
                        src={post.featured_image || post.attachment}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : null
                }
                actions={[
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => {
                      try {
                        navigate(`/posts/${post.id}`);
                      } catch (error) {
                        console.error('Navigation error:', error);
                      }
                    }}
                  >
                    قراءة المزيد
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <Title level={4} style={{ marginBottom: '8px', lineHeight: '1.3' }}>
                        {post.title}
                      </Title>
                      <div style={{ marginBottom: '12px' }}>
                        {post.category && (
                          <Tag color={getCategoryColor(post.category)}>
                            {getCategoryLabel(post.category)}
                          </Tag>
                        )}
                        {post.is_featured && (
                          <Tag color="gold">مميز</Tag>
                        )}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      {post.excerpt && (
                        <Paragraph 
                          ellipsis={{ rows: 3, expandable: false }}
                          style={{ marginBottom: '16px', color: '#666' }}
                        >
                          {post.excerpt}
                        </Paragraph>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar 
                            size="small" 
                            icon={<UserOutlined />}
                            src={post.author?.avatar}
                          />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {post.author?.full_name || post.author?.email || 'المشرف'}
                          </Text>
                        </div>
                        
                        {post.created_at && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarOutlined style={{ fontSize: '12px', color: '#999' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatDate(post.created_at)}
                            </Text>
                          </div>
                        )}
                      </div>

                      {post.view_count !== undefined && (
                        <div style={{ marginTop: '8px', textAlign: 'left' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            <EyeOutlined style={{ marginRight: '4px' }} />
                            {post.view_count} مشاهدة
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} من ${total} منشور`
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <Title level={4} type="secondary">لا توجد منشورات</Title>
          <Text type="secondary">
            {searchTerm ? 'لم يتم العثور على منشورات تطابق بحثك' : 'لا توجد منشورات منشورة حال<|im_start|>'}
          </Text>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsPage;
