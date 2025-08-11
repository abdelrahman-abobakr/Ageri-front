// Test script to verify notification service functionality
import { notificationService } from './src/services/notificationService.js';

async function testNotificationService() {
  console.log('Testing notification service...');
  
  try {
    // Test getting notifications
    console.log('1. Testing getNotifications...');
    const notifications = await notificationService.getNotifications({ page_size: 5 });
    console.log('✅ getNotifications success:', notifications);
    
    // Test marking as read (if we have notifications)
    if (notifications.results && notifications.results.length > 0) {
      console.log('2. Testing markAsRead...');
      const result = await notificationService.markAsRead(notifications.results[0].id);
      console.log('✅ markAsRead success:', result);
    }
    
    // Test mark all as read
    console.log('3. Testing markAllAsRead...');
    const markAllResult = await notificationService.markAllAsRead();
    console.log('✅ markAllAsRead success:', markAllResult);
    
    // Test getting templates
    console.log('4. Testing getTemplates...');
    const templates = await notificationService.getTemplates();
    console.log('✅ getTemplates success:', templates);
    
    // Test getting settings
    console.log('5. Testing getSettings...');
    const settings = await notificationService.getSettings();
    console.log('✅ getSettings success:', settings);
    
    console.log('🎉 All notification service tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationService();
