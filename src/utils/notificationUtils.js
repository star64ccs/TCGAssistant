// 通知工具類
class NotificationUtils {
  constructor() {
    this.hasPermission = false;
    this.isSupported = 'Notification' in window;
    this.init();
  }
  
  // 初始化
  async init() {
    if (!this.isSupported) {
      console.warn('此瀏覽器不支援通知功能');
      return;
    }
    
    this.hasPermission = await this.checkPermission();
  }
  
  // 檢查通知權限
  async checkPermission() {
    if (!this.isSupported) return false;
    
    if (Notification.permission === 'granted') {
      return true;
    } else if (Notification.permission === 'denied') {
      return false;
    } else {
      return false;
    }
  }
  
  // 請求通知權限
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('此瀏覽器不支援通知功能');
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('請求通知權限失敗:', error);
      return false;
    }
  }
  
  // 發送本地通知
  async sendLocalNotification(options) {
    if (!this.isSupported) {
      console.warn('此瀏覽器不支援通知功能');
      return null;
    }
    
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('通知權限被拒絕');
      }
    }
    
    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'tcg-assistant',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      data: {},
      actions: [],
      ...options,
    };
    
    try {
      const notification = new Notification(defaultOptions.title, defaultOptions);
      
      // 添加事件監聽器
      notification.onclick = (event) => {
        event.preventDefault();
        if (defaultOptions.onClick) {
          defaultOptions.onClick(event);
        }
        notification.close();
      };
      
      notification.onclose = (event) => {
        if (defaultOptions.onClose) {
          defaultOptions.onClose(event);
        }
      };
      
      notification.onerror = (event) => {
        console.error('通知錯誤:', event);
        if (defaultOptions.onError) {
          defaultOptions.onError(event);
        }
      };
      
      return notification;
    } catch (error) {
      console.error('發送通知失敗:', error);
      throw error;
    }
  }
  
  // 發送成功通知
  async sendSuccessNotification(title, body, options = {}) {
    return await this.sendLocalNotification({
      title,
      body,
      icon: '/icons/success.png',
      badge: '/icons/success.png',
      tag: 'success',
      ...options,
    });
  }
  
  // 發送錯誤通知
  async sendErrorNotification(title, body, options = {}) {
    return await this.sendLocalNotification({
      title,
      body,
      icon: '/icons/error.png',
      badge: '/icons/error.png',
      tag: 'error',
      requireInteraction: true,
      ...options,
    });
  }
  
  // 發送警告通知
  async sendWarningNotification(title, body, options = {}) {
    return await this.sendLocalNotification({
      title,
      body,
      icon: '/icons/warning.png',
      badge: '/icons/warning.png',
      tag: 'warning',
      ...options,
    });
  }
  
  // 發送信息通知
  async sendInfoNotification(title, body, options = {}) {
    return await this.sendLocalNotification({
      title,
      body,
      icon: '/icons/info.png',
      badge: '/icons/info.png',
      tag: 'info',
      ...options,
    });
  }
  
  // 發送卡牌分析完成通知
  async sendAnalysisCompleteNotification(cardName, analysisType) {
    return await this.sendSuccessNotification(
      '分析完成',
      `${cardName} 的${analysisType}分析已完成`,
      {
        onClick: () => {
          // 跳轉到結果頁面
          window.focus();
        },
      }
    );
  }
  
  // 發送價格變動通知
  async sendPriceChangeNotification(cardName, oldPrice, newPrice, changePercent) {
    const isIncrease = newPrice > oldPrice;
    const icon = isIncrease ? '/icons/price-up.png' : '/icons/price-down.png';
    const tag = isIncrease ? 'price-up' : 'price-down';
    
    return await this.sendLocalNotification({
      title: '價格變動提醒',
      body: `${cardName} 價格從 $${oldPrice} 變動為 $${newPrice} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`,
      icon,
      badge: icon,
      tag,
      requireInteraction: false,
      onClick: () => {
        // 跳轉到卡牌詳情頁面
        window.focus();
      },
    });
  }
  
  // 發送收藏提醒通知
  async sendCollectionReminderNotification() {
    return await this.sendInfoNotification(
      '收藏提醒',
      '您已經有一段時間沒有查看收藏了，來看看您的卡牌收藏吧！',
      {
        onClick: () => {
          // 跳轉到收藏頁面
          window.focus();
        },
      }
    );
  }
  
  // 發送會員到期通知
  async sendMembershipExpiryNotification(daysLeft) {
    return await this.sendWarningNotification(
      '會員到期提醒',
      `您的VIP會員將在 ${daysLeft} 天後到期，請及時續費以繼續享受所有功能。`,
      {
        requireInteraction: true,
        onClick: () => {
          // 跳轉到會員頁面
          window.focus();
        },
      }
    );
  }
  
  // 發送新功能通知
  async sendNewFeatureNotification(featureName, description) {
    return await this.sendInfoNotification(
      '新功能上線',
      `${featureName}: ${description}`,
      {
        onClick: () => {
          // 跳轉到新功能介紹頁面
          window.focus();
        },
      }
    );
  }
  
  // 發送系統維護通知
  async sendMaintenanceNotification(startTime, endTime) {
    return await this.sendWarningNotification(
      '系統維護通知',
      `系統將於 ${startTime} 至 ${endTime} 進行維護，期間可能無法正常使用服務。`,
      {
        requireInteraction: true,
      }
    );
  }
  
  // 發送批量通知
  async sendBatchNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendLocalNotification(notification);
        results.push({ success: true, notification: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
      
      // 避免通知過於密集
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
  
  // 關閉所有通知
  closeAllNotifications() {
    if (!this.isSupported) return;
    
    // 關閉所有當前通知
    if ('serviceWorker' in navigator && 'getNotifications' in navigator.serviceWorker) {
      navigator.serviceWorker.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    }
  }
  
  // 關閉特定標籤的通知
  closeNotificationsByTag(tag) {
    if (!this.isSupported) return;
    
    if ('serviceWorker' in navigator && 'getNotifications' in navigator.serviceWorker) {
      navigator.serviceWorker.getNotifications().then(notifications => {
        notifications.forEach(notification => {
          if (notification.tag === tag) {
            notification.close();
          }
        });
      });
    }
  }
  
  // 設置通知偏好
  setNotificationPreferences(preferences) {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }
  
  // 獲取通知偏好
  getNotificationPreferences() {
    const preferences = localStorage.getItem('notificationPreferences');
    return preferences ? JSON.parse(preferences) : {
      analysisComplete: true,
      priceChanges: true,
      collectionReminders: true,
      membershipExpiry: true,
      newFeatures: true,
      systemMaintenance: true,
      sound: true,
      vibration: true,
    };
  }
  
  // 檢查是否應該發送通知
  shouldSendNotification(type) {
    const preferences = this.getNotificationPreferences();
    return preferences[type] !== false;
  }
  
  // 發送智能通知（根據偏好設置）
  async sendSmartNotification(type, title, body, options = {}) {
    if (!this.shouldSendNotification(type)) {
      return null;
    }
    
    const preferences = this.getNotificationPreferences();
    
    // 根據偏好調整選項
    if (!preferences.sound) {
      options.silent = true;
    }
    
    if (!preferences.vibration) {
      options.vibrate = [];
    }
    
    return await this.sendLocalNotification({
      title,
      body,
      tag: type,
      ...options,
    });
  }
  
  // 註冊服務工作者（用於後台通知）
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('此瀏覽器不支援服務工作者');
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('服務工作者註冊成功:', registration);
      return true;
    } catch (error) {
      console.error('服務工作者註冊失敗:', error);
      return false;
    }
  }
  
  // 發送後台通知
  async sendBackgroundNotification(title, body, options = {}) {
    if (!('serviceWorker' in navigator)) {
      return await this.sendLocalNotification({ title, body, ...options });
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'background',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {},
        actions: [],
        ...options,
      });
    } catch (error) {
      console.error('發送後台通知失敗:', error);
      // 回退到本地通知
      return await this.sendLocalNotification({ title, body, ...options });
    }
  }
  
  // 設置定期通知
  setPeriodicNotification(title, body, interval, options = {}) {
    const notificationId = `periodic_${Date.now()}`;
    
    const sendNotification = async () => {
      await this.sendLocalNotification({
        title,
        body,
        tag: notificationId,
        ...options,
      });
    };
    
    // 立即發送一次
    sendNotification();
    
    // 設置定期發送
    const intervalId = setInterval(sendNotification, interval);
    
    // 返回清理函數
    return () => {
      clearInterval(intervalId);
      this.closeNotificationsByTag(notificationId);
    };
  }
  
  // 設置延遲通知
  setDelayedNotification(title, body, delay, options = {}) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const notification = await this.sendLocalNotification({
            title,
            body,
            tag: 'delayed',
            ...options,
          });
          resolve(notification);
        } catch (error) {
          resolve(null);
        }
      }, delay);
    });
  }
}

export default new NotificationUtils();
