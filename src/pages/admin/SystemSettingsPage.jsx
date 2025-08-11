import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Typography,
  Row,
  Col,
  Tabs,
  message,
  Modal,
  Statistic,
  Progress,
  Space,
  Divider,
  InputNumber,
  Upload
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  MailOutlined,
  BellOutlined,
  ToolOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const SystemSettingsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [systemInfo, setSystemInfo] = useState({
    serverVersion: '1.0.0',
    databaseVersion: 'PostgreSQL 14.2',
    phpVersion: 'Python 3.9.7',
    diskSpace: 75,
    memoryUsage: 45,
    uptime: '15 days, 3 hours',
    lastBackup: '2024-01-15 10:30:00'
  });

  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'معهد التميز للبحوث الزراعية',
    siteDescription: 'منصة بحثية متقدمة للابتكار الزراعي',
    siteUrl: 'https://ageri.example.com',
    adminEmail: 'admin@ageri.example.com',
    defaultLanguage: 'ar',
    timezone: 'Africa/Cairo',
    dateFormat: 'YYYY-MM-DD',
    enableRegistration: true,
    requireApproval: true,
    
    // Security Settings
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableMaintenance: false,
    maintenanceMessage: 'الموقع تحت الصيانة. سنعود قريباً.',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@ageri.example.com',
    fromName: 'معهد أجيري',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyNewUser: true,
    notifyNewContent: true,
    notifySystemAlerts: true
  });

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In real app, load from API
      // const response = await adminService.getSettings();
      // setSettings(response.data);
      form.setFieldsValue(settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      message.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      // const response = await adminService.getSystemInfo();
      // setSystemInfo(response.data);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const handleSaveSettings = async (values) => {
    try {
      setLoading(true);
      // await adminService.updateSettings(values);
      setSettings({ ...settings, ...values });
      message.success(t('admin.systemSettings.settingsSaved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    confirm({
      title: t('admin.systemSettings.confirmReset'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          // Reset to default values
          const defaultSettings = {
            siteName: 'معهد التميز للبحوث الزراعية',
            siteDescription: 'منصة بحثية متقدمة للابتكار الزراعي',
            defaultLanguage: 'ar',
            enableRegistration: true,
            requireApproval: true,
            passwordMinLength: 8,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            enableTwoFactor: false,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
          };
          
          form.setFieldsValue(defaultSettings);
          setSettings({ ...settings, ...defaultSettings });
          message.success(t('admin.systemSettings.settingsReset'));
        } catch (error) {
          message.error('فشل في إعادة تعيين الإعدادات');
        }
      },
    });
  };

  const handleTestEmail = async () => {
    try {
      // await adminService.testEmail();
      message.success(t('admin.systemSettings.testEmailSent'));
    } catch (error) {
      message.error('فشل في إرسال بريد الاختبار');
    }
  };

  const handleCreateBackup = async () => {
    try {
      // await adminService.createBackup();
      message.success(t('admin.systemSettings.backupCreated'));
      loadSystemInfo(); // Refresh system info
    } catch (error) {
      message.error('فشل في إنشاء النسخة الاحتياطية');
    }
  };

  const generalSettingsTab = (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            name="siteName"
            label={t('admin.systemSettings.siteName')}
            rules={[{ required: true, message: 'اسم الموقع مطلوب' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="adminEmail"
            label={t('admin.systemSettings.adminEmail')}
            rules={[
              { required: true, message: 'البريد الإلكتروني مطلوب' },
              { type: 'email', message: 'بريد إلكتروني غير صحيح' }
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="siteDescription"
            label={t('admin.systemSettings.siteDescription')}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="defaultLanguage"
            label={t('admin.systemSettings.defaultLanguage')}
          >
            <Select>
              <Option value="ar">العربية</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="timezone"
            label={t('admin.systemSettings.timezone')}
          >
            <Select>
              <Option value="Africa/Cairo">القاهرة (GMT+2)</Option>
              <Option value="Asia/Riyadh">الرياض (GMT+3)</Option>
              <Option value="UTC">UTC (GMT+0)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="enableRegistration"
            label={t('admin.systemSettings.enableRegistration')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="requireApproval"
            label={t('admin.systemSettings.requireApproval')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const securitySettingsTab = (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            name="passwordMinLength"
            label={t('admin.systemSettings.passwordMinLength')}
          >
            <InputNumber min={6} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="sessionTimeout"
            label={t('admin.systemSettings.sessionTimeout')}
          >
            <InputNumber min={5} max={1440} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="maxLoginAttempts"
            label={t('admin.systemSettings.maxLoginAttempts')}
          >
            <InputNumber min={3} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="enableTwoFactor"
            label={t('admin.systemSettings.enableTwoFactor')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="enableMaintenance"
            label={t('admin.systemSettings.enableMaintenance')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="maintenanceMessage"
            label={t('admin.systemSettings.maintenanceMessage')}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const emailSettingsTab = (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            name="smtpHost"
            label={t('admin.systemSettings.smtpHost')}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="smtpPort"
            label={t('admin.systemSettings.smtpPort')}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="smtpUsername"
            label={t('admin.systemSettings.smtpUsername')}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="smtpPassword"
            label={t('admin.systemSettings.smtpPassword')}
          >
            <Input.Password />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="fromEmail"
            label={t('admin.systemSettings.fromEmail')}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="fromName"
            label={t('admin.systemSettings.fromName')}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Button 
            type="default" 
            icon={<MailOutlined />}
            onClick={handleTestEmail}
          >
            {t('admin.systemSettings.testEmail')}
          </Button>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          {t('admin.systemSettings.title')}
        </Title>
        <Text type="secondary">
          {t('admin.systemSettings.description')}
        </Text>
      </div>

      {/* Settings Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        initialValues={settings}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <SettingOutlined />
                  {t('admin.systemSettings.generalSettings')}
                </span>
              ),
              children: generalSettingsTab,
            },
            {
              key: 'security',
              label: (
                <span>
                  <SecurityScanOutlined />
                  {t('admin.systemSettings.securitySettings')}
                </span>
              ),
              children: securitySettingsTab,
            },
            {
              key: 'email',
              label: (
                <span>
                  <MailOutlined />
                  {t('admin.systemSettings.emailSettings')}
                </span>
              ),
              children: emailSettingsTab,
            },
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined />
                  {t('admin.systemSettings.notificationSettings')}
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="emailNotifications"
                        label={t('admin.systemSettings.emailNotifications')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="smsNotifications"
                        label={t('admin.systemSettings.smsNotifications')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="pushNotifications"
                        label={t('admin.systemSettings.pushNotifications')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Divider />
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="notifyNewUser"
                        label={t('admin.systemSettings.notifyNewUser')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="notifyNewContent"
                        label={t('admin.systemSettings.notifyNewContent')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="notifySystemAlerts"
                        label={t('admin.systemSettings.notifySystemAlerts')}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ),
            },
            {
              key: 'system',
              label: (
                <span>
                  <InfoCircleOutlined />
                  {t('admin.systemSettings.systemInfo')}
                </span>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="System Information">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{t('admin.systemSettings.serverVersion')}</Text>
                          <Text strong>{systemInfo.serverVersion}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{t('admin.systemSettings.databaseVersion')}</Text>
                          <Text strong>{systemInfo.databaseVersion}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{t('admin.systemSettings.phpVersion')}</Text>
                          <Text strong>{systemInfo.phpVersion}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{t('admin.systemSettings.uptime')}</Text>
                          <Text strong>{systemInfo.uptime}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{t('admin.systemSettings.lastBackup')}</Text>
                          <Text strong>{systemInfo.lastBackup}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Resource Usage">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text>{t('admin.systemSettings.diskSpace')}</Text>
                            <Text strong>{systemInfo.diskSpace}%</Text>
                          </div>
                          <Progress
                            percent={systemInfo.diskSpace}
                            status={systemInfo.diskSpace > 80 ? 'exception' : 'success'}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text>{t('admin.systemSettings.memoryUsage')}</Text>
                            <Text strong>{systemInfo.memoryUsage}%</Text>
                          </div>
                          <Progress
                            percent={systemInfo.memoryUsage}
                            status={systemInfo.memoryUsage > 80 ? 'exception' : 'success'}
                          />
                        </div>
                        <Divider />
                        <Button
                          type="primary"
                          icon={<DatabaseOutlined />}
                          onClick={handleCreateBackup}
                          block
                        >
                          {t('admin.systemSettings.createBackup')}
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />

        {/* Action Buttons */}
        <Card style={{ marginTop: '16px' }}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
            >
              {t('admin.systemSettings.saveSettings')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetSettings}
            >
              {t('admin.systemSettings.resetToDefault')}
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => {
                // Export settings functionality
                const dataStr = JSON.stringify(settings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'ageri-settings.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              {t('admin.systemSettings.exportSettings')}
            </Button>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const importedSettings = JSON.parse(e.target.result);
                    form.setFieldsValue(importedSettings);
                    setSettings({ ...settings, ...importedSettings });
                    message.success('تم استيراد الإعدادات بنجاح');
                  } catch (error) {
                    message.error('ملف إعدادات غير صحيح');
                  }
                };
                reader.readAsText(file);
                return false; // Prevent upload
              }}
            >
              <Button icon={<ImportOutlined />}>
                {t('admin.systemSettings.importSettings')}
              </Button>
            </Upload>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default SystemSettingsPage;
