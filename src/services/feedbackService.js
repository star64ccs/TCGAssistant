import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

// 反饋類型
export const FEEDBACK_TYPES = {
  BUG_REPORT: 'bug_report',
  FEATURE_REQUEST: 'feature_request',
  GENERAL_FEEDBACK: 'general_feedback',
  COMPLAINT: 'complaint',
  PRAISE: 'praise',
  SUGGESTION: 'suggestion',
};

// 反饋優先級
export const FEEDBACK_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

// 反饋狀態
export const FEEDBACK_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
};

class FeedbackService {
  constructor() {
    this.isInitialized = false;
    this.feedbackQueue = [];
    this.offlineFeedbacks = [];
  }

  // 初始化反饋服務
  async initialize() {
    try {
      if (this.isInitialized) return;

      // 載入離線反饋
      await this.loadOfflineFeedbacks();
      
      // 設置定期同步
      this.setupSyncTask();
      
      this.isInitialized = true;
      console.log('FeedbackService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FeedbackService:', error);
      throw error;
    }
  }

  // 提交反饋
  async submitFeedback({
    type = FEEDBACK_TYPES.GENERAL_FEEDBACK,
    title,
    description,
    priority = FEEDBACK_PRIORITY.NORMAL,
    category = 'general',
    attachments = [],
    userInfo = {},
    deviceInfo = {},
    appVersion = '',
    osVersion = '',
  }) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const feedbackData = {
        id: this.generateFeedbackId(),
        type,
        title,
        description,
        priority,
        category,
        attachments,
        userInfo,
        deviceInfo,
        appVersion,
        osVersion,
        status: FEEDBACK_STATUS.PENDING,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 嘗試立即提交
      const success = await this.sendFeedbackToServer(feedbackData);
      
      if (success) {
        // 保存到本地歷史
        await this.saveFeedbackToHistory(feedbackData);
        return { success: true, feedbackId: feedbackData.id };
      } else {
        // 保存到離線隊列
        await this.saveOfflineFeedback(feedbackData);
        return { success: false, feedbackId: feedbackData.id, offline: true };
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  // 提交評分
  async submitRating({
    feature,
    rating,
    comment = '',
    category = 'general',
  }) {
    try {
      const ratingData = {
        id: this.generateFeedbackId(),
        type: 'rating',
        feature,
        rating,
        comment,
        category,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      // 保存評分到本地
      await this.saveRatingToHistory(ratingData);
      
      // 嘗試同步到服務器
      await this.sendRatingToServer(ratingData);
      
      return { success: true, ratingId: ratingData.id };
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }

  // 報告問題
  async reportIssue({
    issueType,
    title,
    description,
    steps = [],
    expectedBehavior = '',
    actualBehavior = '',
    severity = 'medium',
    attachments = [],
    userInfo = {},
  }) {
    try {
      const issueData = {
        id: this.generateFeedbackId(),
        type: FEEDBACK_TYPES.BUG_REPORT,
        issueType,
        title,
        description,
        steps,
        expectedBehavior,
        actualBehavior,
        severity,
        attachments,
        userInfo,
        priority: this.calculatePriority(severity),
        status: FEEDBACK_STATUS.PENDING,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 嘗試立即提交
      const success = await this.sendFeedbackToServer(issueData);
      
      if (success) {
        await this.saveFeedbackToHistory(issueData);
        return { success: true, issueId: issueData.id };
      } else {
        await this.saveOfflineFeedback(issueData);
        return { success: false, issueId: issueData.id, offline: true };
      }
    } catch (error) {
      console.error('Failed to report issue:', error);
      throw error;
    }
  }

  // 請求功能
  async requestFeature({
    title,
    description,
    useCase = '',
    impact = 'medium',
    alternatives = [],
    userInfo = {},
  }) {
    try {
      const featureRequest = {
        id: this.generateFeedbackId(),
        type: FEEDBACK_TYPES.FEATURE_REQUEST,
        title,
        description,
        useCase,
        impact,
        alternatives,
        userInfo,
        priority: this.calculatePriority(impact),
        status: FEEDBACK_STATUS.PENDING,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await this.sendFeedbackToServer(featureRequest);
      
      if (success) {
        await this.saveFeedbackToHistory(featureRequest);
        return { success: true, requestId: featureRequest.id };
      } else {
        await this.saveOfflineFeedback(featureRequest);
        return { success: false, requestId: featureRequest.id, offline: true };
      }
    } catch (error) {
      console.error('Failed to request feature:', error);
      throw error;
    }
  }

  // 獲取反饋歷史
  async getFeedbackHistory(limit = 50, offset = 0) {
    try {
      const historyKey = STORAGE_KEYS.FEEDBACK_HISTORY;
      const historyData = await AsyncStorage.getItem(historyKey);
      const history = historyData ? JSON.parse(historyData) : [];
      
      // 按時間排序
      const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
      
      // 分頁
      return sortedHistory.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get feedback history:', error);
      return [];
    }
  }

  // 獲取反饋統計
  async getFeedbackStats() {
    try {
      const history = await this.getFeedbackHistory(1000, 0);
      
      const stats = {
        total: history.length,
        byType: {},
        byStatus: {},
        byPriority: {},
        byCategory: {},
        recentActivity: 0,
        averageRating: 0,
      };

      let totalRating = 0;
      let ratingCount = 0;

      history.forEach(feedback => {
        // 按類型統計
        stats.byType[feedback.type] = (stats.byType[feedback.type] || 0) + 1;
        
        // 按狀態統計
        stats.byStatus[feedback.status] = (stats.byStatus[feedback.status] || 0) + 1;
        
        // 按優先級統計
        stats.byPriority[feedback.priority] = (stats.byPriority[feedback.priority] || 0) + 1;
        
        // 按類別統計
        stats.byCategory[feedback.category] = (stats.byCategory[feedback.category] || 0) + 1;
        
        // 最近活動（7天內）
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (feedback.timestamp > sevenDaysAgo) {
          stats.recentActivity++;
        }
        
        // 評分統計
        if (feedback.type === 'rating' && feedback.rating) {
          totalRating += feedback.rating;
          ratingCount++;
        }
      });

      if (ratingCount > 0) {
        stats.averageRating = totalRating / ratingCount;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get feedback stats:', error);
      return null;
    }
  }

  // 更新反饋狀態
  async updateFeedbackStatus(feedbackId, status, response = '') {
    try {
      const history = await this.getFeedbackHistory(1000, 0);
      const feedbackIndex = history.findIndex(f => f.id === feedbackId);
      
      if (feedbackIndex !== -1) {
        history[feedbackIndex].status = status;
        history[feedbackIndex].response = response;
        history[feedbackIndex].updatedAt = new Date().toISOString();
        
        await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK_HISTORY, JSON.stringify(history));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      return false;
    }
  }

  // 刪除反饋
  async deleteFeedback(feedbackId) {
    try {
      const history = await this.getFeedbackHistory(1000, 0);
      const filteredHistory = history.filter(f => f.id !== feedbackId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK_HISTORY, JSON.stringify(filteredHistory));
      return true;
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      return false;
    }
  }

  // 同步離線反饋
  async syncOfflineFeedbacks() {
    try {
      const offlineFeedbacks = await this.getOfflineFeedbacks();
      
      for (const feedback of offlineFeedbacks) {
        const success = await this.sendFeedbackToServer(feedback);
        if (success) {
          await this.removeOfflineFeedback(feedback.id);
          await this.saveFeedbackToHistory(feedback);
        }
      }
      
      return { success: true, synced: offlineFeedbacks.length };
    } catch (error) {
      console.error('Failed to sync offline feedbacks:', error);
      return { success: false, error: error.message };
    }
  }

  // 生成反饋ID
  generateFeedbackId() {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 計算優先級
  calculatePriority(severity) {
    switch (severity.toLowerCase()) {
      case 'critical':
        return FEEDBACK_PRIORITY.URGENT;
      case 'high':
        return FEEDBACK_PRIORITY.HIGH;
      case 'medium':
        return FEEDBACK_PRIORITY.NORMAL;
      case 'low':
        return FEEDBACK_PRIORITY.LOW;
      default:
        return FEEDBACK_PRIORITY.NORMAL;
    }
  }

  // 發送反饋到服務器
  async sendFeedbackToServer(feedbackData) {
    try {
      // 這裡應該調用真實的API
      // 目前使用模擬API
      const response = await fetch('https://api.tcgassistant.com/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send feedback to server:', error);
      return false;
    }
  }

  // 發送評分到服務器
  async sendRatingToServer(ratingData) {
    try {
      const response = await fetch('https://api.tcgassistant.com/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send rating to server:', error);
      return false;
    }
  }

  // 保存反饋到歷史記錄
  async saveFeedbackToHistory(feedbackData) {
    try {
      const historyKey = STORAGE_KEYS.FEEDBACK_HISTORY;
      const currentHistory = await AsyncStorage.getItem(historyKey);
      const history = currentHistory ? JSON.parse(currentHistory) : [];
      
      history.push(feedbackData);
      
      // 限制歷史記錄數量
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save feedback to history:', error);
    }
  }

  // 保存評分到歷史記錄
  async saveRatingToHistory(ratingData) {
    try {
      const ratingKey = STORAGE_KEYS.RATING_HISTORY;
      const currentRatings = await AsyncStorage.getItem(ratingKey);
      const ratings = currentRatings ? JSON.parse(currentRatings) : [];
      
      ratings.push(ratingData);
      
      if (ratings.length > 500) {
        ratings.splice(0, ratings.length - 500);
      }
      
      await AsyncStorage.setItem(ratingKey, JSON.stringify(ratings));
    } catch (error) {
      console.error('Failed to save rating to history:', error);
    }
  }

  // 保存離線反饋
  async saveOfflineFeedback(feedbackData) {
    try {
      this.offlineFeedbacks.push(feedbackData);
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_FEEDBACKS,
        JSON.stringify(this.offlineFeedbacks)
      );
    } catch (error) {
      console.error('Failed to save offline feedback:', error);
    }
  }

  // 獲取離線反饋
  async getOfflineFeedbacks() {
    try {
      const offlineData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_FEEDBACKS);
      return offlineData ? JSON.parse(offlineData) : [];
    } catch (error) {
      console.error('Failed to get offline feedbacks:', error);
      return [];
    }
  }

  // 載入離線反饋
  async loadOfflineFeedbacks() {
    try {
      this.offlineFeedbacks = await this.getOfflineFeedbacks();
    } catch (error) {
      console.error('Failed to load offline feedbacks:', error);
      this.offlineFeedbacks = [];
    }
  }

  // 移除離線反饋
  async removeOfflineFeedback(feedbackId) {
    try {
      this.offlineFeedbacks = this.offlineFeedbacks.filter(f => f.id !== feedbackId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_FEEDBACKS,
        JSON.stringify(this.offlineFeedbacks)
      );
    } catch (error) {
      console.error('Failed to remove offline feedback:', error);
    }
  }

  // 設置同步任務
  setupSyncTask() {
    // 每小時同步一次離線反饋
    setInterval(() => {
      this.syncOfflineFeedbacks();
    }, 60 * 60 * 1000);
  }

  // 清理舊的反饋記錄
  async cleanupOldFeedbacks(daysToKeep = 365) {
    try {
      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const history = await this.getFeedbackHistory(10000, 0);
      const filteredHistory = history.filter(f => f.timestamp > cutoffDate);
      
      await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK_HISTORY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to cleanup old feedbacks:', error);
    }
  }

  // 匯出反饋數據
  async exportFeedbackData() {
    try {
      const history = await this.getFeedbackHistory(10000, 0);
      const stats = await this.getFeedbackStats();
      
      return {
        feedbacks: history,
        stats,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Failed to export feedback data:', error);
      return null;
    }
  }
}

// 創建單例實例
const feedbackService = new FeedbackService();

export default feedbackService;
