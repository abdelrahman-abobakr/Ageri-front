import React from 'react';
import { Alert, List, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatFieldErrors } from '../../utils/errorHandler';

const { Text } = Typography;

/**
 * Enhanced error display component that handles different types of errors
 * @param {Object} props - Component props
 * @param {Object|string} props.error - Error object or string
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.showFieldErrors - Whether to show field-specific errors
 * @param {string} props.style - Additional styles
 */
const ErrorDisplay = ({
  error,
  onClose,
  showFieldErrors = false,
  style = {}
}) => {
  const { t } = useTranslation();
  if (!error) return null;

  // Handle string errors (legacy support)
  if (typeof error === 'string') {
    return (
      <Alert
        message={t('errors.somethingWentWrong')}
        description={error}
        type="error"
        showIcon
        closable={!!onClose}
        onClose={onClose}
        style={{ marginBottom: 16, ...style }}
      />
    );
  }

  // Handle parsed error objects
  const { type, message, details, fieldErrors } = error;

  // Determine alert type and icon based on error type
  const getAlertProps = (errorType) => {
    switch (errorType) {
      case 'network':
      case 'connection':
        return {
          type: 'error',
          icon: <ExclamationCircleOutlined />,
          message: t('errors.connectionError')
        };

      case 'auth':
        return {
          type: 'error',
          icon: <CloseCircleOutlined />,
          message: t('errors.authenticationError')
        };

      case 'validation':
        return {
          type: 'warning',
          icon: <WarningOutlined />,
          message: t('errors.validationError')
        };

      case 'permission':
        return {
          type: 'error',
          icon: <CloseCircleOutlined />,
          message: t('errors.accessDenied')
        };

      case 'server':
        return {
          type: 'error',
          icon: <ExclamationCircleOutlined />,
          message: t('errors.serverError')
        };

      case 'ratelimit':
        return {
          type: 'warning',
          icon: <WarningOutlined />,
          message: t('errors.rateLimitExceeded')
        };

      default:
        return {
          type: 'error',
          icon: <InfoCircleOutlined />,
          message: t('errors.error')
        };
    }
  };

  const alertProps = getAlertProps(type);
  const formattedFieldErrors = formatFieldErrors(fieldErrors);

  return (
    <Alert
      {...alertProps}
      description={
        <div>
          <Text>{message}</Text>
          {showFieldErrors && formattedFieldErrors.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <List
                size="small"
                dataSource={formattedFieldErrors}
                renderItem={(item) => (
                  <List.Item style={{ padding: '2px 0', border: 'none' }}>
                    <Text type="danger" style={{ fontSize: '12px' }}>
                      <strong>{item.displayName}:</strong> {item.message}
                    </Text>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      }
      showIcon
      closable={!!onClose}
      onClose={onClose}
      style={{ marginBottom: 16, ...style }}
    />
  );
};

export default ErrorDisplay;
