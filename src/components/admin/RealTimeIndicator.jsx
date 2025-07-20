import { useState, useEffect } from 'react';
import { Badge, Tooltip, Typography } from 'antd';
import { WifiOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const RealTimeIndicator = ({ 
  lastUpdated, 
  isLoading = false, 
  autoRefresh = true, 
  refreshInterval = 30000,
  onRefresh,
  size = 'small'
}) => {
  const { t } = useTranslation();
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now - lastUpdated;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo(`${seconds} ثانية`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} دقيقة`);
      } else {
        setTimeAgo(`${hours} ساعة`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getStatusColor = () => {
    if (isLoading) return 'processing';
    if (!lastUpdated) return 'default';
    
    const now = new Date();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 2) return 'success';
    if (minutes < 5) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (isLoading) return 'جاري التحديث...';
    if (!lastUpdated) return 'لم يتم التحديث';
    return `آخر تحديث: ${timeAgo}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Badge 
        status={getStatusColor()} 
        text={
          <Text 
            type="secondary" 
            style={{ fontSize: size === 'small' ? '12px' : '14px' }}
          >
            {getStatusText()}
          </Text>
        }
      />
      
      {autoRefresh && (
        <Tooltip title="البيانات تتحدث تلقائياً كل 30 ثانية">
          <WifiOutlined 
            style={{ 
              color: getStatusColor() === 'success' ? '#52c41a' : '#d9d9d9',
              fontSize: '12px'
            }} 
          />
        </Tooltip>
      )}
      
      {onRefresh && (
        <Tooltip title="تحديث يدوي">
          <ReloadOutlined 
            spin={isLoading}
            onClick={onRefresh}
            style={{ 
              cursor: 'pointer',
              color: '#1890ff',
              fontSize: '12px'
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default RealTimeIndicator;
