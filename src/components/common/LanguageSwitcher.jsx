import { useState } from 'react';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ size = 'middle', type = 'text' }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    {
      key: 'en',
      label: 'English',
      flag: '🇺🇸'
    },
    {
      key: 'ar',
      label: 'العربية',
      flag: '🇪🇬'
    }
  ];

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language.key);
    setCurrentLanguage(language.key);
    
    // Update document direction for RTL/LTR
    document.documentElement.dir = language.key === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language.key;
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.key === currentLanguage) || languages[0];
  };

  const menuItems = languages.map(language => ({
    key: language.key,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{language.flag}</span>
        <span>{language.label}</span>
      </div>
    ),
    onClick: () => handleLanguageChange(language)
  }));

  const currentLang = getCurrentLanguage();

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      arrow
      trigger={['click']}
    >
      <Button
        type={type}
        size={size}
        icon={<GlobalOutlined />}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          border: type === 'text' ? 'none' : undefined
        }}
      >
        <span>{currentLang.flag}</span>
        {size !== 'small' && <span>{currentLang.label}</span>}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
