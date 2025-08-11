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

  // User management for department heads
  const [availableUsers, setAvailableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Real-time organization statistics - temporarily disabled for debugging
  // const { stats: orgStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('organization', 30000);
  const statsLoading = false;
  const refreshStats = () => { };

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
      console.log('📊 First department structure:', departmentsData[0]);
      setDepartments(departmentsData);
      setTotal(response.count || departmentsData.length || 0);
    } catch (error) {
      console.error('Failed to load departments:', error);
      message.error('فشل في تحميل الأقسام');
      setDepartments([]);
      setTotal(0);
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
      setLabs([]);
      setTotal(0);
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
      setStaff([]);
      setTotal(0);
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

  // Load available users for department head selection
  const loadAvailableUsers = async () => {
    try {
      setUsersLoading(true);
      const users = await authService.getAllUsers();
      const usersData = users.results || users || [];
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      setAvailableUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };
  const handleCreateDepartment = async () => {
    setEditingItem(null);
    form.resetFields();
    await loadAvailableUsers(); // Load users for new department form
    setModalVisible(true);
  };

  const handleEditDepartment = async (department) => {
    try {
      setLoading(true);

      // Load users for the dropdown
      await loadAvailableUsers();

      // Fetch full department details from API
      const fullDepartmentData = await organizationService.getDepartmentById(department.id);
      console.log('Full department data:', fullDepartmentData);

      setEditingItem(fullDepartmentData);

      // Set form values - use the head's ID for the select dropdown
      form.setFieldsValue({
        name: fullDepartmentData.name,
        description: fullDepartmentData.description,
        head: fullDepartmentData.head ? fullDepartmentData.head.id : undefined
      });

      setModalVisible(true);
    } catch (error) {
      console.error('Failed to load department details:', error);
      message.error('فشل في تحميل تفاصيل القسم');
    } finally {
      setLoading(false);
    }
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
      console.log('Form values submitted:', values);

      const departmentData = {
        name: values.name,
        description: values.description,
        head_id: values.head, // This will be the user ID
      };

      console.log('Transformed department data:', departmentData);

      if (editingItem) {
        await organizationService.updateDepartment(editingItem.id, departmentData);
        message.success('تم تحديث القسم بنجاح');
      } else {
        await organizationService.createDepartment(departmentData);
        message.success('تم إنشاء القسم بنجاح');
      }
      setModalVisible(false);
      loadDepartments();
      refreshStats();
    } catch (error) {
      console.error('Failed to save department:', error);
      console.error('Error details:', error.response?.data);
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
  const handleCreateLab = async () => {
    setEditingItem(null);
    form.resetFields();
    await loadAvailableUsers(); // This loads users for the dropdown
    setModalVisible(true);
  };

  const handleEditLab = async (lab) => {
    try {
      setLoading(true);
      await loadAvailableUsers(); // Load users for dropdown

      const fullLabData = await organizationService.getLabById(lab.id);
      setEditingItem(fullLabData);

      form.setFieldsValue({
        name: fullLabData.name,
        description: fullLabData.description,
        department_id: fullLabData.department?.id || fullLabData.department_id,
        head_id: fullLabData.head?.id,
        specialization: fullLabData.specialization,
        status: fullLabData.status
      });

      setModalVisible(true);
    } catch (error) {
      console.error('Failed to load lab details:', error);
      message.error('فشل في تحميل تفاصيل المختبر');
    } finally {
      setLoading(false);
    }
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
      console.log('🔍 Loading available researchers...');
      const users = await authService.getAllUsers();
      console.log('🔍 All users:', users);

      const usersArray = users.results || users || [];
      console.log('🔍 Users array:', usersArray);

      // Filter for approved researchers only and those not already in the lab
      const researchers = usersArray.filter(user => {
        const isResearcher = user.role === 'researcher' || user.role === 'Researcher';
        const isApproved = user.is_approved === true; // Only approved researchers
        const isNotInLab = !labMembers.some(member =>
          member.id === user.id ||
          member.researcher_id === user.id ||
          member.user_id === user.id
        );

        console.log(`🔍 User ${user.id} (${user.email}):`, {
          role: user.role,
          isResearcher,
          isApproved,
          isNotInLab,
          included: isResearcher && isApproved && isNotInLab
        });

        return isResearcher && isApproved && isNotInLab;
      });

      console.log('🔍 Filtered approved researchers:', researchers);
      setAvailableResearchers(researchers);

      if (researchers.length === 0) {
        message.warning('لا يوجد باحثون معتمدون متاحون للتعيين');
      }

    } catch (error) {
      console.error('❌ Failed to load researchers:', error);
      setAvailableResearchers([]);
      message.error('فشل في تحميل قائمة الباحثين');
    }
  };


  const handleAssignResearcher = async (values) => {
    try {
      console.log('🔍 Form values received:', values);
      console.log('🔍 Selected lab:', selectedLab);

      // Validate required data
      if (!selectedLab || !selectedLab.id) {
        message.error('لا يوجد مختبر محدد');
        return;
      }

      if (!values.researcher_id) {
        message.error('يرجى اختيار الباحث');
        return;
      }

      if (!values.start_date) {
        message.error('يرجى تحديد تاريخ البداية');
        return;
      }

      // Get department_id - this is crucial for the API
      let departmentId = null;
      if (selectedLab.department_id) {
        departmentId = parseInt(selectedLab.department_id);
      } else if (selectedLab.department?.id) {
        departmentId = parseInt(selectedLab.department.id);
      }

      // If we still don't have department_id, try to get it from the labs array
      if (!departmentId) {
        const labFromState = labs.find(lab => lab.id === selectedLab.id);
        if (labFromState?.department_id) {
          departmentId = parseInt(labFromState.department_id);
        } else if (labFromState?.department?.id) {
          departmentId = parseInt(labFromState.department.id);
        }
      }

      // If we still don't have department_id, fetch the lab details
      if (!departmentId) {
        try {
          console.log('🔍 Fetching lab details to get department_id...');
          const labDetails = await organizationService.getLabById(selectedLab.id);
          console.log('🔍 Lab details:', labDetails);

          if (labDetails.department_id) {
            departmentId = parseInt(labDetails.department_id);
          } else if (labDetails.department?.id) {
            departmentId = parseInt(labDetails.department.id);
          }
        } catch (error) {
          console.error('Failed to fetch lab details:', error);
        }
      }

      // Validate that we have department_id
      if (!departmentId) {
        message.error('لا يمكن تحديد القسم المرتبط بالمختبر. يرجى المحاولة مرة أخرى.');
        console.error('❌ Could not determine department_id for lab:', selectedLab);
        return;
      }

      console.log('🔍 Determined department_id:', departmentId);

      // Format the date properly
      const formattedDate = values.start_date;
      console.log('🔍 Formatted date:', formattedDate);

      const assignmentData = {
        researcher_id: parseInt(values.researcher_id),
        lab_id: parseInt(selectedLab.id),
        department_id: departmentId, // Always include department_id
        start_date: formattedDate,
        position: values.position || 'Researcher',
        notes: values.notes || `Assignment to ${selectedLab.name} lab`
      };

      console.log('🔍 Final assignment data:', assignmentData);

      // Validate the researcher exists and is available
      const selectedResearcher = availableResearchers.find(r => r.id === values.researcher_id);
      if (!selectedResearcher) {
        message.error('الباحث المحدد غير متوفر');
        return;
      }

      // Verify researcher is approved
      if (!selectedResearcher.is_approved) {
        message.error('الباحث المحدد غير معتمد بعد');
        return;
      }

      console.log('🔍 Selected researcher:', selectedResearcher);

      // Check if researcher is already assigned to this lab
      const isAlreadyAssigned = labMembers.some(member =>
        member.id === values.researcher_id || member.researcher_id === values.researcher_id
      );

      if (isAlreadyAssigned) {
        message.error('الباحث مُعيّن بالفعل في هذا المختبر');
        return;
      }

      // Make the API call
      const result = await organizationService.createAssignment(assignmentData);
      console.log('✅ Assignment created successfully:', result);

      message.success('تم تعيين الباحث بنجاح');
      loadLabMembers(selectedLab.id);
      setAssignmentFormVisible(false);
      assignmentForm.resetFields();

    } catch (error) {
      console.error('❌ Assignment creation failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;

        // Check for specific field errors
        if (errorData.researcher_id) {
          if (Array.isArray(errorData.researcher_id)) {
            if (errorData.researcher_id.some(err => err.includes('must be approved'))) {
              message.error('يجب الموافقة على الباحث قبل تعيينه');
            } else if (errorData.researcher_id.some(err => err.includes('not found'))) {
              message.error('الباحث المحدد غير موجود');
            } else {
              message.error(`خطأ في بيانات الباحث: ${errorData.researcher_id[0]}`);
            }
          } else {
            message.error(`خطأ في بيانات الباحث: ${errorData.researcher_id}`);
          }
        } else if (errorData.lab_id) {
          const labError = Array.isArray(errorData.lab_id) ? errorData.lab_id[0] : errorData.lab_id;
          message.error(`خطأ في بيانات المختبر: ${labError}`);
        } else if (errorData.department_id) {
          const deptError = Array.isArray(errorData.department_id) ? errorData.department_id[0] : errorData.department_id;
          message.error(`خطأ في بيانات القسم: ${deptError}`);
        } else if (errorData.start_date) {
          const dateError = Array.isArray(errorData.start_date) ? errorData.start_date[0] : errorData.start_date;
          message.error(`خطأ في تاريخ البداية: ${dateError}`);
        } else if (errorData.non_field_errors) {
          const nonFieldError = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
          message.error(`خطأ: ${nonFieldError}`);
        } else if (errorData.detail) {
          message.error(`خطأ: ${errorData.detail}`);
        } else {
          // Generic 400 error - show full error data for debugging
          message.error('بيانات غير صحيحة. يرجى التحقق من جميع الحقول');
          console.error('Full error data:', errorData);
        }
      } else if (error.response?.status === 403) {
        message.error('ليس لديك صلاحية لإجراء هذا التعيين');
      } else if (error.response?.status === 404) {
        message.error('المختبر أو الباحث غير موجود');
      } else if (error.response?.status === 409) {
        message.error('الباحث مُعيّن بالفعل في هذا المختبر');
      } else {
        message.error('فشل في تعيين الباحث. يرجى المحاولة مرة أخرى');
      }
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
        <Col xs={24} sm={12} md={12}>
          <Card loading={loading}>
            <Statistic
              title="إجمالي الأقسام"
              value={departments.length}
              prefix={<BankOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={loadDepartments}
                  style={{ marginLeft: '8px' }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card loading={loading}>
            <Statistic
              title="إجمالي المختبرات"
              value={labs.length}
              prefix={<ExperimentOutlined />}
              valueStyle={{
                color: '#52c41a',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={loadLabs}
                  style={{ marginLeft: '8px' }}
                />
              }
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
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ID: {record.id}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'رئيس القسم',
                    dataIndex: 'head_name',
                    key: 'head_name',
                    render: (head) => head || '-',
                  },
                  {
                    title: 'عدد المختبرات',
                    dataIndex: 'total_labs',
                    key: 'total_labs',
                    render: (labs) => (
                      <Tag color="green">
                        <ExperimentOutlined style={{ marginRight: '4px' }} />
                        {labs || 0}
                      </Tag>
                    ),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                  {
                    title: 'تاريخ الإنشاء',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: (date) => formatDate(date),
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

          <TabPane tab={<span style={{ paddingRight: '20px' }}>المختبرات</span>} key="labs">
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
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ID: {record.id}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'القسم',
                    dataIndex: 'department_name',
                    key: 'department_name',
                    render: (department) => department || '-',
                  },
                  {
                    title: 'المشرف',
                    dataIndex: 'head_name',
                    key: 'head_name',
                    render: (head) => head || '-',
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
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
        destroyOnHidden
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
              {activeTab === 'departments' ? (
                <Form.Item
                  name="head"
                  label="رئيس القسم"
                  rules={[{ required: true, message: 'رئيس القسم مطلوب' }]}
                >
                  <Select
                    placeholder="اختر رئيس القسم"
                    loading={usersLoading}
                    showSearch
                    optionFilterProp="label"  // Changed to filter by label instead of children
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {availableUsers.map(user => (
                      <Option
                        key={user.id}
                        value={user.id}
                        label={`${user.full_name} (${user.email})`}  // Add label prop
                      >
                        {user.full_name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (<></>)}
            </Col>

          </Row>

          {activeTab === 'labs' && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="department_id"
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
                  name="head_id"
                  label="مشرف المختبر"
                  rules={[{ required: true, message: 'مشرف المختبر مطلوب' }]}
                >
                  <Select
                    placeholder="اختر مشرف المختبر"
                    loading={usersLoading}
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {availableUsers.map(user => (
                      <Option
                        key={user.id}
                        value={user.id}
                        label={`${user.full_name} (${user.email})`}
                      >
                        {user.full_name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
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
                {labMembers.map(member => {
                  // Extract user info from researcher_profile or fallback to member data
                  const userProfile = member.researcher_profile || member;
                  const profilePicture = userProfile.profile_picture;
                  const fullName = userProfile.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
                  const email = userProfile.email || member.researcher_email || member.email;

                  return (
                    <Card key={member.id} size="small" style={{ marginBottom: '8px' }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space>
                            {/* Display profile picture or default avatar */}
                            {profilePicture ? (
                              <Avatar
                                src={`http://localhost:8000${profilePicture}`}
                                size={100}
                                style={{ flexShrink: 0 }}
                              />
                            ) : (
                              <Avatar icon={<UserOutlined />} size={40} />
                            )}
                            <div>
                              {/* Display full name */}
                              <Text strong>
                                {fullName || 'غير محدد'}
                              </Text>
                              <br />

                              {/* Display email */}
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {email || 'البريد الإلكتروني غير متوفر'}
                              </Text>

                              {/* Display position if available */}
                              {member.position && (
                                <>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    المنصب: {member.position}
                                  </Text>
                                </>
                              )}

                              {/* Display start date if available */}
                              {member.start_date && (
                                <>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    تاريخ البداية: {new Date(member.start_date).toLocaleDateString('ar-EG')}
                                  </Text>
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
                  );
                })}
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