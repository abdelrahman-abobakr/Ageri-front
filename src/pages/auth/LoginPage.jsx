import { useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError, getDefaultRedirectPath } from '../../store/slices/authSlice';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { setFormFieldErrors, clearFormFieldErrors } from '../../utils/errorHandler';

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user) {
      // If user came from a specific protected route, redirect there
      // Otherwise, redirect to their default dashboard
      const redirectTo = (from && from !== '/login' && from !== '/') ? from : getDefaultRedirectPath(user);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  // Handle field-level errors
  useEffect(() => {
    if (error && error.fieldErrors) {
      setFormFieldErrors(form, error.fieldErrors);
    } else {
      // Clear field errors when there are no field-specific errors
      clearFormFieldErrors(form, ['email', 'password']);
    }
  }, [error, form]);

  const onFinish = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

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
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Ageri Research Platform
          </Title>
          <Text type="secondary">
            Sign in to your account
          </Text>
        </div>

        <ErrorDisplay
          error={error}
          onClose={() => dispatch(clearError())}
          showFieldErrors={false}
        />

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address!',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1890ff' }}>
              Register here
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/forgot-password" style={{ color: '#1890ff' }}>
            Forgot your password?
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
