import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Spin, Button, Alert, message } from 'antd';
import { CalendarOutlined, EyeOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { contentService } from '../../services';

const { Title, Paragraph, Text } = Typography;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const response = await contentService.getPublicPost(id);
      setPost(response);
    } catch (error) {
      console.error('Failed to load post details:', error);
      message.error('فشل في تحميل تفاصيل المنشور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostDetails();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!post) return <div style={{ textAlign: 'center', margin: '80px 0' }}>لم يتم العثور على المنشور.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        عودة
      </Button>
      
      {error && (
        <Alert
          message="تحذير"
          description="تم تحميل بيانات تجريبية بسبب مشكلة في الاتصال مع الخادم"
          type="warning"
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 24 }}
          closable
        />
      )}
      
      <Card>
        {/* Featured Image */}
        {(post.featured_image || post.attachment) && (
          <div style={{ marginBottom: 24 }}>
            <img
              src={post.featured_image || post.attachment}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">{post.category}</Tag>
          <Text type="secondary" style={{ marginRight: 16 }}>
            <CalendarOutlined /> {new Date(post.created_at || post.date).toLocaleDateString('ar-EG')}
          </Text>
          <Text type="secondary" style={{ marginRight: 16 }}>
            <EyeOutlined /> {post.views || post.view_count || 0} مشاهدة
          </Text>
        </div>
        <Title level={2}>{post.title}</Title>
        <Paragraph style={{ fontSize: 18, lineHeight: 2 }}>{post.content}</Paragraph>
        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <Text type="secondary">
            {post.author?.full_name || post.author?.email || 'فريق التحرير'}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PostDetailPage;
