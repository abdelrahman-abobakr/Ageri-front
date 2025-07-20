import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Spin, Button } from 'antd';
import { CalendarOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { contentService } from '../../services';

const { Title, Paragraph, Text } = Typography;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // Try to fetch from API, fallback to mock if fails
        const data = await contentService.getPublicPost(id);
        setPost(data);
        document.title = data.title || 'تفاصيل الخبر';
      } catch (e) {
        // fallback mock
        setPost({
          id,
          title: 'عنوان الخبر التجريبي',
          content: 'هذا نص تجريبي لمحتوى الخبر أو المقال. سيتم استبداله بالبيانات الحقيقية من الخادم.',
          date: new Date().toISOString(),
          category: 'أخبار',
          views: 0,
          author: 'فريق التحرير',
        });
        document.title = 'تفاصيل الخبر';
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!post) return <div style={{ textAlign: 'center', margin: '80px 0' }}>لم يتم العثور على الخبر.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        عودة
      </Button>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">{post.category}</Tag>
          <Text type="secondary" style={{ marginRight: 16 }}>
            <CalendarOutlined /> {new Date(post.date).toLocaleDateString('ar-EG')}
          </Text>
          <Text type="secondary" style={{ marginRight: 16 }}>
            <EyeOutlined /> {post.views || 0} مشاهدة
          </Text>
        </div>
        <Title level={2}>{post.title}</Title>
        <Paragraph style={{ fontSize: 18, lineHeight: 2 }}>{post.content}</Paragraph>
        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <Text type="secondary">{post.author}</Text>
        </div>
      </Card>
    </div>
  );
};

export default PostDetailPage;
