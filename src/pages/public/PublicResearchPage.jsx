import { useState, useEffect } from 'react';
import { Card, List, Input, Select, Button, Tag, Typography, Row, Col, Pagination, Spin } from 'antd';
import { SearchOutlined, BookOutlined, CalendarOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { researchService } from '../../services';
import { PUBLICATION_STATUS } from '../../constants';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const PublicResearchPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageSize = 12;

  const loadPublications = async (page = 1, search = '', type = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        status: PUBLICATION_STATUS.PUBLISHED, // Only show published publications
        ordering: '-publication_date'
      };

      if (search) params.search = search;
      if (type) params.type = type;

      const response = await researchService.getPublications(params);
      setPublications(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications(currentPage, searchTerm, typeFilter);
  }, [currentPage, searchTerm, typeFilter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1}>البحوث العلمية</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          اكتشف أحدث البحوث والمنشورات العلمية من معهدنا
        </Paragraph>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="البحث في المنشورات..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="نوع المنشور"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={handleTypeFilter}
            >
              <Option value="journal_article">مقال علمي</Option>
              <Option value="conference_paper">ورقة مؤتمر</Option>
              <Option value="book">كتاب</Option>
              <Option value="thesis">رسالة</Option>
              <Option value="report">تقرير</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Text strong>
              إجمالي المنشورات: {total}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Publications List */}
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
          dataSource={publications}
          renderItem={(publication) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/research/publications/${publication.id}`)}
                  >
                    عرض التفاصيل
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <Title level={5} style={{ marginBottom: '8px' }}>
                        {publication.title}
                      </Title>
                      <div style={{ marginBottom: '8px' }}>
                        <Tag color={getStatusColor(publication.status)}>
                          {publication.status?.toUpperCase()}
                        </Tag>
                        {publication.type && (
                          <Tag color="blue">{publication.type}</Tag>
                        )}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      {publication.abstract && (
                        <Paragraph 
                          ellipsis={{ rows: 3, expandable: false }}
                          style={{ marginBottom: '12px' }}
                        >
                          {publication.abstract}
                        </Paragraph>
                      )}
                      
                      <div style={{ marginBottom: '8px' }}>
                        <UserOutlined style={{ marginRight: '4px' }} />
                        <Text type="secondary">
                          {publication.authors?.map(author => 
                            author.name || author.user?.full_name
                          ).join(', ') || 'غير محدد'}
                        </Text>
                      </div>
                      
                      {publication.publication_date && (
                        <div style={{ marginBottom: '8px' }}>
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          <Text type="secondary">
                            {formatDate(publication.publication_date)}
                          </Text>
                        </div>
                      )}
                      
                      {publication.journal && (
                        <div>
                          <BookOutlined style={{ marginRight: '4px' }} />
                          <Text type="secondary">{publication.journal}</Text>
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
    </div>
  );
};

export default PublicResearchPage;