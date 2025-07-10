import { useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError, clearRegistrationSuccess, getDefaultRedirectPath } from '../../store/slices/authSlice';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { setFormFieldErrors, clearFormFieldErrors } from '../../utils/errorHandler';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
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
            Create Account
          </Title>
          <Text type="secondary">
            Join the Ageri Research Platform
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
            label="Username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
              {
                min: 3,
                message: 'Username must be at least 3 characters long!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Choose a username"
            />
          </Form.Item>

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

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="first_name"
              label="First Name"
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: 'Please input your first name!',
                },
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: 'Please input your last name!',
                },
              ]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                min: 8,
                message: 'Password must be at least 8 characters long!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a password"
            />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1890ff' }}>
              Sign in here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
