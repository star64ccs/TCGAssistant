import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

// 通知類型
export const NOTIFICATION_TYPES = {
  PRICE_ALERT: 'price_alert',
  MARKET_UPDATE: 'market_update',
  NEW_FEATURE: 'new_feature',
  SYSTEM_UPDATE: 'system_update',
  COLLECTION_REMINDER: 'collection_reminder',
  TRADING_ALERT: 'trading_alert',
  SECURITY_ALERT: 'security_alert',
  GENERAL: 'general',
};

// 通知優先級
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationQueue = [];
    this.scheduledNotifications = new Map();
  }

  // 初始化通知服務
  async initialize() {
    try {
      if (this.isInitialized) return;

      // 檢查通知權限
      await this.requestPermission();
      
      // 載入已排程的通知
      await this.loadScheduledNotifications();
      
      // 設置通知監聽器
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      throw error;
    }
  }

  // 請求通知權限
  async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        // iOS 需要特殊處理
        const { Permissions } = require('react-native-permissions');
        const result = await Permissions.request('notification');
        return result === 'granted';
      } else {
        // Android 權限處理
        const { check, request, PERMISSIONS, RESULTS } = require('react-native-permissions');
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // 檢查通知權限
  async checkPermission() {
    try {
      if (Platform.OS === 'ios') {
        const { Permissions } = require('react-native-permissions');
        const result = await Permissions.check('notification');
        return result === 'granted';
      } else {
        const { check, PERMISSIONS, RESULTS } = require('react-native-permissions');
        const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // 設置通知監聽器
  setupNotificationListeners() {
    try {
      const { PushNotificationIOS } = require('react-native');
      
      // 通知接收監聽器
      PushNotificationIOS.addEventListener('notification', this.handleNotificationReceived);
      
      // 通知點擊監聽器
      PushNotificationIOS.addEventListener('localNotification', this.handleLocalNotification);
      
      // 註冊遠程通知
      PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
    } catch (error) {
      console.error('Failed to setup notification listeners:', error);
    }
  }

  // 處理接收到的通知
  handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    
    // 處理通知數據
    this.processNotificationData(notification);
    
    // 更新通知統計
    this.updateNotificationStats(notification);
  };

  // 處理本地通知
  handleLocalNotification = (notification) => {
    console.log('Local notification received:', notification);
    
    // 處理通知點擊
    this.handleNotificationTap(notification);
  };

  // 發送本地通知
  async sendLocalNotification({
    id,
    title,
    body,
    data = {},
    sound = 'default',
    badge = 1,
    priority = NOTIFICATION_PRIORITY.NORMAL,
    category = NOTIFICATION_TYPES.GENERAL,
    scheduled = false,
    scheduledTime = null,
  }) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return false;
      }

      const notificationData = {
        id,
        title,
        body,
        data,
        sound,
        badge,
        priority,
        category,
        timestamp: Date.now(),
      };

      if (scheduled && scheduledTime) {
        // 排程通知
        return await this.scheduleNotification(notificationData, scheduledTime);
      } else {
        // 立即發送通知
        return await this.showNotification(notificationData);
      }
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return false;
    }
  }

  // 顯示通知
  async showNotification(notificationData) {
    try {
      if (Platform.OS === 'ios') {
        const { PushNotificationIOS } = require('react-native');
        
        PushNotificationIOS.addNotificationRequest({
          id: notificationData.id,
          title: notificationData.title,
          body: notificationData.body,
          sound: notificationData.sound,
          badge: notificationData.badge,
          userInfo: notificationData.data,
        });
      } else {
        // Android 通知
        const { PushNotification } = require('react-native-push-notification');
        
        PushNotification.localNotification({
          id: notificationData.id,
          title: notificationData.title,
          message: notificationData.body,
          soundName: notificationData.sound,
          number: notificationData.badge,
          userInfo: notificationData.data,
          channelId: 'default',
          priority: notificationData.priority,
        });
      }

      // 保存通知記錄
      await this.saveNotificationRecord(notificationData);
      
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // 排程通知
  async scheduleNotification(notificationData, scheduledTime) {
    try {
      const notificationId = `scheduled_${notificationData.id}_${Date.now()}`;
      
      if (Platform.OS === 'ios') {
        const { PushNotificationIOS } = require('react-native');
        
        PushNotificationIOS.addNotificationRequest({
          id: notificationId,
          title: notificationData.title,
          body: notificationData.body,
          sound: notificationData.sound,
          badge: notificationData.badge,
          userInfo: notificationData.data,
          fireDate: scheduledTime.toISOString(),
        });
      } else {
        const { PushNotification } = require('react-native-push-notification');
        
        PushNotification.localNotificationSchedule({
          id: notificationId,
          title: notificationData.title,
          message: notificationData.body,
          soundName: notificationData.sound,
          number: notificationData.badge,
          userInfo: notificationData.data,
          channelId: 'default',
          priority: notificationData.priority,
          date: scheduledTime,
        });
      }

      // 保存排程通知
      this.scheduledNotifications.set(notificationId, {
        ...notificationData,
        scheduledTime: scheduledTime.getTime(),
      });
      
      await this.saveScheduledNotifications();
      
      return true;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return false;
    }
  }

  // 取消通知
  async cancelNotification(notificationId) {
    try {
      if (Platform.OS === 'ios') {
        const { PushNotificationIOS } = require('react-native');
        PushNotificationIOS.removePendingNotificationRequests([notificationId]);
      } else {
        const { PushNotification } = require('react-native-push-notification');
        PushNotification.cancelLocalNotification({ id: notificationId });
      }

      // 從排程列表中移除
      this.scheduledNotifications.delete(notificationId);
      await this.saveScheduledNotifications();
      
      return true;
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      return false;
    }
  }

  // 取消所有通知
  async cancelAllNotifications() {
    try {
      if (Platform.OS === 'ios') {
        const { PushNotificationIOS } = require('react-native');
        PushNotificationIOS.removeAllPendingNotificationRequests();
      } else {
        const { PushNotification } = require('react-native-push-notification');
        PushNotification.cancelAllLocalNotifications();
      }

      // 清空排程列表
      this.scheduledNotifications.clear();
      await this.saveScheduledNotifications();
      
      return true;
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      return false;
    }
  }

  // 保存通知記錄
  async saveNotificationRecord(notificationData) {
    try {
      const key = `${STORAGE_KEYS.NOTIFICATION_HISTORY}_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(notificationData));
    } catch (error) {
      console.error('Failed to save notification record:', error);
    }
  }

  // 保存排程通知
  async saveScheduledNotifications() {
    try {
      const scheduledData = Array.from(this.scheduledNotifications.entries());
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
        JSON.stringify(scheduledData)
      );
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  // 載入排程通知
  async loadScheduledNotifications() {
    try {
      const scheduledData = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
      if (scheduledData) {
        const notifications = JSON.parse(scheduledData);
        this.scheduledNotifications = new Map(notifications);
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  }

  // 處理通知數據
  processNotificationData(notification) {
    try {
      const { data, category } = notification;
      
      switch (category) {
        case NOTIFICATION_TYPES.PRICE_ALERT:
          this.handlePriceAlert(data);
          break;
        case NOTIFICATION_TYPES.MARKET_UPDATE:
          this.handleMarketUpdate(data);
          break;
        case NOTIFICATION_TYPES.TRADING_ALERT:
          this.handleTradingAlert(data);
          break;
        case NOTIFICATION_TYPES.SECURITY_ALERT:
          this.handleSecurityAlert(data);
          break;
        default:
          this.handleGeneralNotification(data);
      }
    } catch (error) {
      console.error('Failed to process notification data:', error);
    }
  }

  // 處理價格警報
  handlePriceAlert(data) {
    console.log('Processing price alert:', data);
    // 實現價格警報邏輯
  }

  // 處理市場更新
  handleMarketUpdate(data) {
    console.log('Processing market update:', data);
    // 實現市場更新邏輯
  }

  // 處理交易警報
  handleTradingAlert(data) {
    console.log('Processing trading alert:', data);
    // 實現交易警報邏輯
  }

  // 處理安全警報
  handleSecurityAlert(data) {
    console.log('Processing security alert:', data);
    // 實現安全警報邏輯
  }

  // 處理一般通知
  handleGeneralNotification(data) {
    console.log('Processing general notification:', data);
    // 實現一般通知邏輯
  }

  // 處理通知點擊
  handleNotificationTap(notification) {
    console.log('Notification tapped:', notification);
    // 實現通知點擊邏輯
  }

  // 更新通知統計
  async updateNotificationStats(notification) {
    try {
      const statsKey = STORAGE_KEYS.NOTIFICATION_STATS;
      const currentStats = await AsyncStorage.getItem(statsKey);
      const stats = currentStats ? JSON.parse(currentStats) : {
        totalReceived: 0,
        totalTapped: 0,
        byCategory: {},
        byDate: {},
      };

      // 更新統計
      stats.totalReceived++;
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
      
      const today = new Date().toISOString().split('T')[0];
      stats.byDate[today] = (stats.byDate[today] || 0) + 1;

      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update notification stats:', error);
    }
  }

  // 獲取通知統計
  async getNotificationStats() {
    try {
      const statsKey = STORAGE_KEYS.NOTIFICATION_STATS;
      const stats = await AsyncStorage.getItem(statsKey);
      return stats ? JSON.parse(stats) : {
        totalReceived: 0,
        totalTapped: 0,
        byCategory: {},
        byDate: {},
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return null;
    }
  }

  // 清理舊的通知記錄
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const keys = await AsyncStorage.getAllKeys();
      const notificationKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.NOTIFICATION_HISTORY));
      
      for (const key of notificationKeys) {
        const notificationData = await AsyncStorage.getItem(key);
        if (notificationData) {
          const notification = JSON.parse(notificationData);
          if (notification.timestamp < cutoffDate) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
    }
  }

  // 設置定期清理任務
  setupCleanupTask() {
    // 每週清理一次舊通知
    setInterval(() => {
      this.cleanupOldNotifications();
    }, 7 * 24 * 60 * 60 * 1000);
  }
}

// 創建單例實例
const notificationService = new NotificationService();

export default notificationService;
