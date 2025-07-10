import { Spin } from 'antd';

const LoadingSpinner = ({ 
  size = 'large', 
  tip = 'Loading...', 
  style = {},
  fullScreen = false 
}) => {
  const containerStyle = fullScreen 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        ...style
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
        ...style
      };

  return (
    <div style={containerStyle}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
