import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Row, Col, Typography, Divider, Switch, Spin } from 'antd';
import { UploadOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';

const { Title, Text } = Typography;

const CreateProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const [cvFile, setCvFile] = useState(null);
  const [existingCvFile, setExistingCvFile] = useState(null);
  const [userInfo, setUserInfo] = useState({ first_name: '', last_name: '', email: '' });
  const [profileData, setProfileData] = useState(null);

  // جلب بيانات المستخدم والبروفايل عند تحميل الصفحة
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setInitialLoading(true);
        
        // جلب بيانات المستخدم الأساسية
        const user = await authService.getCurrentUser();
        setUserInfo({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
        });

        // جلب بيانات البروفايل إذا كانت موجودة
        try {
          const profile = await profileService.getMyProfile();
          setProfileData(profile.data);
          
          // تعبئة الفورم بالبيانات الموجودة
          form.setFieldsValue({
            orcid_id: profile.data.orcid_id || '',
            bio: profile.data.bio || '',
            research_interests: profile.data.research_interests || '',
            website: profile.data.website || '',
            linkedin: profile.data.linkedin || '',
            google_scholar: profile.data.google_scholar || '',
            researchgate: profile.data.researchgate || '',
            is_public: profile.data.is_public !== undefined ? profile.data.is_public : true
          });

          // إذا كان هناك ملف CV موجود
          if (profile.data.cv_file) {
            setExistingCvFile(profile.data.cv_file);
          }
        } catch (profileError) {
          // البروفايل غير موجود بعد، هذا طبيعي للمستخدمين الجدد
          console.log('Profile not found, creating new one');
        }
      } catch (error) {
        message.error('فشل في جلب البيانات');
        console.error('Error fetching user data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // إنشاء FormData لرفع الملفات
      const formData = new FormData();
      
      // إضافة البيانات النصية
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // إضافة ملف CV إذا تم اختيار ملف جديد
      if (cvFile) {
        formData.append('cv_file', cvFile);
      }

      const response = await profileService.updateMyProfile(formData);
      setProfileData(response.data);
      
      // تحديث البيانات المعروضة
      if (response.data.cv_file && cvFile) {
        setExistingCvFile(response.data.cv_file);
        setCvFile(null);
      }

      message.success('تم حفظ البروفايل بنجاح!');
    } catch (error) {
      console.error('Error saving profile:', error);
      message.error('فشل في حفظ البروفايل. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setCvFile(file);
    return false; // منع الرفع التلقائي
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    return true;
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserOutlined />
          {profileData ? 'تحديث البروفايل' : 'إنشاء البروفايل'}
        </Title>
      </div>

      <Card>
        {/* معلومات المستخدم الأساسية */}
        <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Text strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
            المعلومات الأساسية:
          </Text>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Text strong>الاسم الأول: </Text>
              <Text>{userInfo.first_name}</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong>اسم العائلة: </Text>
              <Text>{userInfo.last_name}</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text strong>البريد الإلكتروني: </Text>
              <Text>{userInfo.email}</Text>
            </Col>
          </Row>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="orcid_id" 
                label="ORCID ID"
                tooltip="معرف الباحث الدولي (مثال: 0000-0000-0000-0000)"
              >
                <Input placeholder="0000-0000-0000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="website" label="الموقع الشخصي">
                <Input placeholder="https://yourwebsite.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="bio" label="نبذة تعريفية">
            <Input.TextArea 
              rows={4} 
              placeholder="اكتب نبذة تعريفية عن نفسك وخلفيتك الأكاديمية..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item name="research_interests" label="الاهتمامات البحثية">
            <Input.TextArea 
              rows={3} 
              placeholder="اذكر مجالات اهتماماتك البحثية..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="ملف السيرة الذاتية">
            <Upload
              beforeUpload={handleFileChange}
              onRemove={handleRemoveFile}
              fileList={cvFile ? [{ 
                uid: '-1', 
                name: cvFile.name, 
                status: 'done' 
              }] : []}
              accept=".pdf,.doc,.docx"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                {existingCvFile ? 'تحديث السيرة الذاتية' : 'رفع السيرة الذاتية'}
              </Button>
            </Upload>
            {existingCvFile && !cvFile && (
              <div style={{ marginTop: '8px' }}>
                <Text type="success">✓ تم رفع السيرة الذاتية مسبقاً</Text>
                <a 
                  href={existingCvFile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '8px' }}
                >
                  عرض الملف
                </a>
              </div>
            )}
          </Form.Item>

          <Divider orientation="left">الروابط الاجتماعية والأكاديمية</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input placeholder="https://linkedin.com/in/yourprofile" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="google_scholar" label="Google Scholar">
                <Input placeholder="https://scholar.google.com/citations?user=..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="researchgate" label="ResearchGate">
            <Input placeholder="https://www.researchgate.net/profile/yourprofile" />
          </Form.Item>

          <Form.Item 
            name="is_public" 
            label="البروفايل عام" 
            valuePropName="checked"
            tooltip="إذا كان مفعل، سيكون البروفايل مرئياً للجميع"
          >
            <Switch checkedChildren="عام" unCheckedChildren="خاص" />
          </Form.Item>

          <Divider />

          {/* معلومات التواريخ */}
          {profileData && (
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Text type="secondary">
                    تاريخ الإنشاء: {new Date(profileData.created_at).toLocaleString('ar-EG')}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary">
                    آخر تحديث: {new Date(profileData.updated_at).toLocaleString('ar-EG')}
                  </Text>
                </Col>
              </Row>
            </div>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              icon={<SaveOutlined />} 
              size="large"
              style={{ minWidth: '120px' }}
            >
              {profileData ? 'تحديث البروفايل' : 'حفظ البروفايل'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProfilePage;