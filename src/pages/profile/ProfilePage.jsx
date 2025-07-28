import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Avatar, Upload, message, Row, Col,
  Typography, Divider, List, Tag, Switch, Spin, Alert, Empty
} from 'antd';
import {
  UserOutlined, UploadOutlined, SaveOutlined, BookOutlined,
  PlusOutlined, EditOutlined, PhoneOutlined,
  MailOutlined, GlobalOutlined, LinkedinOutlined, GoogleOutlined,
  FileTextOutlined, EyeOutlined, EyeInvisibleOutlined, CloseOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined, MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';
import researchService from '../../services/researchService';

import './profile-page.css';

const { Title, Text, Paragraph } = Typography;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const [cvUploading, setCvUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState({ first_name: '', last_name: '', email: '' });
  const [error, setError] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if current user is the profile owner
  const isOwner = true; // For now, always true since we're viewing our own profile

  const [formData, setFormData] = useState({
    bio: '',
    research_interests: '',
    orcid_id: '',
    website: '',
    linkedin: '',
    google_scholar: '',
    researchgate: '',
    phone: '',
    institution: '',
    department: '',
    position: '',
    academic_degree: '',
    specialization: '',
    is_public: true
  });

  // حساب نسبة اكتمال البروفايل
  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;
    
    const fields = ['bio', 'research_interests', 'orcid_id', 'website', 'linkedin', 'google_scholar', 'researchgate'];
    const filledFields = fields.filter(field => profileData[field] && profileData[field].trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // Check if user is authenticated first
      if (!isAuthenticated) {
        setError('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.');
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);

        // جلب بيانات المستخدم الأساسية
        let user;
        try {
          user = await authService.getCurrentUser();
        } catch (userError) {
          // If API call fails, try to use Redux state as fallback
          if (authUser) {
            console.warn('Using fallback user data from Redux state');
            user = authUser;
          } else {
            throw userError;
          }
        }

        setUserInfo({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          role: user.role || '',
          institution: user.institution || '',
          department: user.department || '',
          profile_picture: user.profile_picture || null
        });

        // جلب بيانات البروفايل
        try {
          const profileResponse = await profileService.getMyProfile();
          const profileData = profileResponse.data || profileResponse;
          setProfile(profileData);
          setHasProfile(true);

          const completion = calculateProfileCompletion(profileData);
          setProfileCompletion(completion);

          // تعبئة الفورم بالبيانات الموجودة
          const formValues = {
            bio: profileData.bio || '',
            research_interests: profileData.research_interests || '',
            orcid_id: profileData.orcid_id || '',
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
          };

          console.log('Setting form values:', formValues);
          form.setFieldsValue(formValues);
          setFormData(formValues);
        } catch (profileError) {
          console.log('Profile not found, user needs to create one');
          setProfile(null);
          setHasProfile(false);
          setProfileCompletion(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);

        // Handle specific error types
        if (error.response?.status === 401) {
          setError('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
          // Clear authentication and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (error.response?.status === 404) {
          setError('لم يتم العثور على بيانات المستخدم. يرجى التواصل مع الدعم الفني.');
        } else if (error.response?.status >= 500) {
          setError('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحق.');
        } else {
          setError(error.message || 'فشل في جلب البيانات. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [form, isAuthenticated, authUser, navigate]);

  const handleCreateProfile = () => {
    navigate('/create-profile');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    // Reset form with current profile data when opening modal
    const currentFormData = {
      bio: profile?.bio || '',
      research_interests: profile?.research_interests || '',
      orcid_id: profile?.orcid_id || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      google_scholar: profile?.google_scholar || '',
      researchgate: profile?.researchgate || '',
      phone: userInfo?.phone || '',
      institution: userInfo?.institution || '',
      department: userInfo?.department || '',
      position: profile?.position || '',
      academic_degree: profile?.academic_degree || '',
      specialization: profile?.specialization || '',
      is_public: profile?.is_public !== undefined ? profile.is_public : true
    };

    console.log('Opening edit modal with data:', currentFormData);
    form.setFieldsValue(currentFormData);
    setFormData(currentFormData);
    setEditOpen(true);
  };



  const handleSave = async () => {
    try {
      setLoading(true);

      console.log('=== STARTING PROFILE SAVE ===');
      console.log('Current formData state:', formData);

      // Validate form fields first
      let values = {};
      try {
        values = await form.validateFields();
        console.log('✅ Form validation successful, values:', values);
      } catch (validationError) {
        console.error('❌ Form validation failed:', validationError);
        console.error('Validation error fields:', validationError.errorFields);

        // If validation fails, use current formData instead
        console.log('Using current formData instead of form values');
        values = {};
      }

      // Use form values instead of formData state
      const formDataToSave = { ...formData, ...values };
      console.log('=== FORM DATA ANALYSIS ===');
      console.log('Original formData state:', formData);
      console.log('Form validation values:', values);
      console.log('Combined form data to save:', formDataToSave);
      console.log('=== CHECKING SPECIFIC FIELDS ===');
      console.log('bio:', formDataToSave.bio);
      console.log('research_interests:', formDataToSave.research_interests);
      console.log('is_public:', formDataToSave.is_public);
      console.log('phone:', formDataToSave.phone);
      console.log('position:', formDataToSave.position);

      // Create FormData for multipart/form-data request
      const formDataForRequest = new FormData();

      console.log('=== PREPARING FORMDATA FOR MULTIPART REQUEST ===');
      console.log('Form data to process:', formDataToSave);

      // Define all fields that should be sent to the profile endpoint
      const profileFields = [
        'bio', 'research_interests', 'orcid_id', 'website',
        'linkedin', 'google_scholar', 'researchgate', 'is_public',
        'position', 'academic_degree', 'specialization',
        'phone', 'institution', 'department'
      ];

      // Add profile fields to FormData
      profileFields.forEach(field => {
        const value = formDataToSave[field];
        console.log(`Processing field: ${field}, value:`, value, `(type: ${typeof value})`);

        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            const trimmedValue = value.trim();
            if (trimmedValue !== '') {
              formDataForRequest.append(field, trimmedValue);
              console.log(`Added to FormData: ${field} =`, trimmedValue);
            } else {
              console.log(`Skipping empty string for field: ${field}`);
            }
          } else if (typeof value === 'boolean') {
            formDataForRequest.append(field, value.toString());
            console.log(`Added to FormData: ${field} =`, value.toString());
          } else {
            formDataForRequest.append(field, value);
            console.log(`Added to FormData: ${field} =`, value);
          }
        } else {
          console.log(`Skipping undefined/null field: ${field}`);
        }
      });

      // Handle profile picture if present
      if (formDataToSave.profile_picture instanceof File) {
        formDataForRequest.append('profile_picture', formDataToSave.profile_picture);
        console.log('Added profile picture file to FormData:', formDataToSave.profile_picture.name);
      }

      // Log FormData contents for debugging
      console.log('=== FORMDATA CONTENTS ===');
      for (let [key, value] of formDataForRequest.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      console.log('📤 Starting profile update with FormData...');

      // Send FormData to profile endpoint (multipart/form-data)
      console.log('📤 Updating profile with multipart/form-data...');
      const updatedProfile = await profileService.updateMyProfile(formDataForRequest);
      console.log('✅ Profile updated successfully:', updatedProfile);

      // Check if department and institution were actually saved
      console.log('🔍 Checking if department and institution were saved:');
      console.log('  - Sent department:', formDataToSave.department);
      console.log('  - Received department:', updatedProfile.department);
      console.log('  - Sent institution:', formDataToSave.institution);
      console.log('  - Received institution:', updatedProfile.institution);

      // Update local state with the new data
      setProfile(updatedProfile);
      setHasProfile(true);
      const completion = calculateProfileCompletion(updatedProfile);
      setProfileCompletion(completion);

      // Also update userInfo if it contains user fields that might have been updated
      if (updatedProfile.phone !== undefined) {
        setUserInfo(prev => ({ ...prev, phone: updatedProfile.phone }));
      }
      if (updatedProfile.institution !== undefined) {
        setUserInfo(prev => ({ ...prev, institution: updatedProfile.institution }));
      }
      if (updatedProfile.department !== undefined) {
        setUserInfo(prev => ({ ...prev, department: updatedProfile.department }));
      }

      // If department and institution are not in the profile response,
      // they might need to be updated in the User model separately
      if (updatedProfile.department === undefined && formDataToSave.department) {
        console.log('⚠️ Department not returned in profile response - attempting User model update');
        try {
          const userUpdateData = { department: formDataToSave.department };
          const updatedUser = await authService.updateUserFields(userUpdateData);
          console.log('✅ User department updated:', updatedUser.department);
          setUserInfo(prev => ({ ...prev, department: updatedUser.department }));
        } catch (userError) {
          console.error('❌ Failed to update user department:', userError);
        }
      }
      if (updatedProfile.institution === undefined && formDataToSave.institution) {
        console.log('⚠️ Institution not returned in profile response - attempting User model update');
        try {
          const userUpdateData = { institution: formDataToSave.institution };
          const updatedUser = await authService.updateUserFields(userUpdateData);
          console.log('✅ User institution updated:', updatedUser.institution);
          setUserInfo(prev => ({ ...prev, institution: updatedUser.institution }));
        } catch (userError) {
          console.error('❌ Failed to update user institution:', userError);
        }
      }

      // Update formData with the actual saved values
      const updatedFormData = {
        bio: updatedProfile?.bio || '',
        research_interests: updatedProfile?.research_interests || '',
        orcid_id: updatedProfile?.orcid_id || '',
        website: updatedProfile?.website || '',
        linkedin: updatedProfile?.linkedin || '',
        google_scholar: updatedProfile?.google_scholar || '',
        researchgate: updatedProfile?.researchgate || '',
        position: updatedProfile?.position || '',
        academic_degree: updatedProfile?.academic_degree || '',
        specialization: updatedProfile?.specialization || '',
        is_public: updatedProfile?.is_public !== undefined ? updatedProfile.is_public : true,
        phone: updatedProfile?.phone || userInfo?.phone || '',
        institution: updatedProfile?.institution || userInfo?.institution || '',
        department: updatedProfile?.department || userInfo?.department || ''
      };

      console.log('Updated form data:', updatedFormData);
      setFormData(updatedFormData);
      form.setFieldsValue(updatedFormData);

      // Refresh profile data to ensure we have the latest data
      try {
        console.log('🔄 Refreshing profile data...');
        const refreshedProfile = await profileService.getMyProfile();
        setProfile(refreshedProfile);
        console.log('✅ Profile data refreshed:', refreshedProfile);
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh profile after update:', refreshError);
      }

      // Close modal and show success message
      setEditOpen(false);
      message.success('تم تحديث البروفايل بنجاح!');
      console.log('=== PROFILE SAVE COMPLETED ===');
    } catch (error) {
      console.error('=== PROFILE SAVE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }

      // More specific error handling
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.error('400 Error data:', errorData);
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          message.error(`خطأ في البيانات:\n${errorMessages}`);
        } else {
          message.error('خطأ في البيانات المرسلة');
        }
      } else {
        message.error('فشل في تحديث البروفايل. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (info) => {
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      setAvatarUploading(true);

      console.log('📤 Raw file object received:', file);
      console.log('📤 File properties:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        constructor: file.constructor.name,
        instanceof_File: file instanceof File,
        instanceof_Blob: file instanceof Blob
      });

      if (!(file instanceof File)) {
        console.error('❌ Not a File object:', typeof file, file);
        message.error('خطأ في نوع الملف المرسل');
        return false;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        message.error('يرجى اختيار ملف صورة بصيغة JPG أو PNG فقط');
        return false;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('حجم الملف كبير. يرجى اختيار صورة أصغر من 5 ميجابايت');
        return false;
      }

      console.log('✅ File validation passed, uploading...');
      
      const freshFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      console.log('📤 Fresh file created:', freshFile);
      console.log('📤 Fresh file instanceof File:', freshFile instanceof File);

      const response = await profileService.uploadProfilePicture(freshFile);

      setProfile(prev => ({
        ...prev,
        profile_picture: response.profile_picture
      }));

      message.success('تم رفع الصورة الشخصية بنجاح');
      return false; 
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error.response?.data?.profile_picture) {
        const errorMsg = Array.isArray(error.response.data.profile_picture) 
          ? error.response.data.profile_picture[0] 
          : error.response.data.profile_picture;
        message.error(`خطأ في الصورة: ${errorMsg}`);
      } else {
        message.error('فشل في رفع الصورة الشخصية');
      }
      return false;
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleOrcidClick = (orcidId) => {
    if (orcidId && orcidId.trim()) {
      // Extract ORCID ID from URL if it's a full URL, or construct URL if it's just the ID
      let orcidUrl;
      if (orcidId.startsWith('http')) {
        orcidUrl = orcidId;
      } else {
        // Remove any non-numeric characters except hyphens and X
        const cleanId = orcidId.replace(/[^0-9X-]/gi, '');
        orcidUrl = `https://orcid.org/${cleanId}`;
      }
      window.open(orcidUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRetry = async () => {
    setInitialLoading(true);
    setError(null);

    // Check if user is still authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('لا توجد جلسة عمل صالحة. يرجى تسجيل الدخول مرة أخرى.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    // Try to fetch user data again
    try {
      const user = await authService.getCurrentUser();
      setUserInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role || '',
        institution: user.institution || '',
        department: user.department || ''
      });

      // Try to fetch profile data
      try {
        const profileResponse = await profileService.getMyProfile();
        const profileData = profileResponse.data || profileResponse;
        setProfile(profileData);
        setHasProfile(true);
        setProfileCompletion(calculateProfileCompletion(profileData));
      } catch (profileError) {
        setProfile(null);
        setHasProfile(false);
        setProfileCompletion(0);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      if (error.response?.status === 401) {
        setError('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('فشل في إعادة تحميل البيانات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setInitialLoading(false);
    }
  };



  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    if (percentage >= 40) return '#ff7a45';
    return '#ff4d4f';
  };

  if (initialLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('انتهت صلاحية') || error.includes('غير مصرح');

    return (
      <div className="profile-container">
        <div className="error-container">
          <ExclamationCircleOutlined className="error-icon" />
          <Title level={3}>خطأ في تحميل البروفايل</Title>
          <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
            {error}
          </Text>

          {isAuthError ? (
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center' }}>
              <Button type="primary" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                سيتم توجيهك لصفحة تسجيل الدخول
              </Text>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center' }}>
              <Button type="primary" onClick={handleRetry} loading={initialLoading}>
                إعادة المحاولة
              </Button>
              <Button type="default" onClick={() => navigate('/app/dashboard')}>
                العودة للوحة التحكم
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const userName = userInfo.first_name && userInfo.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : userInfo.first_name || 'الباحث';

  if (!hasProfile) {
    return (
      <div className="profile-container">
        {/* Profile Header للمستخدمين بدون بروفايل */}
        <div className="profile-header">
          <div className="header-content">
            <div className="avatar-container">
              <Upload
                name="profile_picture"
                showUploadList={false}
                beforeUpload={handleProfilePictureUpload}
                accept="image/jpeg,image/jpg,image/png"
                disabled={avatarUploading}
              >
                <div className="profile-avatar clickable-avatar" style={{ cursor: 'pointer', position: 'relative' }}>
                  {profile?.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '4px solid #fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <Avatar
                      size={140}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#4f8cff',
                        border: '4px solid #fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        fontSize: '48px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  )}
                  {avatarUploading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Spin style={{ color: 'white' }} />
                    </div>
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
                {userName}
              </Title>
              <div className="user-role">
                <UserOutlined className="role-icon" />
                {userInfo.role === 'researcher' ? 'باحث' : userInfo.role}
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
                  <div className="stat-number">0%</div>
                  <div className="stat-label">اكتمال البروفايل</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    <FileTextOutlined />
                  </div>
                  <div className="stat-label">بروفايل جديد</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* محتوى إنشاء البروفايل */}
        <div className="profile-content">
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Card className="info-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Empty
                  image={<UserOutlined style={{ fontSize: '72px', color: '#4f8cff' }} />}
                  description={
                    <div>
                      <Title level={3} style={{ color: '#4f8cff', marginBottom: '16px' }}>
                        مرحباً د. {userName}!
                      </Title>
                      <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                        لم تقم بإنشاء بروفايلك الشخصي بعد. البروفايل الشخصي يساعدك في:
                      </Paragraph>
                      <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <BookOutlined style={{ color: '#4f8cff', marginLeft: '8px' }} />
                            عرض اهتماماتك البحثية للباحثين الآخرين
                          </li>
                          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <GlobalOutlined style={{ color: '#4f8cff', marginLeft: '8px' }} />
                            ربط حساباتك الأكاديمية (ORCID، Google Scholar)
                          </li>
                          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <FileTextOutlined style={{ color: '#4f8cff', marginLeft: '8px' }} />
                            رفع سيرتك الذاتية ومشاركتها
                          </li>
                          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ color: '#4f8cff', marginLeft: '8px' }} />
                            بناء شبكة علاقات أكاديمية قوية
                          </li>
                        </ul>
                      </div>
                    </div>
                  }
                />
                
                <div style={{ marginTop: '32px' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleCreateProfile}
                    style={{ 
                      minWidth: '200px',
                      height: '50px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '8px'
                    }}
                  >
                    إنشاء البروفايل الآن
                  </Button>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <Text type="secondary">
                    لا تستغرق العملية أكثر من 5 دقائق
                  </Text>
                </div>
              </Card>

              {/* بطاقة المعلومات الأساسية */}
              <Card className="info-card" style={{ marginTop: '24px' }}>
                <Title level={4}>
                  <UserOutlined />
                  معلوماتك الأساسية
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
                  {userInfo.department && (
                    <div className="info-item">
                      <Text strong>القسم:</Text>
                      <Text>{userInfo.department}</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Main Profile Card - Unified Layout */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none',
          marginBottom: '24px'
        }}
      >
        {/* Profile Header Section */}
        <div style={{
          padding: '32px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
              {/* Profile Picture Section */}
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '24px' }}>
                <Upload
                  name="profile_picture"
                  showUploadList={false}
                  beforeUpload={handleProfilePictureUpload}
                  accept="image/jpeg,image/jpg,image/png"
                  disabled={avatarUploading}
                >
                  <div style={{ cursor: 'pointer', position: 'relative' }}>
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt="Profile"
                        style={{
                          width: '160px',
                          height: '160px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          transition: 'transform 0.2s ease-in-out'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <Avatar
                        size={160}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: '#4f8cff',
                          border: '4px solid #fff',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          fontSize: '56px',
                          transition: 'transform 0.2s ease-in-out'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    )}
                    {avatarUploading && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Spin />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: '#1890ff',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      <EditOutlined />
                    </div>
                  </div>
                </Upload>
              </div>
            </Col>

            <Col xs={24} sm={16} md={18}>
              {/* Profile Info */}
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={2} style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '600' }}>
                  {userName}
                </Title>
                <Text style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
                  {userInfo.role === 'researcher' ? 'باحث' :
                   userInfo.role === 'admin' ? 'مدير' :
                   userInfo.role === 'lab_manager' ? 'مدير مختبر' : 'مستخدم'}
                  {userInfo.institution && ` • ${userInfo.institution}`}
                  {userInfo.department && ` • ${userInfo.department}`}
                </Text>

                {/* Profile Completion Badge */}
                <div style={{ marginBottom: '16px' }}>
                  <Text style={{
                    color: profileCompletion >= 80 ? '#52c41a' : profileCompletion >= 50 ? '#faad14' : '#ff4d4f',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    اكتمال البروفايل: {profileCompletion}%
                  </Text>
                </div>

                {/* Edit Button - Only for Owner */}
                {isOwner && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    style={{
                      alignSelf: 'flex-start',
                      borderRadius: '6px',
                      height: '40px',
                      paddingLeft: '20px',
                      paddingRight: '20px'
                    }}
                  >
                    تحديث البروفايل
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Profile Content Sections */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Additional Info */}
          <Col xs={24} lg={8}>
            {/* Profile Completion */}
            <Card className="info-card">
              <Title level={4}>
                <FileTextOutlined />
                اكتمال البروفايل
              </Title>
              <div className="completion-progress">
                <div className="progress-circle">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      background: `conic-gradient(${getCompletionColor(profileCompletion)} ${profileCompletion * 3.6}deg, #f0f0f0 0deg)` 
                    }}
                  >
                    <div className="progress-text">{profileCompletion}%</div>
                  </div>
                </div>
              </div>
              <Text type="secondary">
                {profileCompletion < 50 && 'يرجى إكمال البيانات الأساسية'}
                {profileCompletion >= 50 && profileCompletion < 80 && 'بروفايل جيد - يمكن تحسينه'}
                {profileCompletion >= 80 && 'بروفايل ممتاز!'}
              </Text>
            </Card>

            {/* Contact Information */}
            <Card className="info-card">
              <Title level={4}>
                <PhoneOutlined />
                معلومات الاتصال
              </Title>
              <div className="contact-info">
                <div className="contact-item">
                  <MailOutlined className="contact-icon" />
                  <div className="contact-details">
                    <Text strong>البريد الإلكتروني</Text>
                    <Text copyable>{userInfo.email}</Text>
                  </div>
                </div>
                
                {profile?.website && (
                  <div className="contact-item">
                    <GlobalOutlined className="contact-icon" />
                    <div className="contact-details">
                      <Text strong>الموقع الشخصي</Text>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>


            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditProfile}
                size="large"
                className="edit-btn"
                style={{ marginBottom: '12px', width: '100%' }}
              >
                تحديث البروفايل
              </Button>
              

            </div>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={16}>
            {/* Personal Information Section */}
            <Card className="info-card" style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '20px', color: '#1890ff', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                المعلومات الشخصية
              </Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div className="info-field">
                    <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>نبذة تعريفية:</Text>
                    <Paragraph className="bio-text" style={{ margin: 0, color: '#262626', lineHeight: '1.6' }}>
                      {profile?.bio || `${userName} باحث متخصص في مجال ${userInfo.department || 'البحث الأكاديمي'}. يتمتع بخبرة واسعة في البحث العلمي والأكاديمي.`}
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="info-field">
                    <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>الاهتمامات البحثية:</Text>
                    <Paragraph style={{ margin: 0, color: '#262626', lineHeight: '1.6' }}>
                      {profile?.research_interests || 'لم يتم إضافة الاهتمامات البحثية بعد.'}
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Professional Information */}
            <Card className="info-card" style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '20px', color: '#1890ff', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
                <GlobalOutlined style={{ marginRight: '8px' }} />
                المعلومات المهنية
              </Title>
              <Row gutter={[24, 16]}>
                {userInfo?.institution && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>المؤسسة:</Text>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>{userInfo.institution}</Text>
                    </div>
                  </Col>
                )}
                {userInfo?.department && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>القسم:</Text>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>{userInfo.department}</Text>
                    </div>
                  </Col>
                )}
                {profile?.position && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>المنصب:</Text>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>{profile.position}</Text>
                    </div>
                  </Col>
                )}
                {profile?.academic_degree && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>الدرجة العلمية:</Text>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>{profile.academic_degree}</Text>
                    </div>
                  </Col>
                )}
                {profile?.specialization && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>التخصص:</Text>
                      <Text style={{ color: '#262626', fontSize: '14px' }}>{profile.specialization}</Text>
                    </div>
                  </Col>
                )}
                {userInfo?.phone && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>الهاتف:</Text>
                      <Text copyable style={{ color: '#262626', fontSize: '14px' }}>{userInfo.phone}</Text>
                    </div>
                  </Col>
                )}
                {profile?.orcid_id && (
                  <Col xs={24} sm={12}>
                    <div className="info-field">
                      <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>ORCID ID:</Text>
                      <Text
                        copyable
                        style={{
                          color: '#1890ff',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '14px'
                        }}
                        onClick={() => handleOrcidClick(profile.orcid_id)}
                      >
                        {profile.orcid_id}
                      </Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Social Links */}
            {(profile?.linkedin || profile?.google_scholar || profile?.researchgate || profile?.website) && (
              <Card className="info-card" style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ marginBottom: '20px', color: '#1890ff', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
                  <LinkedinOutlined style={{ marginRight: '8px' }} />
                  الروابط الأكاديمية
                </Title>
                <Row gutter={[24, 16]}>
                  {profile.linkedin && (
                    <Col xs={24} sm={12}>
                      <div className="info-field">
                        <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>LinkedIn:</Text>
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#1890ff', textDecoration: 'none', fontSize: '14px' }}>
                          <LinkedinOutlined style={{ marginRight: '4px' }} /> عرض الملف الشخصي
                        </a>
                      </div>
                    </Col>
                  )}
                  {profile.google_scholar && (
                    <Col xs={24} sm={12}>
                      <div className="info-field">
                        <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>Google Scholar:</Text>
                        <a href={profile.google_scholar} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#1890ff', textDecoration: 'none', fontSize: '14px' }}>
                          <GoogleOutlined style={{ marginRight: '4px' }} /> عرض المنشورات
                        </a>
                      </div>
                    </Col>
                  )}
                  {profile.researchgate && (
                    <Col xs={24} sm={12}>
                      <div className="info-field">
                        <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>ResearchGate:</Text>
                        <a href={profile.researchgate} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#1890ff', textDecoration: 'none', fontSize: '14px' }}>
                          <GlobalOutlined style={{ marginRight: '4px' }} /> عرض الأبحاث
                        </a>
                      </div>
                    </Col>
                  )}
                  {profile.website && (
                    <Col xs={24} sm={12}>
                      <div className="info-field">
                        <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>الموقع الشخصي:</Text>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#1890ff', textDecoration: 'none', fontSize: '14px' }}>
                          <GlobalOutlined style={{ marginRight: '4px' }} /> زيارة الموقع
                        </a>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}


          </Col>
        </Row>
      </Card>

      {/* Edit Modal */}
      {editOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <button
              className="edit-modal-close-btn"
              onClick={() => setEditOpen(false)}
            >
              <CloseOutlined />
            </button>
            
            <Title level={3} className="modal-title">تحديث البروفايل</Title>

            {/* Profile Picture Upload Section */}
            <div className="form-group" style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>الصورة الشخصية</label>

              <div style={{ marginBottom: '16px' }}>
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #1890ff'
                    }}
                  />
                ) : (
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#f0f0f0', color: '#999' }}
                  />
                )}
              </div>

              <Upload
                name="profile_picture"
                showUploadList={false}
                beforeUpload={handleProfilePictureUpload}
                accept="image/jpeg,image/jpg,image/png"
                disabled={avatarUploading}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={avatarUploading}
                  type="primary"
                  size="small"
                >
                  {(userInfo.profile_picture || profile?.profile_picture) ? 'تغيير الصورة' : 'رفع صورة'}
                </Button>
              </Upload>

              {profile?.profile_picture && (
                <Button
                  type="link"
                  size="small"
                  style={{ marginLeft: '8px', color: '#ff4d4f' }}
                  onClick={async () => {
                    try {
                      await authService.removeProfilePicture();
                      setProfile(prev => ({ ...prev, profile_picture: null }));

                      // Refresh profile data to ensure consistency
                      try {
                        const refreshedProfile = await profileService.getMyProfile();
                        setProfile(refreshedProfile);
                      } catch (refreshError) {
                        console.warn('Failed to refresh profile after removal:', refreshError);
                      }

                      message.success('تم حذف الصورة الشخصية');
                    } catch (error) {
                      message.error('فشل في حذف الصورة');
                    }
                  }}
                >
                  حذف الصورة
                </Button>
              )}

              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                الصيغ المدعومة: JPG, JPEG, PNG (حد أقصى 5 ميجابايت)
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={formData}
              onValuesChange={(changedValues, allValues) => {
                console.log('Form values changed:', changedValues, allValues);
                setFormData(prev => ({ ...prev, ...allValues }));
                setProfileCompletion(calculateProfileCompletion(allValues));
              }}
              preserve={false}
            >
              <Form.Item
                name="bio"
                label="النبذة التعريفية"
                rules={[{ max: 1000, message: 'النبذة التعريفية يجب أن تكون أقل من 1000 حرف' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="اكتب نبذة تعريفية عن نفسك..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="research_interests"
                label="الاهتمامات البحثية"
                rules={[{ max: 500, message: 'الاهتمامات البحثية يجب أن تكون أقل من 500 حرف' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="اذكر مجالات اهتماماتك البحثية..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="orcid_id"
                label="ORCID ID"
                rules={[
                  { pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, message: 'يرجى إدخال ORCID ID صحيح (0000-0000-0000-0000)' }
                ]}
              >
                <Input placeholder="0000-0000-0000-0000" />
              </Form.Item>

              <Form.Item
                name="website"
                label="الموقع الشخصي"
                rules={[{ type: 'url', message: 'يرجى إدخال رابط صحيح' }]}
              >
                <Input placeholder="https://yourwebsite.com" />
              </Form.Item>

              <Form.Item
                name="linkedin"
                label="LinkedIn"
                rules={[{ type: 'url', message: 'يرجى إدخال رابط LinkedIn صحيح' }]}
              >
                <Input placeholder="https://linkedin.com/in/yourprofile" />
              </Form.Item>

              <Form.Item
                name="google_scholar"
                label="Google Scholar"
                rules={[{ type: 'url', message: 'يرجى إدخال رابط Google Scholar صحيح' }]}
              >
                <Input placeholder="https://scholar.google.com/citations?user=..." />
              </Form.Item>

              <Form.Item
                name="researchgate"
                label="ResearchGate"
                rules={[{ type: 'url', message: 'يرجى إدخال رابط ResearchGate صحيح' }]}
              >
                <Input placeholder="https://www.researchgate.net/profile/yourprofile" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="رقم الهاتف"
                rules={[
                  { pattern: /^[\+]?[0-9\s\-\(\)]+$/, message: 'يرجى إدخال رقم هاتف صحيح' }
                ]}
              >
                <Input placeholder="+966 50 123 4567" />
              </Form.Item>

              <Form.Item
                name="institution"
                label="المؤسسة"
                rules={[{ max: 200, message: 'اسم المؤسسة يجب أن يكون أقل من 200 حرف' }]}
              >
                <Input placeholder="اسم الجامعة أو المؤسسة" />
              </Form.Item>

              <Form.Item
                name="department"
                label="القسم"
                rules={[{ max: 200, message: 'اسم القسم يجب أن يكون أقل من 200 حرف' }]}
              >
                <Input placeholder="اسم القسم أو الكلية" />
              </Form.Item>

              <Form.Item
                name="position"
                label="المنصب الأكاديمي"
                rules={[{ max: 100, message: 'المنصب يجب أن يكون أقل من 100 حرف' }]}
              >
                <Input placeholder="أستاذ، أستاذ مشارك، باحث، إلخ" />
              </Form.Item>

              <Form.Item
                name="academic_degree"
                label="الدرجة العلمية"
                rules={[{ max: 100, message: 'الدرجة العلمية يجب أن تكون أقل من 100 حرف' }]}
              >
                <Input placeholder="دكتوراه، ماجستير، بكالوريوس، إلخ" />
              </Form.Item>

              <Form.Item
                name="specialization"
                label="التخصص"
                rules={[{ max: 200, message: 'التخصص يجب أن يكون أقل من 200 حرف' }]}
              >
                <Input placeholder="مجال التخصص الدقيق" />
              </Form.Item>

              <Form.Item
                name="is_public"
                label="البروفايل عام"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="عام"
                  unCheckedChildren="خاص"
                />
              </Form.Item>
            </Form>

            <div className="modal-actions">
              <Button onClick={() => setEditOpen(false)}>
                إلغاء
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={loading}
                icon={<SaveOutlined />}
              >
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
