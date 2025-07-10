import { Typography, Card } from 'antd';
import { useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const TestPage = () => {
  const location = useLocation();

  return (
    <Card>
      <Title level={2}>Test Page</Title>
      <Paragraph>
        Current path: <strong>{location.pathname}</strong>
      </Paragraph>
      <Paragraph>
        This is a test page to verify routing is working correctly.
      </Paragraph>
    </Card>
  );
};

export default TestPage;
