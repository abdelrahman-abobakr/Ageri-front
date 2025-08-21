import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5',
        }}>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                
            />
        </div>
    );
};

export default NotFoundPage;