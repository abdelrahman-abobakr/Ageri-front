import { Result, Button, Card, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';

const { Paragraph } = Typography;

const PendingApprovalPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
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
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Result
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          title="Account Pending Approval"
          subTitle="Your account has been created successfully and is awaiting admin approval."
          extra={[
            <Button type="primary" key="logout" onClick={handleLogout}>
              Back to Login
            </Button>,
          ]}
        />
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Paragraph>
            Thank you for registering with the Ageri Research Platform. 
            Your account is currently under review by our administrators.
          </Paragraph>
          <Paragraph>
            You will receive an email notification once your account has been approved. 
            This process typically takes 1-2 business days.
          </Paragraph>
          <Paragraph type="secondary">
            If you have any questions, please contact our support team.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
