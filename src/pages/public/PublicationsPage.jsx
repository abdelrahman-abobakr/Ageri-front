import { useState, useEffect } from 'react';
import { Card, List, Input, Select, Button, Tag, Typography, Row, Col, Pagination } from 'antd';
import { SearchOutlined, BookOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { researchService } from '../../services';
import { PUBLICATION_STATUS } from '../../constants';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadPublications = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        status: PUBLICATION_STATUS.PUBLISHED, // Only show published publications to public
      };

      if (search) params.search = search;
      if (status) params.status = status;

      const response = await researchService.getPublications(params);
      setPublications(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load publications:', error);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    const colors = {
      [PUBLICATION_STATUS.PUBLISHED]: 'green',
      [PUBLICATION_STATUS.PENDING]: 'orange',
      [PUBLICATION_STATUS.DRAFT]: 'blue',
      [PUBLICATION_STATUS.REJECTED]: 'red',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BookOutlined style={{ marginRight: '8px' }} />
          Research Publications
        </Title>
        <Paragraph type="secondary">
          Explore our collection of published research papers and academic publications.
        </Paragraph>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search publications..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value={PUBLICATION_STATUS.PUBLISHED}>Published</Option>
              <Option value={PUBLICATION_STATUS.PENDING}>Pending</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Text type="secondary">
              Showing {publications.length} of {total} publications
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Publications List */}
      <List
        loading={loading}
        dataSource={publications}
        renderItem={(publication) => (
          <List.Item>
            <Card
              hoverable
              style={{ width: '100%' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {publication.title}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
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

              <Paragraph 
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                style={{ marginBottom: '16px' }}
              >
                {publication.abstract || 'No abstract available.'}
              </Paragraph>

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
              `${range[0]}-${range[1]} of ${total} publications`
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && publications.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No Publications Found</Title>
          <Paragraph type="secondary">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search criteria or filters.'
              : 'No publications are currently available.'}
          </Paragraph>
        </Card>
      )}
    </div>
  );
};

export default PublicationsPage;
