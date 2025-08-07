const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor() {
    this.notifications = new Map();
    this.pushSubscriptions = new Map();
    this.notificationSettings = new Map();
  }

  // 發送通知
  async sendNotification({ userId, type, title, message, data, priority = 'normal' }) {
    try {
      const notificationId = uuidv4();
      const notification = {
        id: notificationId,
        userId,
        type,
        title,
        message,
        data: data || {},
        priority,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.notifications.set(notificationId, notification);
      
      // 檢查是否需要發送推送通知
      const settings = await this.getNotificationSettings(userId);
      if (settings.pushEnabled && this.shouldSendPush(type, priority)) {
        await this.sendPushNotification(userId, notification);
      }

      logger.info(`通知已發送: ${notificationId} 給用戶 ${userId}`);
      return notification;
    } catch (error) {
      logger.error('發送通知錯誤:', error);
      throw new Error('發送通知失敗');
    }
  }

  // 獲取用戶通知列表
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type, isRead } = options;
      
      let notifications = Array.from(this.notifications.values())
        .filter(n => n.userId === userId);

      // 篩選條件
      if (type) {
        notifications = notifications.filter(n => n.type === type);
      }
      if (isRead !== undefined) {
        notifications = notifications.filter(n => n.isRead === isRead);
      }

      // 排序（最新的在前）
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNotifications = notifications.slice(startIndex, endIndex);

      return {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: notifications.length,
          totalPages: Math.ceil(notifications.length / limit)
        }
      };
    } catch (error) {
      logger.error('獲取用戶通知錯誤:', error);
      throw new Error('獲取通知列表失敗');
    }
  }

  // 標記通知為已讀
  async markAsRead(notificationId, userId) {
    try {
      const notification = this.notifications.get(notificationId);
      if (!notification || notification.userId !== userId) {
        throw new Error('通知不存在或無權限');
      }

      notification.isRead = true;
      notification.updatedAt = new Date();
      
      logger.info(`通知已標記為已讀: ${notificationId}`);
      return { success: true, notification };
    } catch (error) {
      logger.error('標記通知已讀錯誤:', error);
      throw error;
    }
  }

  // 批量標記通知為已讀
  async batchMarkAsRead(notificationIds, userId) {
    try {
      const results = [];
      for (const notificationId of notificationIds) {
        try {
          const result = await this.markAsRead(notificationId, userId);
          results.push(result);
        } catch (error) {
          results.push({ success: false, notificationId, error: error.message });
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: notificationIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      logger.error('批量標記通知已讀錯誤:', error);
      throw new Error('批量標記已讀失敗');
    }
  }

  // 刪除通知
  async deleteNotification(notificationId, userId) {
    try {
      const notification = this.notifications.get(notificationId);
      if (!notification || notification.userId !== userId) {
        throw new Error('通知不存在或無權限');
      }

      this.notifications.delete(notificationId);
      
      logger.info(`通知已刪除: ${notificationId}`);
      return { success: true };
    } catch (error) {
      logger.error('刪除通知錯誤:', error);
      throw error;
    }
  }

  // 獲取通知統計
  async getNotificationStats(userId) {
    try {
      const notifications = Array.from(this.notifications.values())
        .filter(n => n.userId === userId);

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        read: notifications.filter(n => n.isRead).length,
        byType: {},
        byPriority: {
          high: notifications.filter(n => n.priority === 'high').length,
          normal: notifications.filter(n => n.priority === 'normal').length,
          low: notifications.filter(n => n.priority === 'low').length
        },
        recentActivity: notifications
          .filter(n => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      };

      // 按類型統計
      notifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('獲取通知統計錯誤:', error);
      throw new Error('獲取通知統計失敗');
    }
  }

  // 更新通知設置
  async updateNotificationSettings(userId, settings) {
    try {
      const currentSettings = await this.getNotificationSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date() };
      
      this.notificationSettings.set(userId, updatedSettings);
      
      logger.info(`通知設置已更新: ${userId}`);
      return updatedSettings;
    } catch (error) {
      logger.error('更新通知設置錯誤:', error);
      throw new Error('更新通知設置失敗');
    }
  }

  // 獲取通知設置
  async getNotificationSettings(userId) {
    try {
      const settings = this.notificationSettings.get(userId);
      if (!settings) {
        // 返回默認設置
        const defaultSettings = {
          pushEnabled: true,
          emailEnabled: false,
          inAppEnabled: true,
          types: {
            system: { push: true, email: false, inApp: true },
            price: { push: true, email: true, inApp: true },
            security: { push: true, email: true, inApp: true },
            marketing: { push: false, email: false, inApp: false }
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          },
          updatedAt: new Date()
        };
        
        this.notificationSettings.set(userId, defaultSettings);
        return defaultSettings;
      }
      
      return settings;
    } catch (error) {
      logger.error('獲取通知設置錯誤:', error);
      throw new Error('獲取通知設置失敗');
    }
  }

  // 訂閱推送通知
  async subscribeToPush(userId, subscription) {
    try {
      const { endpoint, keys } = subscription;
      
      this.pushSubscriptions.set(userId, {
        endpoint,
        keys,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      logger.info(`用戶已訂閱推送通知: ${userId}`);
      return { success: true, subscription };
    } catch (error) {
      logger.error('訂閱推送通知錯誤:', error);
      throw new Error('訂閱推送通知失敗');
    }
  }

  // 取消訂閱推送通知
  async unsubscribeFromPush(userId) {
    try {
      this.pushSubscriptions.delete(userId);
      
      logger.info(`用戶已取消訂閱推送通知: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('取消訂閱推送通知錯誤:', error);
      throw new Error('取消訂閱推送通知失敗');
    }
  }

  // 發送推送通知
  async sendPushNotification(userId, notification) {
    try {
      const subscription = this.pushSubscriptions.get(userId);
      if (!subscription) {
        logger.warn(`用戶 ${userId} 未訂閱推送通知`);
        return;
      }

      // 這裡應該集成實際的推送服務（如 Firebase Cloud Messaging）
      // 目前使用模擬實現
      const pushPayload = {
        title: notification.title,
        body: notification.message,
        data: notification.data,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notification.type,
        requireInteraction: notification.priority === 'high'
      };

      logger.info(`推送通知已發送: ${notification.id} 給用戶 ${userId}`);
      return { success: true, payload: pushPayload };
    } catch (error) {
      logger.error('發送推送通知錯誤:', error);
      throw new Error('發送推送通知失敗');
    }
  }

  // 檢查是否應該發送推送通知
  shouldSendPush(type, priority) {
    // 檢查靜默時間
    const now = new Date();
    const currentHour = now.getHours();
    
    // 簡單的靜默時間檢查（22:00 - 08:00）
    if (currentHour >= 22 || currentHour < 8) {
      return priority === 'high'; // 只有高優先級通知在靜默時間發送
    }
    
    return true;
  }

  // 清理舊通知
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const [id, notification] of this.notifications.entries()) {
        if (new Date(notification.createdAt) < cutoffDate && notification.isRead) {
          this.notifications.delete(id);
          deletedCount++;
        }
      }

      logger.info(`清理了 ${deletedCount} 條舊通知`);
      return { success: true, deletedCount };
    } catch (error) {
      logger.error('清理舊通知錯誤:', error);
      throw new Error('清理舊通知失敗');
    }
  }

  // 獲取通知模板
  getNotificationTemplates() {
    return {
      welcome: {
        title: '歡迎使用TCG助手',
        message: '感謝您註冊TCG助手！開始探索卡牌世界吧。',
        type: 'system',
        priority: 'normal'
      },
      priceAlert: {
        title: '價格提醒',
        message: '您關注的卡牌價格有變動',
        type: 'price',
        priority: 'normal'
      },
      securityAlert: {
        title: '安全提醒',
        message: '檢測到異常登入活動',
        type: 'security',
        priority: 'high'
      },
      featureUpdate: {
        title: '功能更新',
        message: '新功能已上線，快來體驗吧！',
        type: 'marketing',
        priority: 'low'
      }
    };
  }

  // 發送系統通知
  async sendSystemNotification(userId, templateKey, customData = {}) {
    try {
      const templates = this.getNotificationTemplates();
      const template = templates[templateKey];
      
      if (!template) {
        throw new Error('通知模板不存在');
      }

      return await this.sendNotification({
        userId,
        type: template.type,
        title: template.title,
        message: template.message,
        data: customData,
        priority: template.priority
      });
    } catch (error) {
      logger.error('發送系統通知錯誤:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
