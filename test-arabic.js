#!/usr/bin/env node

// Simple test script to verify Arabic translations are working
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Check if Arabic translation file exists
const arTranslationPath = path.join(__dirname, 'src/i18n/locales/ar.json');
if (fs.existsSync(arTranslationPath)) {
  
  try {
    const arTranslations = JSON.parse(fs.readFileSync(arTranslationPath, 'utf8'));
    
    // Check key sections
    const sections = ['common', 'auth', 'homepage', 'dashboard', 'announcements', 'courses', 'services'];
    
    // Check some key translations
    const keyTranslations = [
      ['common.home', 'الرئيسية'],
      ['auth.loginTitle', 'تسجيل الدخول إلى أجيري'],
      ['homepage.heroTitle', 'معهد بحوث الهندسة الوراثية الزراعية']
    ];
    
    keyTranslations.forEach(([key, expected]) => {
      const keys = key.split('.');
      let value = arTranslations;
      for (const k of keys) {
        value = value?.[k];
      }

    });
    
  } catch (error) {
    // console.log('❌ Error parsing Arabic translation file:', error.message);
  }
}

// Check i18n configuration
const i18nConfigPath = path.join(__dirname, 'src/i18n/index.js');
if (fs.existsSync(i18nConfigPath)) {
  
  const i18nConfig = fs.readFileSync(i18nConfigPath, 'utf8');
} 

// Check if key components use useTranslation
const componentsToCheck = [
  'src/pages/auth/LoginPage.jsx',
  'src/pages/auth/RegisterPage.jsx',
  'src/pages/public/HomePage.jsx',
  'src/components/layout/MainLayout.jsx',
  'src/components/layout/GuestLayout.jsx'
];

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');

  }
});
