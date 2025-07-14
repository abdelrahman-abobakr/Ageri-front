import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Dropdown,
  Tooltip,
  Spin,
  Tabs,
  Tree,
  Avatar,
  Checkbox
} from 'antd';
import {
  ApartmentOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  BankOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { organizationService, authService } from '../../services';
// import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
// import RealTimeIndicator from '../../components/admin/RealTimeIndicator';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;

const OrganizationManagementPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const pageSize = 10;

  // Lab Members Management
  const [selectedLab, setSelectedLab] = useState(null);
  const [labMembersModalVisible, setLabMembersModalVisible] = useState(false);
  const [labMembers, setLabMembers] = useState([]);
  const [labMembersLoading, setLabMembersLoading] = useState(false);
  const [availableResearchers, setAvailableResearchers] = useState([]);
  const [assignmentFormVisible, setAssignmentFormVisible] = useState(false);
  const [assignmentForm] = Form.useForm();

  // Real-time organization statistics - temporarily disabled for debugging
  // const { stats: orgStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('organization', 30000);
  const statsLoading = false;
  const refreshStats = () => {};

  // Animated counters - temporarily disabled for debugging
  // const totalDepartmentsCount = useAnimatedCounter(orgStats?.totalDepartments || 0);
  // const totalLabsCount = useAnimatedCounter(orgStats?.totalLabs || 0);
  // const totalStaffCount = useAnimatedCounter(orgStats?.totalStaff || 0);
  // const activeProjectsCount = useAnimatedCounter(orgStats?.activeProjects || 0);
  const totalDepartmentsCount = { value: 0 };
  const totalLabsCount = { value: 0 };
  const totalStaffCount = { value: 0 };
  const activeProjectsCount = { value: 0 };

  useEffect(() => {
    if (activeTab === 'departments') {
      loadDepartments();
    } else if (activeTab === 'labs') {
      loadLabs();
    } else if (activeTab === 'staff') {
      loadStaff();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await organizationService.getDepartments(params);
      const departmentsData = response.results || response || [];
      console.log('📊 Departments data received:', departmentsData);
      setDepartments(departmentsData);
      setTotal(response.count || departmentsData.length || 0);
    } catch (error) {
      console.error('Failed to load departments:', error);
      message.error('فشل في تحميل الأقسام');
      // Fallback to mock data
      setDepartments([
        {
          id: 1,
          name: 'Cell Biology',
          description: 'we are a department specialized in cell biology field.',
          labs: []
        },
        {
          id: 2,
          name: 'قسم وقاية النبات',
          description: 'قسم متخصص في مكافحة الآفات وأمراض النباتات',
          head: 'د. فاطمة علي',
          staff_count: 12,
          labs_count: 2,
          budget: 400000,
          status: 'active',
          established_date: '2012-03-20',
          location: 'مبنى البحوث - الطابق الأول'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadLabs = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await organizationService.getLabs(params);
      setLabs(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load labs:', error);
      message.error('فشل في تحميل المختبرات');
      // Fallback to mock data
      setLabs([
        {
          id: 1,
          name: 'مختبر تحليل التربة المتقدم',
          department: 'قسم علوم التربة',
          supervisor: 'د. محمد حسن',
          equipment_count: 25,
          capacity: 50,
          status: 'operational',
          specialization: 'تحليل فيزيائي وكيميائي للتربة',
          location: 'المبنى الرئيسي - الطابق الأرضي',
          established_date: '2015-06-10'
        },
        {
          id: 2,
          name: 'مختبر الميكروبيولوجي',
          department: 'قسم وقاية النبات',
          supervisor: 'د. سارة أحمد',
          equipment_count: 18,
          capacity: 30,
          status: 'operational',
          specialization: 'دراسة الكائنات الدقيقة المفيدة والضارة',
          location: 'مبنى البحوث - الطابق الثاني',
          established_date: '2018-09-15'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await organizationService.getStaff(params);
      setStaff(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load staff:', error);
      message.error('فشل في تحميل الموظفين');
      // Fallback to mock data
      setStaff([
        {
          id: 1,
          name: 'د. أحمد محمد',
          position: 'رئيس قسم علوم التربة',
          department: 'قسم علوم التربة',
          email: 'ahmed.mohamed@ageri.example.com',
          phone: '+20123456789',
          specialization: 'كيمياء التربة',
          hire_date: '2010-01-15',
          status: 'active',
          education: 'دكتوراه في علوم التربة'
        },
        {
          id: 2,
          name: 'د. فاطمة علي',
          position: 'رئيس قسم وقاية النبات',
          department: 'قسم وقاية النبات',
          email: 'fatima.ali@ageri.example.com',
          phone: '+20123456788',
          specialization: 'أمراض النباتات',
          hire_date: '2012-03-20',
          status: 'active',
          education: 'دكتوراه في أمراض النباتات'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await organizationService.getSettings();
      setSettings(data);
      settingsForm.setFieldsValue(data);
    } catch (error) {
      console.error('Failed to load organization settings:', error);
      message.error('فشل في تحميل إعدادات المنظمة');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (department) => {
    setEditingItem(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description
    });
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (department) => {
    confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا القسم؟',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await organizationService.deleteDepartment(department.id);
          message.success('تم حذف القسم بنجاح');
          loadDepartments();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف القسم');
        }
      },
    });
  };

  const handleSaveDepartment = async (values) => {
    try {
      if (editingItem) {
        await organizationService.updateDepartment(editingItem.id, values);
        message.success('تم تحديث القسم بنجاح');
      } else {
        await organizationService.createDepartment(values);
        message.success('تم إنشاء القسم بنجاح');
      }
      setModalVisible(false);
      loadDepartments();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ القسم');
    }
  };

  const handleSaveLab = async (values) => {
    try {
      if (editingItem) {
        await organizationService.updateLab(editingItem.id, values);
        message.success('تم تحديث المختبر بنجاح');
      } else {
        await organizationService.createLab(values);
        message.success('تم إنشاء المختبر بنجاح');
      }
      setModalVisible(false);
      loadLabs();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ المختبر');
    }
  };

  const handleSaveSettings = async (values) => {
    try {
      setSettingsLoading(true);
      const updatedSettings = await organizationService.updateSettings(values);
      setSettings(updatedSettings);
      message.success('تم حفظ إعدادات المنظمة بنجاح');
    } catch (error) {
      console.error('Failed to save organization settings:', error);
      message.error('فشل في حفظ إعدادات المنظمة');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Lab Management Handlers
  const handleCreateLab = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditLab = (lab) => {
    setEditingItem(lab);
    form.setFieldsValue({
      name: lab.name,
      description: lab.description,
      department: lab.department_id || lab.department,
      supervisor: lab.supervisor,
      specialization: lab.specialization,
      capacity: lab.capacity,
      equipment_count: lab.equipment_count,
      status: lab.status,
      research_focus: lab.research_focus
    });
    setModalVisible(true);
  };

  const handleDeleteLab = (lab) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: `هل أنت متأكد من حذف المختبر "${lab.name}"؟`,
      okText: 'حذف',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk: async () => {
        try {
          await organizationService.deleteLab(lab.id);
          message.success('تم حذف المختبر بنجاح');
          loadLabs();
        } catch (error) {
          message.error('فشل في حذف المختبر');
        }
      },
    });
  };

  const handleViewLabMembers = (lab) => {
    setSelectedLab(lab);
    setLabMembersModalVisible(true);
    loadLabMembers(lab.id);
  };

  const loadLabMembers = async (labId) => {
    try {
      setLabMembersLoading(true);
      const members = await organizationService.getLabResearchers(labId);
      console.log('📊 Lab members data:', members);
      setLabMembers(members.results || members || []);
    } catch (error) {
      console.error('Failed to load lab members:', error);
      message.error('فشل في تحميل أعضاء المختبر');
      setLabMembers([]);
    } finally {
      setLabMembersLoading(false);
    }
  };

  const loadAvailableResearchers = async () => {
    try {
      const users = await authService.getAllUsers();
      const researchers = (users.results || users || []).filter(user => user.role === 'researcher');
      setAvailableResearchers(researchers);
    } catch (error) {
      console.error('Failed to load researchers:', error);
      setAvailableResearchers([]);
    }
  };

  const handleAssignResearcher = async (values) => {
    try {
      const assignmentData = {
        researcher_id: values.researcher_id,
        lab_id: selectedLab.id,
        start_date: values.start_date,
        position: values.position || 'Researcher',
        notes: values.notes || `Assignment to ${selectedLab.name} lab`
      };

      await organizationService.createAssignment(assignmentData);
      message.success('تم تعيين الباحث بنجاح');
      loadLabMembers(selectedLab.id);
      setAssignmentFormVisible(false);
      assignmentForm.resetFields();
    } catch (error) {
      console.error('Failed to assign researcher:', error);
      message.error('فشل في تعيين الباحث');
    }
  };

  const handleRemoveResearcher = async (assignmentId) => {
    try {
      await organizationService.deleteAssignment(assignmentId);
      message.success('تم إزالة الباحث بنجاح');
      loadLabMembers(selectedLab.id);
    } catch (error) {
      console.error('Failed to remove researcher:', error);
      message.error('فشل في إزالة الباحث');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'نشط' },
      inactive: { color: 'red', text: 'غير نشط' },
      operational: { color: 'green', text: 'تشغيلي' },
      maintenance: { color: 'orange', text: 'صيانة' },
      closed: { color: 'red', text: 'مغلق' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ApartmentOutlined style={{ marginRight: '8px' }} />
          إدارة التنظيم
        </Title>
        <Text type="secondary">
          إدارة الأقسام والمختبرات والهيكل التنظيمي
        </Text>
        {/* <RealTimeIndicator /> */}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي الأقسام"
              value={totalDepartmentsCount.value}
              prefix={<BankOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalDepartmentsCount.isAnimating} />}
                  onClick={refreshStats}
                  style={{ marginLeft: '8px' }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي المختبرات"
              value={totalLabsCount.value}
              prefix={<ExperimentOutlined />}
              valueStyle={{
                color: '#52c41a',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي الموظفين"
              value={totalStaffCount.value}
              prefix={<TeamOutlined />}
              valueStyle={{
                color: '#faad14',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="المشاريع النشطة"
              value={activeProjectsCount.value}
              prefix={<SettingOutlined />}
              valueStyle={{
                color: '#722ed1',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="الأقسام" key="departments">
            {/* Departments Filters and Actions */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="البحث في الأقسام..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadDepartments()}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateDepartment}
                  >
                    إضافة قسم جديد
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Departments Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'اسم القسم',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ID: {record.id}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'الوصف',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                  {
                    title: 'عدد المختبرات',
                    dataIndex: 'labs',
                    key: 'labs',
                    render: (labs) => (
                      <Tag color="green">
                        <ExperimentOutlined style={{ marginRight: '4px' }} />
                        {Array.isArray(labs) ? labs.length : 0}
                      </Tag>
                    ),
                  },
                  {
                    title: 'الإجراءات',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="تعديل">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditDepartment(record)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteDepartment(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
                dataSource={departments}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} قسم`,
                }}
                locale={{
                  emptyText: 'لا توجد أقسام',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="المختبرات" key="labs">
            {/* Labs Filters and Actions */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="البحث في المختبرات..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadLabs()}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateLab}
                  >
                    إضافة مختبر جديد
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Labs Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'اسم المختبر',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          المشرف: {record.supervisor}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'القسم',
                    dataIndex: 'department',
                    key: 'department',
                    ellipsis: true,
                  },
                  {
                    title: 'التخصص',
                    dataIndex: 'specialization',
                    key: 'specialization',
                    ellipsis: true,
                  },
                  {
                    title: 'عدد الأجهزة',
                    dataIndex: 'equipment_count',
                    key: 'equipment_count',
                    render: (count) => (
                      <Tag color="purple">
                        <SettingOutlined style={{ marginRight: '4px' }} />
                        {count}
                      </Tag>
                    ),
                  },
                  {
                    title: 'السعة',
                    dataIndex: 'capacity',
                    key: 'capacity',
                    render: (capacity) => `${capacity} شخص`,
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                  {
                    title: 'تاريخ التأسيس',
                    dataIndex: 'established_date',
                    key: 'established_date',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'الإجراءات',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="عرض الأعضاء">
                          <Button
                            type="default"
                            size="small"
                            icon={<TeamOutlined />}
                            onClick={() => handleViewLabMembers(record)}
                          />
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditLab(record)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteLab(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
                dataSource={labs}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} مختبر`,
                }}
                locale={{
                  emptyText: 'لا توجد مختبرات',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="الموظفين" key="staff">
            {/* Staff Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'الاسم',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{text}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.position}
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'القسم',
                    dataIndex: 'department',
                    key: 'department',
                    ellipsis: true,
                  },
                  {
                    title: 'التخصص',
                    dataIndex: 'specialization',
                    key: 'specialization',
                    ellipsis: true,
                  },
                  {
                    title: 'البريد الإلكتروني',
                    dataIndex: 'email',
                    key: 'email',
                    ellipsis: true,
                  },
                  {
                    title: 'الهاتف',
                    dataIndex: 'phone',
                    key: 'phone',
                  },
                  {
                    title: 'تاريخ التوظيف',
                    dataIndex: 'hire_date',
                    key: 'hire_date',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                ]}
                dataSource={staff}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} موظف`,
                }}
                locale={{
                  emptyText: 'لا يوجد موظفين',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="إعدادات المنظمة" key="settings">
            <Spin spinning={settingsLoading}>
              <Form
                form={settingsForm}
                layout="vertical"
                onFinish={handleSaveSettings}
                style={{ maxWidth: '800px' }}
              >
                <Row gutter={[24, 16]}>
                  {/* Basic Information */}
                  <Col span={24}>
                    <Title level={4}>المعلومات الأساسية</Title>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="اسم المنظمة"
                      rules={[{ required: true, message: 'اسم المنظمة مطلوب' }]}
                    >
                      <Input placeholder="أدخل اسم المنظمة" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="البريد الإلكتروني"
                      rules={[
                        { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                      ]}
                    >
                      <Input placeholder="example@organization.com" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="رقم الهاتف"
                    >
                      <Input placeholder="+966 XX XXX XXXX" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="website"
                      label="الموقع الإلكتروني"
                    >
                      <Input placeholder="https://www.organization.com" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="address"
                      label="العنوان"
                    >
                      <TextArea rows={2} placeholder="أدخل عنوان المنظمة" />
                    </Form.Item>
                  </Col>

                  {/* Vision and Mission */}
                  <Col span={24}>
                    <Title level={4}>الرؤية والرسالة</Title>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="vision"
                      label="الرؤية"
                    >
                      <TextArea rows={3} placeholder="أدخل رؤية المنظمة" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="mission"
                      label="الرسالة"
                    >
                      <TextArea rows={3} placeholder="أدخل رسالة المنظمة" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="about"
                      label="نبذة عن المنظمة"
                    >
                      <TextArea rows={4} placeholder="أدخل نبذة تعريفية عن المنظمة" />
                    </Form.Item>
                  </Col>

                  {/* Social Media */}
                  <Col span={24}>
                    <Title level={4}>وسائل التواصل الاجتماعي</Title>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="facebook"
                      label="فيسبوك"
                    >
                      <Input placeholder="https://facebook.com/organization" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="twitter"
                      label="تويتر"
                    >
                      <Input placeholder="https://twitter.com/organization" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="linkedin"
                      label="لينكد إن"
                    >
                      <Input placeholder="https://linkedin.com/company/organization" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="instagram"
                      label="إنستغرام"
                    >
                      <Input placeholder="https://instagram.com/organization" />
                    </Form.Item>
                  </Col>

                  {/* Settings */}
                  <Col span={24}>
                    <Title level={4}>إعدادات النظام</Title>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="enable_registration"
                      valuePropName="checked"
                    >
                      <Checkbox>
                        تفعيل التسجيل للمستخدمين الجدد
                      </Checkbox>
                    </Form.Item>
                  </Col>

                  {/* Action Buttons */}
                  <Col span={24}>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={settingsLoading}
                      >
                        حفظ الإعدادات
                      </Button>
                      <Button onClick={() => settingsForm.resetFields()}>
                        إعادة تعيين
                      </Button>
                      <Button onClick={loadSettings}>
                        تحديث
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Department/Lab Modal */}
      <Modal
        title={
          activeTab === 'departments'
            ? (editingItem ? 'تعديل القسم' : 'إضافة قسم جديد')
            : (editingItem ? 'تعديل المختبر' : 'إضافة مختبر جديد')
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={activeTab === 'departments' ? handleSaveDepartment : handleSaveLab}
        >
          <Form.Item
            name="name"
            label={activeTab === 'departments' ? 'اسم القسم' : 'اسم المختبر'}
            rules={[{ required: true, message: activeTab === 'departments' ? 'اسم القسم مطلوب' : 'اسم المختبر مطلوب' }]}
          >
            <Input placeholder={activeTab === 'departments' ? 'أدخل اسم القسم' : 'أدخل اسم المختبر'} />
          </Form.Item>

          <Form.Item
            name="description"
            label={activeTab === 'departments' ? 'وصف القسم' : 'وصف المختبر'}
            rules={[{ required: true, message: activeTab === 'departments' ? 'وصف القسم مطلوب' : 'وصف المختبر مطلوب' }]}
          >
            <TextArea rows={3} placeholder={activeTab === 'departments' ? 'أدخل وصف تفصيلي للقسم' : 'أدخل وصف تفصيلي للمختبر'} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name={activeTab === 'departments' ? 'head' : 'supervisor'}
                label={activeTab === 'departments' ? 'رئيس القسم' : 'مشرف المختبر'}
                rules={[{ required: true, message: activeTab === 'departments' ? 'رئيس القسم مطلوب' : 'مشرف المختبر مطلوب' }]}
              >
                <Input placeholder={activeTab === 'departments' ? 'أدخل اسم رئيس القسم' : 'أدخل اسم مشرف المختبر'} />
              </Form.Item>
            </Col>
            {activeTab === 'labs' && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="capacity"
                  label="السعة (عدد الأشخاص)"
                  rules={[{ required: true, message: 'السعة مطلوبة' }]}
                >
                  <Input type="number" placeholder="20" />
                </Form.Item>
              </Col>
            )}
          </Row>

          {activeTab === 'labs' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="department"
                  label="القسم التابع له"
                  rules={[{ required: true, message: 'القسم مطلوب' }]}
                >
                  <Select placeholder="اختر القسم">
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="specialization"
                  label="التخصص"
                  rules={[{ required: true, message: 'التخصص مطلوب' }]}
                >
                  <Input placeholder="مثال: تحليل التربة" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {activeTab === 'labs' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="equipment_count"
                  label="عدد الأجهزة"
                >
                  <Input type="number" placeholder="10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="research_focus"
                  label="مجال البحث"
                >
                  <Input placeholder="مثال: بحوث المياه والتربة" />
                </Form.Item>
              </Col>
            </Row>
          )}



          {activeTab === 'labs' && (
            <Form.Item
              name="status"
              label="الحالة"
              initialValue="active"
            >
              <Select>
                <Option value="active">نشط</Option>
                <Option value="inactive">غير نشط</Option>
                <Option value="operational">تشغيلي</Option>
                <Option value="maintenance">صيانة</Option>
                <Option value="closed">مغلق</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'تحديث' : 'إنشاء'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Lab Members Management Modal */}
      <Modal
        title={`إدارة أعضاء المختبر: ${selectedLab?.name || ''}`}
        open={labMembersModalVisible}
        onCancel={() => setLabMembersModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setLabMembersModalVisible(false)}>
            إغلاق
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Title level={4}>الأعضاء الحاليون</Title>
          <Spin spinning={labMembersLoading}>
            {labMembers.length > 0 ? (
              <div style={{ marginBottom: '16px' }}>
                {labMembers.map(member => (
                  <Card key={member.id} size="small" style={{ marginBottom: '8px' }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <div>
                            <Text strong>{member.first_name} {member.last_name}</Text>
                            <br />
                            <Text type="secondary">{member.email}</Text>
                            {member.position && (
                              <>
                                <br />
                                <Text type="secondary">المنصب: {member.position}</Text>
                              </>
                            )}
                            {member.start_date && (
                              <>
                                <br />
                                <Text type="secondary">تاريخ البداية: {new Date(member.start_date).toLocaleDateString('ar-EG')}</Text>
                              </>
                            )}
                          </div>
                        </Space>
                      </Col>
                      <Col>
                        <Button
                          danger
                          size="small"
                          onClick={() => handleRemoveResearcher(member.assignment_id || member.id)}
                        >
                          إزالة
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ) : (
              <Text type="secondary">لا يوجد أعضاء في هذا المختبر</Text>
            )}
          </Spin>
        </div>

        <div>
          <Title level={4}>إضافة عضو جديد</Title>
          <Button
            type="primary"
            onClick={() => {
              setAssignmentFormVisible(true);
              loadAvailableResearchers();
            }}
          >
            إضافة باحث جديد
          </Button>
        </div>
      </Modal>

      {/* Assignment Form Modal */}
      <Modal
        title="تعيين باحث للمختبر"
        open={assignmentFormVisible}
        onCancel={() => {
          setAssignmentFormVisible(false);
          assignmentForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={assignmentForm}
          layout="vertical"
          onFinish={handleAssignResearcher}
        >
          <Form.Item
            name="researcher_id"
            label="الباحث"
            rules={[{ required: true, message: 'يرجى اختيار الباحث' }]}
          >
            <Select placeholder="اختر الباحث">
              {availableResearchers
                .filter(researcher => !labMembers.some(member => member.id === researcher.id))
                .map(researcher => (
                  <Option key={researcher.id} value={researcher.id}>
                    {researcher.first_name} {researcher.last_name} - {researcher.email}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="start_date"
                label="تاريخ البداية"
                rules={[{ required: true, message: 'تاريخ البداية مطلوب' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="position"
                label="المنصب"
                rules={[{ required: true, message: 'المنصب مطلوب' }]}
              >
                <Select placeholder="اختر المنصب">
                  <Option value="PhD Student">طالب دكتوراه</Option>
                  <Option value="Master Student">طالب ماجستير</Option>
                  <Option value="Research Assistant">مساعد باحث</Option>
                  <Option value="Researcher">باحث</Option>
                  <Option value="Senior Researcher">باحث أول</Option>
                  <Option value="Lab Technician">فني مختبر</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="ملاحظات"
          >
            <TextArea rows={3} placeholder="أدخل أي ملاحظات إضافية..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                تعيين الباحث
              </Button>
              <Button onClick={() => {
                setAssignmentFormVisible(false);
                assignmentForm.resetFields();
              }}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationManagementPage;
