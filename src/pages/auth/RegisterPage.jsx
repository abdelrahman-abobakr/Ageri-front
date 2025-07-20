import { useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerUser, clearError, clearRegistrationSuccess, getDefaultRedirectPath } from '../../store/slices/authSlice';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { setFormFieldErrors, clearFormFieldErrors } from '../../utils/errorHandler';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess, isAuthenticated, user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = getDefaultRedirectPath(user);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Clear any existing errors and success state when component mounts
    dispatch(clearError());
    dispatch(clearRegistrationSuccess());
  }, [dispatch]);

  // Handle field-level errors
  useEffect(() => {
    if (error && error.fieldErrors) {
      setFormFieldErrors(form, error.fieldErrors);
    } else {
      // Clear field errors when there are no field-specific errors
      clearFormFieldErrors(form, ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']);
    }
  }, [error, form]);

  const onFinish = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      // Success message will be shown by the registrationSuccess state
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  if (registrationSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
          }}
        >
          <Alert
            message="Registration Successful!"
            description="Your account has been created successfully. Please wait for admin approval before you can log in."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            {t('auth.registerTitle')}
          </Title>
          <Text type="secondary">
            {t('homepage.heroTitle')}
          </Text>
        </div>

        <ErrorDisplay
          error={error}
          onClose={() => dispatch(clearError())}
          showFieldErrors={false}
        />

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label={t('auth.username')}
            rules={[
              {
                required: true,
                message: t('validation.usernameRequired'),
              },
              {
                min: 3,
                message: t('validation.usernameMinLength'),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('validation.enterUsername')}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[
              {
                required: true,
                message: t('validation.emailRequired'),
              },
              {
                type: 'email',
                message: t('validation.invalidEmail'),
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('validation.enterEmail')}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="first_name"
              label={t('auth.firstName')}
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: t('validation.firstNameRequired'),
                },
              ]}
            >
              <Input placeholder={t('validation.enterFirstName')} />
            </Form.Item>

            <Form.Item
              name="last_name"
              label={t('auth.lastName')}
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: t('validation.lastNameRequired'),
                },
              ]}
            >
              <Input placeholder={t('validation.enterLastName')} />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[
              {
                required: true,
                message: t('validation.passwordRequired'),
              },
              {
                min: 8,
                message: t('validation.passwordTooShort'),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('validation.enterPassword')}
            />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            label={t('auth.confirmPassword')}
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: t('validation.required'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('validation.passwordsDoNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('validation.confirmPassword')}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 40 }}
            >
              {t('auth.signUp')}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" style={{ color: '#1890ff' }}>
              {t('auth.signIn')}
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
