import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Upload, message, Row, Col,
  Typography, Divider, Switch, Spin, Progress, Steps, Space, Avatar
} from 'antd';
import {
  UploadOutlined, SaveOutlined, UserOutlined, GlobalOutlined,
  FileTextOutlined, LinkedinOutlined, GoogleOutlined,
  BookOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined,
  CheckOutlined, ArrowRightOutlined, PhoneOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';
import './profile-page.css';
import './create-profile-page.css';

const { Title, Text } = Typography;

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const [cvFile, setCvFile] = useState(null);
  const [existingCvFile, setExistingCvFile] = useState(null);
  const [userInfo, setUserInfo] = useState({ first_name: '', last_name: '', email: '' });
  const [profileData, setProfileData] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isCreating, setIsCreating] = useState(true); // Flag to indicate this is creation, not editing

  const calculateProfileCompletion = (data) => {
    const coreFields = ['bio', 'research_interests', 'orcid_id', 'website', 'linkedin', 'google_scholar', 'researchgate'];
    const additionalFields = ['phone', 'institution', 'department', 'position', 'academic_degree', 'specialization'];
    const allFields = [...coreFields, ...additionalFields];

    const filledFields = allFields.filter(field => data[field] && data[field].trim() !== '');
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setInitialLoading(true);

        const user = await authService.getCurrentUser();
        setUserInfo({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          role: user.role || '',
          institution: user.institution || '',
          department: user.department || '',
          profile_picture: user.profile_picture || null
        });

        try {
          const profile = await profileService.getMyProfile();
          const profileData = profile.data || profile;
          setProfileData(profileData);

          const completion = calculateProfileCompletion(profileData);
          setProfileCompletion(completion);

          form.setFieldsValue({
            orcid_id: profileData.orcid_id || '',
            bio: profileData.bio || '',
            research_interests: profileData.research_interests || '',
            website: profileData.website || '',
            linkedin: profileData.linkedin || '',
            google_scholar: profileData.google_scholar || '',
            researchgate: profileData.researchgate || '',
            phone: profileData.phone || '',
            institution: profileData.institution || '',
            department: profileData.department || '',
            position: profileData.position || '',
            academic_degree: profileData.academic_degree || '',
            specialization: profileData.specialization || '',
            is_public: profileData.is_public !== undefined ? profileData.is_public : true
          });

          if (profileData.cv_file) {
            setExistingCvFile(profileData.cv_file);
          }
        } catch (profileError) {
          setProfileCompletion(0);
        }
      } catch (error) {
        message.error('فشل في جلب البيانات');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [form]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const completion = calculateProfileCompletion(values);
    setProfileCompletion(completion);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Define all fields that should be sent to the profile endpoint
      const allFields = [
        'bio', 'research_interests', 'orcid_id', 'website',
        'linkedin', 'google_scholar', 'researchgate', 'is_public',
        'position', 'academic_degree', 'specialization',
        'phone', 'institution', 'department'
      ];

      // Add all fields to FormData
      allFields.forEach(field => {
        const value = values[field];

        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            const trimmedValue = value.trim();
            if (trimmedValue !== '') {
              formData.append(field, trimmedValue);
            } else {
              // console.log(`Skipping empty string for field: ${field}`);
            }
          } else if (typeof value === 'boolean') {
            formData.append(field, value.toString());
          } else {
            formData.append(field, value);
          }
        } else {
          // console.log(`Skipping undefined/null field: ${field}`);
        }
      });

      // Add CV file if present
      if (cvFile) {
        formData.append('cv_file', cvFile);
      }

      let savedProfile = null;

      // Update/Create UserProfile model using FormData
      if (profileData) {
        // Update existing profile
        savedProfile = await profileService.updateMyProfile(formData);
      } else {
        // Create new profile
        savedProfile = await profileService.createMyProfile(formData);
      }

      // Update local state with the saved profile data
      setProfileData(savedProfile);

      // Update userInfo with any user fields that were updated
      if (savedProfile.phone !== undefined) {
        setUserInfo(prev => ({ ...prev, phone: savedProfile.phone }));
      }
      if (savedProfile.institution !== undefined) {
        setUserInfo(prev => ({ ...prev, institution: savedProfile.institution }));
      }
      if (savedProfile.department !== undefined) {
        setUserInfo(prev => ({ ...prev, department: savedProfile.department }));
      }

      // Update CV file state if a new file was uploaded
      if (savedProfile.cv_file && cvFile) {
        setExistingCvFile(savedProfile.cv_file);
        setCvFile(null);
      }

      // Update form with the saved values
      const formValues = {
        orcid_id: savedProfile?.orcid_id || '',
        bio: savedProfile?.bio || '',
        research_interests: savedProfile?.research_interests || '',
        website: savedProfile?.website || '',
        linkedin: savedProfile?.linkedin || '',
        google_scholar: savedProfile?.google_scholar || '',
        researchgate: savedProfile?.researchgate || '',
        position: savedProfile?.position || '',
        academic_degree: savedProfile?.academic_degree || '',
        specialization: savedProfile?.specialization || '',
        is_public: savedProfile?.is_public !== undefined ? savedProfile.is_public : true,
        phone: savedProfile?.phone || '',
        institution: savedProfile?.institution || '',
        department: savedProfile?.department || ''
      };

      form.setFieldsValue(formValues);

      // Calculate new completion percentage
      const completion = calculateProfileCompletion(savedProfile);
      setProfileCompletion(completion);

      const refreshedProfile = await profileService.getMyProfile();
      setProfileData(refreshedProfile);
      

      message.success(profileData ? 'تم تحديث البروفايل بنجاح!' : 'تم إنشاء البروفايل بنجاح!');

      // Navigate to profile page after successful creation
      if (!profileData) {
        setTimeout(() => {
          navigate('/app/profile');
        }, 1500);
      }
    } catch (error) {
      message.error('فشل في حفظ البروفايل. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setCvFile(file);
    const values = form.getFieldsValue();
    const tempCompletion = calculateProfileCompletion({ ...values, cv_file: true });
    setProfileCompletion(tempCompletion);
    return false; 
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    const values = form.getFieldsValue();
    const tempCompletion = calculateProfileCompletion({ ...values, cv_file: existingCvFile });
    setProfileCompletion(tempCompletion);
    return true;
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    if (percentage >= 40) return '#ff7a45';
    return '#ff4d4f';
  };

  const getCompletionStatus = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'normal';
    if (percentage >= 40) return 'exception';
    return 'exception';
  };

  if (initialLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: 'white' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const userName = userInfo.first_name && userInfo.last_name
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : userInfo.first_name || 'الباحث';

  return (
    <div className="profile-container">
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app/profile')}
          style={{ fontSize: '14px' }}
        >
          العودة للبروفايل
        </Button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="avatar-container">
            <Upload
              name="profile_picture"
              showUploadList={false}
              beforeUpload={async (file) => {
                try {
                  const formData = new FormData();
                  formData.append('profile_picture', file);
      
                  const response = await profileService.uploadProfilePicture(formData.file);

                  // Update profile data with new profile picture
                  setProfileData(prev => ({ ...prev, profile_picture: response.profile_picture }));

                  // Refresh profile data to ensure we have the latest data
                  try {
                    const refreshedProfile = await profileService.getMyProfile();
                    setProfileData(refreshedProfile);
                  } catch (refreshError) {
                    // console.warn('Failed to refresh profile after upload:', refreshError);
                  }

                  message.success('تم تحديث الصورة الشخصية بنجاح!');
                } catch (error) {
                  message.error('فشل في رفع الصورة الشخصية');
                }
                return false;
              }}
              accept="image/jpeg,image/jpg,image/png"
            >
              <div className="profile-avatar" style={{ cursor: 'pointer', position: 'relative' }}>
                {profileData?.profile_picture ? (
                  <img
                    src={profileData.profile_picture}
                    alt="Profile"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <Avatar
                    size={96}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: '#4f8cff',
                      border: '3px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#1890ff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  fontSize: '12px',
                  color: 'white'
                }}>
                  <EditOutlined />
                </div>
              </div>
            </Upload>
          </div>

          <div className="profile-info">
            <Title level={2} className="user-name">
              {profileData ? 'تحديث البروفايل الأكاديمي' : 'إنشاء البروفايل الأكاديمي'}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              {profileData ? 'قم بتحديث معلومات بروفايلك الأكاديمي' : 'أنشئ بروفايلك الأكاديمي لعرض خبراتك وإنجازاتك البحثية'}
            </Text>
            <div className="user-role">
              <UserOutlined className="role-icon" />
              د. {userName}
            </div>
            {userInfo.institution && (
              <div className="user-institution">
                <GlobalOutlined className="institution-icon" />
                <span>{userInfo.institution}</span>
                {userInfo.department && <span> - {userInfo.department}</span>}
              </div>
            )}

            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-number">{profileCompletion}%</div>
                <div className="stat-label">اكتمال البروفايل</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  <FileTextOutlined />
                </div>
                <div className="stat-label">إعداد البروفايل</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <Row gutter={[24, 24]}>
          {/* Left Column - Progress & Info */}
          <Col xs={24} lg={8}>
            {/* Profile Completion Card */}
            <Card className="info-card">
              <Title level={4}>
                <FileTextOutlined />
                نسبة اكتمال البروفايل
              </Title>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Progress
                  type="circle"
                  percent={profileCompletion}
                  strokeColor={getCompletionColor(profileCompletion)}
                  size={120}
                  strokeWidth={8}
                />
              </div>
              <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                {profileCompletion < 50 && 'يرجى إكمال البيانات الأساسية'}
                {profileCompletion >= 50 && profileCompletion < 80 && 'بروفايل جيد - يمكن تحسينه'}
                {profileCompletion >= 80 && 'بروفايل ممتاز!'}
              </Text>
            </Card>

            {/* Basic Info Card */}
            <Card className="info-card">
              <Title level={4}>
                <UserOutlined />
                المعلومات الأساسية
              </Title>
              <div className="info-grid">
                <div className="info-item">
                  <Text strong>الاسم الأول:</Text>
                  <Text>{userInfo.first_name}</Text>
                </div>
                <div className="info-item">
                  <Text strong>اسم العائلة:</Text>
                  <Text>{userInfo.last_name}</Text>
                </div>
                <div className="info-item">
                  <Text strong>البريد الإلكتروني:</Text>
                  <Text>{userInfo.email}</Text>
                </div>
                {userInfo.institution && (
                  <div className="info-item">
                    <Text strong>المؤسسة:</Text>
                    <Text>{userInfo.institution}</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* CV Upload Card */}
            <Card className="info-card">
              <Title level={4}>
                <FileTextOutlined />
                السيرة الذاتية
              </Title>
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
                <Button
                  icon={<UploadOutlined />}
                  className="upload-btn"
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  {existingCvFile ? 'تحديث السيرة الذاتية' : 'رفع السيرة الذاتية'}
                </Button>
              </Upload>
              {existingCvFile && !cvFile && (
                <div style={{ textAlign: 'center' }}>
                  <Text type="success">✓ تم رفع السيرة الذاتية مسبق</Text>
                  <br />
                  <a
                    href={existingCvFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-link"
                    style={{ marginTop: '8px', display: 'inline-block' }}
                  >
                    عرض الملف
                  </a>
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column - Form */}
          <Col xs={24} lg={16}>
            <Card className="info-card">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleFormChange}
                size="large"
              >
                {/* ORCID & Website */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="orcid_id"
                      label={
                        <span>
                          <GlobalOutlined /> ORCID ID
                        </span>
                      }
                      tooltip="معرف الباحث الدولي (مثال: 0000-0000-0000-0000)"
                    >
                      <Input placeholder="0000-0000-0000-0000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="website"
                      label={
                        <span>
                          <GlobalOutlined /> الموقع الشخصي
                        </span>
                      }
                    >
                      <Input placeholder="https://yourwebsite.com" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Bio */}
                <Form.Item
                  name="bio"
                  label={
                    <span>
                      <UserOutlined /> نبذة تعريفية
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="اكتب نبذة تعريفية عن نفسك وخلفيتك الأكاديمية..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                {/* Research Interests */}
                <Form.Item
                  name="research_interests"
                  label={
                    <span>
                      <BookOutlined /> الاهتمامات البحثية
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="اذكر مجالات اهتماماتك البحثية..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Divider>
                  <span style={{ color: '#4f8cff', fontWeight: 'bold' }}>
                    المعلومات المهنية
                  </span>
                </Divider>

                {/* Professional Information */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="institution"
                      label={
                        <span>
                          <GlobalOutlined /> المؤسسة
                        </span>
                      }
                    >
                      <Input placeholder="اسم الجامعة أو المؤسسة" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="department"
                      label={
                        <span>
                          <BookOutlined /> القسم
                        </span>
                      }
                    >
                      <Input placeholder="اسم القسم أو الكلية" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="position"
                      label={
                        <span>
                          <UserOutlined /> المنصب الأكاديمي
                        </span>
                      }
                    >
                      <Input placeholder="أستاذ، أستاذ مشارك، باحث، إلخ" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="academic_degree"
                      label={
                        <span>
                          <BookOutlined /> الدرجة العلمية
                        </span>
                      }
                    >
                      <Input placeholder="دكتوراه، ماجستير، بكالوريوس، إلخ" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="specialization"
                      label={
                        <span>
                          <BookOutlined /> التخصص
                        </span>
                      }
                    >
                      <Input placeholder="مجال التخصص الدقيق" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label={
                        <span>
                          <PhoneOutlined /> رقم الهاتف
                        </span>
                      }
                    >
                      <Input placeholder="+966 50 123 4567" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>
                  <span style={{ color: '#4f8cff', fontWeight: 'bold' }}>
                    الروابط الاجتماعية والأكاديمية
                  </span>
                </Divider>

                {/* Social Links */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="linkedin"
                      label={
                        <span>
                          <LinkedinOutlined /> LinkedIn
                        </span>
                      }
                    >
                      <Input placeholder="https://linkedin.com/in/yourprofile" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="google_scholar"
                      label={
                        <span>
                          <GoogleOutlined /> Google Scholar
                        </span>
                      }
                    >
                      <Input placeholder="https://scholar.google.com/citations?user=..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="researchgate"
                  label={
                    <span>
                      <GlobalOutlined /> ResearchGate
                    </span>
                  }
                >
                  <Input placeholder="https://www.researchgate.net/profile/yourprofile" />
                </Form.Item>

                {/* Privacy Setting */}
                <Form.Item
                  name="is_public"
                  label={
                    <span>
                      <EyeOutlined /> البروفايل عام
                    </span>
                  }
                  valuePropName="checked"
                  tooltip="إذا كان مفعل، سيكون البروفايل مرئي للجميع"
                >
                  <Switch
                    checkedChildren={<><EyeOutlined /> عام</>}
                    unCheckedChildren={<><EyeInvisibleOutlined /> خاص</>}
                  />
                </Form.Item>

                <Divider />

                {/* Timestamps */}
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

                {/* Submit Button */}
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{ minWidth: '150px' }}
                    >
                      {profileData ? 'تحديث البروفايل' : 'إنشاء البروفايل'}
                    </Button>

                    {!profileData && (
                      <Button
                        type="default"
                        onClick={() => navigate('/app/profile')}
                        size="large"
                      >
                        إلغاء
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CreateProfilePage;
