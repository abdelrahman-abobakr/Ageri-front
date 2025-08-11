import { useState, useEffect } from 'react';
import { Card, List, Input, Select, Button, Avatar, Typography, Row, Col, Pagination, Spin, Tag } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, ExperimentOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const PublicResearchersPage = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageSize = 12;

  const loadResearchers = async (page = 1, search = '', department = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        role: 'researcher',
        is_active: true
      };

      if (search) params.search = search;
      if (department) params.department = department;

      const response = await authService.getUsers(params);
      setResearchers(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load researchers:', error);
      setResearchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResearchers(currentPage, searchTerm, departmentFilter);
  }, [currentPage, searchTerm, departmentFilter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1}>الباحثون</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          تعرف على فريق الباحثين المتميزين في معهدنا
        </Paragraph>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="البحث عن الباحثين..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="القسم"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={handleDepartmentFilter}
            >
              <Option value="computer_science">علوم الحاسوب</Option>
              <Option value="biology">الأحياء</Option>
              <Option value="chemistry">الكيمياء</Option>
              <Option value="physics">الفيزياء</Option>
              <Option value="engineering">الهندسة</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Text strong>
              إجمالي الباحثين: {total}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Researchers List */}
      <Spin spinning={loading}>
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={researchers}
          renderItem={(researcher) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                actions={[
                  <Button 
                    type="primary" 
                    onClick={() => navigate(`/researchers/${researcher.id}`)}
                  >
                    عرض الملف الشخصي
                  </Button>
                ]}
              >
                <div style={{ marginBottom: '16px' }}>
                  <Avatar 
                    size={80} 
                    src={researcher.profile?.avatar} 
                    icon={<UserOutlined />}
                    style={{ marginBottom: '12px' }}
                  />
                  <Title level={4} style={{ marginBottom: '4px' }}>
                    {researcher.full_name || researcher.email}
                  </Title>
                  {researcher.profile?.title && (
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                      {researcher.profile.title}
                    </Text>
                  )}
                  {researcher.profile?.department && (
                    <Tag color="blue">{researcher.profile.department}</Tag>
                  )}
                </div>

                {researcher.profile?.bio && (
                  <Paragraph 
                    ellipsis={{ rows: 2, expandable: false }}
                    style={{ marginBottom: '12px', textAlign: 'right' }}
                  >
                    {researcher.profile.bio}
                  </Paragraph>
                )}

                <div style={{ textAlign: 'right' }}>
                  {researcher.profile?.specialization && (
                    <div style={{ marginBottom: '4px' }}>
                      <ExperimentOutlined style={{ marginRight: '4px' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {researcher.profile.specialization}
                      </Text>
                    </div>
                  )}
                  
                  {researcher.email && (
                    <div>
                      <MailOutlined style={{ marginRight: '4px' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {researcher.email}
                      </Text>
                    </div>
                  )}
                </div>
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
              `${range[0]}-${range[1]} من ${total} باحث`
            }
          />
        </div>
      )}
    </div>
  );
};

export default PublicResearchersPage;