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
  const pageSize = 100;

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

      {/* Posts Grid & Empty State */}
      <Spin spinning={loading}>
        {posts.length > 0 ? (
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
            renderItem={(post, index) => (
              <List.Item>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '0.8',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    background: (() => {
                      let images = [];
                      if (Array.isArray(post.images) && post.images.length > 0) {
                        images = post.images.map(imgObj => imgObj.image_url || imgObj.image).filter(Boolean);
                        images = images.map(img => {
                          if (img && img.startsWith('/')) {
                            return window.location.origin + img;
                          }
                          return img;
                        });
                      } else {
                        if (post.featured_image) images.push(post.featured_image);
                        if (post.attachment && post.attachment !== post.featured_image) images.push(post.attachment);
                      }
                      const mainImage = images[0];
                      return mainImage
                        ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${mainImage}) center/cover no-repeat`
                        : `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
                    })()
                  }}
                  onClick={() => {
                    try {
                      navigate(`/posts/${post.id}`);
                    } catch (error) {
                      // console.error('Navigation error:', error);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
                  }}
                >
                  {/* Background Overlay for better text readability */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)',
                    zIndex: 1
                  }} />

                  {/* Category and Featured Tags */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 3,
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {post.category && (
                      <Tag style={{
                        background: 'rgba(255,255,255,0.25)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backdropFilter: 'blur(12px)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }}>
                        {getCategoryLabel(post.category)}
                      </Tag>
                    )}
                    {post.is_featured && (
                      <Tag style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        border: 'none',
                        color: '#000',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(255,215,0,0.3)'
                      }}>
                        مميز
                      </Tag>
                    )}
                  </div>

                  {/* View Count */}
                  {post.view_count !== undefined && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      borderRadius: '16px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 3,
                      backdropFilter: 'blur(8px)'
                    }}>
                      <EyeOutlined />
                      {post.view_count}
                    </div>
                  )}

                  {/* No Image Indicator */}
                  {(() => {
                    let images = [];
                    if (Array.isArray(post.images) && post.images.length > 0) {
                      images = post.images.map(imgObj => imgObj.image_url || imgObj.image).filter(Boolean);
                    } else {
                      if (post.featured_image) images.push(post.featured_image);
                      if (post.attachment && post.attachment !== post.featured_image) images.push(post.attachment);
                    }
                    const mainImage = images[0];
                    return !mainImage && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '48px',
                        zIndex: 2,
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                      }}>
                        <BookOutlined />
                      </div>
                    );
                  })()}

                  {/* Content Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '24px',
                    zIndex: 2,
                    color: 'white'
                  }}>
                    {/* Title */}
                    <Title level={4} style={{
                      fontSize: '20px',
                      color: 'white',
                      fontWeight: '800',
                      lineHeight: '1.3',
                      marginBottom: '12px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </Title>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <Paragraph
                        style={{
                          marginBottom: '16px',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.excerpt}
                      </Paragraph>
                    )}

                    {/* Footer with Author and Date */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          src={post.author?.avatar}
                          style={{
                            border: '2px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}
                        />
                        <Text style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: '600',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                        }}>
                          {post.author?.full_name || post.author?.email || 'المشرف'}
                        </Text>
                      </div>

                      {post.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarOutlined style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }} />
                          <Text style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: '600',
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                          }}>
                            {formatDate(post.created_at)}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Read More Button */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 3
                  }}>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      style={{
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '11px',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                        backdropFilter: 'blur(8px)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          navigate(`/posts/${post.id}`);
                        } catch (error) {
                          // console.error('Navigation error:', error);
                        }
                      }}
                    >
                      قراءة المزيد
                    </Button>
                  </div>

                  {/* Decorative Elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '40%',
                    left: '-15px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    zIndex: 1
                  }} />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <BookOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
            <Title level={4} type="secondary">لا توجد منشورات</Title>
            <Text type="secondary">
              {searchTerm ? 'لم يتم العثور على منشورات تطابق بحثك' : 'لا توجد منشورات منشورة حالياً'}
            </Text>
          </Card>
        )}
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
    </div>
  );
};

export default AnnouncementsPage;
