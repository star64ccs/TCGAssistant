const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
  constructor() {
    this.feedbacks = new Map();
    this.replies = new Map();
  }

  // 提交反饋
  async submitFeedback({ userId, type, title, description, rating, category, attachments }) {
    try {
      const feedbackId = uuidv4();
      const feedback = {
        id: feedbackId,
        userId,
        type,
        title,
        description,
        rating: rating || null,
        category: category || 'general',
        attachments: attachments || [],
        status: 'pending',
        priority: this.calculatePriority(type, rating),
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: []
      };

      this.feedbacks.set(feedbackId, feedback);
      
      logger.info(`反饋已提交: ${feedbackId} 由用戶 ${userId}`);
      return feedback;
    } catch (error) {
      logger.error('提交反饋錯誤:', error);
      throw new Error('提交反饋失敗');
    }
  }

  // 獲取用戶反饋列表
  async getUserFeedbacks(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type, status, category } = options;
      
      let feedbacks = Array.from(this.feedbacks.values())
        .filter(f => f.userId === userId);

      // 篩選條件
      if (type) {
        feedbacks = feedbacks.filter(f => f.type === type);
      }
      if (status) {
        feedbacks = feedbacks.filter(f => f.status === status);
      }
      if (category) {
        feedbacks = feedbacks.filter(f => f.category === category);
      }

      // 排序（最新的在前）
      feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFeedbacks = feedbacks.slice(startIndex, endIndex);

      return {
        feedbacks: paginatedFeedbacks,
        pagination: {
          page,
          limit,
          total: feedbacks.length,
          totalPages: Math.ceil(feedbacks.length / limit)
        }
      };
    } catch (error) {
      logger.error('獲取用戶反饋錯誤:', error);
      throw new Error('獲取反饋列表失敗');
    }
  }

  // 獲取反饋詳情
  async getFeedbackDetail(feedbackId, userId) {
    try {
      const feedback = this.feedbacks.get(feedbackId);
      if (!feedback || feedback.userId !== userId) {
        throw new Error('反饋不存在或無權限');
      }

      // 獲取回覆
      const replies = Array.from(this.replies.values())
        .filter(r => r.feedbackId === feedbackId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return {
        ...feedback,
        replies
      };
    } catch (error) {
      logger.error('獲取反饋詳情錯誤:', error);
      throw error;
    }
  }

  // 更新反饋
  async updateFeedback(feedbackId, userId, updates) {
    try {
      const feedback = this.feedbacks.get(feedbackId);
      if (!feedback || feedback.userId !== userId) {
        throw new Error('反饋不存在或無權限');
      }

      // 只允許更新特定字段
      const allowedUpdates = ['title', 'description', 'rating', 'status'];
      const updatedFeedback = { ...feedback };

      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          updatedFeedback[key] = value;
        }
      }

      updatedFeedback.updatedAt = new Date();
      updatedFeedback.priority = this.calculatePriority(updatedFeedback.type, updatedFeedback.rating);

      this.feedbacks.set(feedbackId, updatedFeedback);
      
      logger.info(`反饋已更新: ${feedbackId}`);
      return updatedFeedback;
    } catch (error) {
      logger.error('更新反饋錯誤:', error);
      throw error;
    }
  }

  // 刪除反饋
  async deleteFeedback(feedbackId, userId) {
    try {
      const feedback = this.feedbacks.get(feedbackId);
      if (!feedback || feedback.userId !== userId) {
        throw new Error('反饋不存在或無權限');
      }

      this.feedbacks.delete(feedbackId);
      
      // 刪除相關回覆
      for (const [replyId, reply] of this.replies.entries()) {
        if (reply.feedbackId === feedbackId) {
          this.replies.delete(replyId);
        }
      }
      
      logger.info(`反饋已刪除: ${feedbackId}`);
      return { success: true };
    } catch (error) {
      logger.error('刪除反饋錯誤:', error);
      throw error;
    }
  }

  // 添加反饋回覆
  async addFeedbackReply(feedbackId, userId, { message, isInternal = false }) {
    try {
      const feedback = this.feedbacks.get(feedbackId);
      if (!feedback) {
        throw new Error('反饋不存在');
      }

      const replyId = uuidv4();
      const reply = {
        id: replyId,
        feedbackId,
        userId,
        message,
        isInternal,
        createdAt: new Date()
      };

      this.replies.set(replyId, reply);
      
      // 更新反饋狀態
      if (!isInternal) {
        feedback.status = 'replied';
        feedback.updatedAt = new Date();
        this.feedbacks.set(feedbackId, feedback);
      }
      
      logger.info(`反饋回覆已添加: ${replyId}`);
      return reply;
    } catch (error) {
      logger.error('添加反饋回覆錯誤:', error);
      throw new Error('添加反饋回覆失敗');
    }
  }

  // 獲取反饋統計
  async getFeedbackStats(userId) {
    try {
      const feedbacks = Array.from(this.feedbacks.values())
        .filter(f => f.userId === userId);

      const stats = {
        total: feedbacks.length,
        byStatus: {
          pending: feedbacks.filter(f => f.status === 'pending').length,
          inProgress: feedbacks.filter(f => f.status === 'in_progress').length,
          replied: feedbacks.filter(f => f.status === 'replied').length,
          resolved: feedbacks.filter(f => f.status === 'resolved').length,
          closed: feedbacks.filter(f => f.status === 'closed').length
        },
        byType: {},
        byCategory: {},
        byPriority: {
          high: feedbacks.filter(f => f.priority === 'high').length,
          medium: feedbacks.filter(f => f.priority === 'medium').length,
          low: feedbacks.filter(f => f.priority === 'low').length
        },
        averageRating: this.calculateAverageRating(feedbacks),
        recentActivity: feedbacks
          .filter(f => new Date(f.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .length
      };

      // 按類型和分類統計
      feedbacks.forEach(f => {
        stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
        stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('獲取反饋統計錯誤:', error);
      throw new Error('獲取反饋統計失敗');
    }
  }

  // 獲取反饋分類統計
  async getFeedbackCategoryStats(userId) {
    try {
      const feedbacks = Array.from(this.feedbacks.values())
        .filter(f => f.userId === userId);

      const categoryStats = {};
      
      feedbacks.forEach(f => {
        if (!categoryStats[f.category]) {
          categoryStats[f.category] = {
            total: 0,
            byStatus: {},
            averageRating: 0,
            ratings: []
          };
        }
        
        categoryStats[f.category].total++;
        
        // 按狀態統計
        categoryStats[f.category].byStatus[f.status] = 
          (categoryStats[f.category].byStatus[f.status] || 0) + 1;
        
        // 收集評分
        if (f.rating) {
          categoryStats[f.category].ratings.push(f.rating);
        }
      });

      // 計算平均評分
      Object.keys(categoryStats).forEach(category => {
        const ratings = categoryStats[category].ratings;
        if (ratings.length > 0) {
          categoryStats[category].averageRating = 
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        }
        delete categoryStats[category].ratings;
      });

      return categoryStats;
    } catch (error) {
      logger.error('獲取反饋分類統計錯誤:', error);
      throw new Error('獲取反饋分類統計失敗');
    }
  }

  // 獲取反饋評分趨勢
  async getFeedbackRatingTrend(userId, period = '30d') {
    try {
      const feedbacks = Array.from(this.feedbacks.values())
        .filter(f => f.userId === userId && f.rating);

      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const recentFeedbacks = feedbacks.filter(f => new Date(f.createdAt) >= cutoffDate);
      
      // 按日期分組
      const dailyRatings = {};
      recentFeedbacks.forEach(f => {
        const date = f.createdAt.toISOString().split('T')[0];
        if (!dailyRatings[date]) {
          dailyRatings[date] = [];
        }
        dailyRatings[date].push(f.rating);
      });

      // 計算每日平均評分
      const trend = Object.keys(dailyRatings).map(date => ({
        date,
        averageRating: dailyRatings[date].reduce((sum, rating) => sum + rating, 0) / dailyRatings[date].length,
        count: dailyRatings[date].length
      }));

      return trend.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      logger.error('獲取反饋評分趨勢錯誤:', error);
      throw new Error('獲取反饋評分趨勢失敗');
    }
  }

  // 批量操作反饋
  async batchAction(feedbackIds, action, data, userId) {
    try {
      const results = [];
      
      for (const feedbackId of feedbackIds) {
        try {
          let result;
          switch (action) {
            case 'delete':
              result = await this.deleteFeedback(feedbackId, userId);
              break;
            case 'update_status':
              result = await this.updateFeedback(feedbackId, userId, { status: data.status });
              break;
            case 'add_reply':
              result = await this.addFeedbackReply(feedbackId, userId, { message: data.message, isInternal: data.isInternal });
              break;
            default:
              throw new Error(`不支持的操作: ${action}`);
          }
          results.push({ success: true, feedbackId, result });
        } catch (error) {
          results.push({ success: false, feedbackId, error: error.message });
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: feedbackIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      logger.error('批量操作反饋錯誤:', error);
      throw new Error('批量操作反饋失敗');
    }
  }

  // 導出反饋數據
  async exportFeedbackData(userId, options = {}) {
    try {
      const { format = 'json', startDate, endDate, type, category } = options;
      
      let feedbacks = Array.from(this.feedbacks.values())
        .filter(f => f.userId === userId);

      // 篩選條件
      if (startDate) {
        feedbacks = feedbacks.filter(f => new Date(f.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        feedbacks = feedbacks.filter(f => new Date(f.createdAt) <= new Date(endDate));
      }
      if (type) {
        feedbacks = feedbacks.filter(f => f.type === type);
      }
      if (category) {
        feedbacks = feedbacks.filter(f => f.category === category);
      }

      // 添加回覆信息
      const feedbacksWithReplies = feedbacks.map(f => {
        const replies = Array.from(this.replies.values())
          .filter(r => r.feedbackId === f.id);
        return { ...f, replies };
      });

      if (format === 'csv') {
        return this.convertToCSV(feedbacksWithReplies);
      }

      return {
        format,
        total: feedbacksWithReplies.length,
        data: feedbacksWithReplies,
        exportedAt: new Date()
      };
    } catch (error) {
      logger.error('導出反饋數據錯誤:', error);
      throw new Error('導出反饋數據失敗');
    }
  }

  // 計算優先級
  calculatePriority(type, rating) {
    if (type === 'bug' || type === 'security') {
      return 'high';
    }
    if (rating && rating <= 2) {
      return 'high';
    }
    if (type === 'feature_request') {
      return 'medium';
    }
    return 'low';
  }

  // 計算平均評分
  calculateAverageRating(feedbacks) {
    const ratedFeedbacks = feedbacks.filter(f => f.rating);
    if (ratedFeedbacks.length === 0) {
      return 0;
    }
    
    const totalRating = ratedFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / ratedFeedbacks.length;
  }

  // 轉換為CSV格式
  convertToCSV(feedbacks) {
    const headers = ['ID', '類型', '標題', '描述', '評分', '分類', '狀態', '優先級', '創建時間', '更新時間'];
    const rows = feedbacks.map(f => [
      f.id,
      f.type,
      f.title,
      f.description,
      f.rating || '',
      f.category,
      f.status,
      f.priority,
      f.createdAt.toISOString(),
      f.updatedAt.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return {
      format: 'csv',
      content: csvContent,
      filename: `feedback_export_${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  // 獲取反饋模板
  getFeedbackTemplates() {
    return {
      bug: {
        title: 'Bug報告',
        description: '請詳細描述您遇到的問題...',
        type: 'bug',
        category: 'technical'
      },
      feature: {
        title: '功能建議',
        description: '請描述您希望添加的功能...',
        type: 'feature_request',
        category: 'enhancement'
      },
      general: {
        title: '一般反饋',
        description: '請分享您的想法和建議...',
        type: 'general',
        category: 'feedback'
      }
    };
  }
}

module.exports = new FeedbackService();
