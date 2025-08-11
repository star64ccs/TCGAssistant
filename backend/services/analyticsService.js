const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class AnalyticsService {
  constructor() {
    this.events = new Map();
    this.userStats = new Map();
    this.performanceMetrics = new Map();
    this.errorLogs = new Map();
    this.analyticsPreferences = new Map();
  }

  // 記錄用戶行為
  async trackEvent(userId, { event, category, action, label, value, properties }) {
    try {
      const eventId = uuidv4();
      const eventData = {
        id: eventId,
        userId,
        event,
        category: category || 'general',
        action: action || '',
        label: label || '',
        value: value || null,
        properties: properties || {
        },
        timestamp: new Date(),
        sessionId: this.generateSessionId(userId),
      };

      this.events.set(eventId, eventData);

      // 更新用戶統計
      await this.updateUserStats(userId, eventData);

      logger.info(`事件已記錄: ${ event } 用戶 ${ userId }`);
      return eventData;
    } catch (error) {
      logger.error('記錄用戶行為錯誤:', error);
      throw new Error('記錄用戶行為失敗');
    }
  }

  // 獲取用戶使用統計
  getUsageStats(userId, options = {}) {
    try {
      const { period = '30d', feature, groupBy = 'day',
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const stats = {
        totalEvents: recentEvents.length,
        uniqueSessions: new Set(recentEvents.map(e => e.sessionId)).size,
        byFeature: {
        },
        byCategory: {},
        byDay: {},
        topActions: this.getTopActions(recentEvents),
        averageEventsPerSession: this.calculateAverageEventsPerSession(recentEvents),
      };

      // 按功能統計
      recentEvents.forEach(event => {
        const featureKey = event.category;
        stats.byFeature[featureKey] = (stats.byFeature[featureKey] || 0) + 1;

        const categoryKey = event.category;
        stats.byCategory[categoryKey] = (stats.byCategory[categoryKey] || 0) + 1;

        const dayKey = event.timestamp.toISOString().split('T')[0];
        stats.byDay[dayKey] = (stats.byDay[dayKey] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('獲取使用統計錯誤:', error);
      throw new Error('獲取使用統計失敗');
    }
  }

  // 獲取功能使用趨勢
  getUsageTrends(userId, options = {}) {
    try {
      const { period = '30d', feature, interval = 'day',
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const trends = this.groupEventsByInterval(recentEvents, interval);

      return trends;
    } catch (error) {
      logger.error('獲取使用趨勢錯誤:', error);
      throw new Error('獲取使用趨勢失敗');
    }
  }

  // 獲取性能指標
  getPerformanceMetrics(userId, options = {}) {
    try {
      const { period = '7d', metric, endpoint,
      } = options;

      const metrics = Array.from(this.performanceMetrics.values())
        .filter(m => m.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentMetrics = metrics.filter(m => new Date(m.timestamp) >= cutoffDate);

      const performanceStats = {
        averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
        errorRate: this.calculateErrorRate(recentMetrics),
        throughput: this.calculateThroughput(recentMetrics),
        byEndpoint: this.groupMetricsByEndpoint(recentMetrics),
        byMetric: this.groupMetricsByType(recentMetrics),
      };

      return performanceStats;
    } catch (error) {
      logger.error('獲取性能指標錯誤:', error);
      throw new Error('獲取性能指標失敗');
    }
  }

  // 獲取錯誤統計
  getErrorStats(userId, options = {}) {
    try {
      const { period = '7d', severity, type,
      } = options;

      const errors = Array.from(this.errorLogs.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentErrors = errors.filter(e => new Date(e.timestamp) >= cutoffDate);

      const errorStats = {
        totalErrors: recentErrors.length,
        bySeverity: this.groupErrorsBySeverity(recentErrors),
        byType: this.groupErrorsByType(recentErrors),
        byEndpoint: this.groupErrorsByEndpoint(recentErrors),
        errorRate: this.calculateErrorRate(recentErrors),
        topErrors: this.getTopErrors(recentErrors),
      };

      return errorStats;
    } catch (error) {
      logger.error('獲取錯誤統計錯誤:', error);
      throw new Error('獲取錯誤統計失敗');
    }
  }

  // 獲取用戶行為分析
  getUserBehavior(userId, options = {}) {
    try {
      const { period = '30d', action, page,
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const behavior = {
        sessionPatterns: this.analyzeSessionPatterns(recentEvents),
        featureUsage: this.analyzeFeatureUsage(recentEvents),
        userJourney: this.analyzeUserJourney(recentEvents),
        engagementMetrics: this.calculateEngagementMetrics(recentEvents),
        retentionData: this.calculateRetentionData(recentEvents),
      };

      return behavior;
    } catch (error) {
      logger.error('獲取用戶行為分析錯誤:', error);
      throw new Error('獲取用戶行為分析失敗');
    }
  }

  // 獲取轉換漏斗
  getConversionFunnel(userId, options = {}) {
    try {
      const { steps, period = '30d', groupBy = 'day',
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const funnel = this.calculateFunnel(recentEvents, steps);

      return funnel;
    } catch (error) {
      logger.error('獲取轉換漏斗錯誤:', error);
      throw new Error('獲取轉換漏斗失敗');
    }
  }

  // 獲取留存分析
  getRetentionAnalysis(userId, options = {}) {
    try {
      const { period = '30d', cohort = 'week', interval = 'day',
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const retention = this.calculateRetention(recentEvents, cohort, interval);

      return retention;
    } catch (error) {
      logger.error('獲取留存分析錯誤:', error);
      throw new Error('獲取留存分析失敗');
    }
  }

  // 獲取熱門功能排行
  getPopularFeatures(userId, options = {}) {
    try {
      const { period = '7d', limit = 10, category,
      } = options;

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId);

      const cutoffDate = this.getCutoffDate(period);
      const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

      const popularFeatures = this.getTopFeatures(recentEvents, limit, category);

      return popularFeatures;
    } catch (error) {
      logger.error('獲取熱門功能排行錯誤:', error);
      throw new Error('獲取熱門功能排行失敗');
    }
  }

  // 獲取系統健康狀態
  getSystemHealth() {
    try {
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      const recentEvents = Array.from(this.events.values())
        .filter(e => new Date(e.timestamp) >= lastHour);

      const recentErrors = Array.from(this.errorLogs.values())
        .filter(e => new Date(e.timestamp) >= lastHour);

      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        activeUsers: new Set(recentEvents.map(e => e.userId)).size,
        eventsPerMinute: recentEvents.length / 60,
        errorRate: recentErrors.length / Math.max(recentEvents.length, 1),
        responseTime: this.calculateAverageResponseTime(recentEvents),
        lastUpdated: now,
      };

      // 設置健康狀態
      if (health.errorRate > 0.1) {
        health.status = 'warning';
      }
      if (health.errorRate > 0.2) {
        health.status = 'critical';
      }

      return health;
    } catch (error) {
      logger.error('獲取系統健康狀態錯誤:', error);
      throw new Error('獲取系統健康狀態失敗');
    }
  }

  // 獲取實時監控數據
  getRealtimeMetrics(userId, options = {}) {
    try {
      const { metric, duration = '1h',
      } = options;

      const cutoffTime = new Date(Date.now() - this.parseDuration(duration));

      const events = Array.from(this.events.values())
        .filter(e => e.userId === userId && new Date(e.timestamp) >= cutoffTime);

      const realtimeData = {
        activeUsers: new Set(events.map(e => e.userId)).size,
        eventsPerMinute: this.calculateEventsPerMinute(events),
        topEvents: this.getTopEvents(events, 5),
        recentActivity: events.slice(-10).reverse(),
        timestamp: new Date(),
      };

      return realtimeData;
    } catch (error) {
      logger.error('獲取實時監控數據錯誤:', error);
      throw new Error('獲取實時監控數據失敗');
    }
  }

  // 導出分析報告
  async exportAnalyticsReport(userId, options = {}) {
    try {
      const { type, period, format = 'json', filters,
      } = options;

      let reportData;

      switch (type) {
        case 'usage':
          reportData = await this.getUsageStats(userId, { period,
          });
          break;
        case 'performance':
          reportData = await this.getPerformanceMetrics(userId, { period });
          break;
        case 'behavior':
          reportData = await this.getUserBehavior(userId, { period });
          break;
        case 'errors':
          reportData = await this.getErrorStats(userId, { period });
          break;
        default:
          throw new Error(`不支持的分析類型: ${ type }`);
      }

      if (format === 'csv') {
        return this.convertToCSV(reportData, type);
      }

      return {
        type,
        period,
        format,
        data: reportData,
        exportedAt: new Date(),
        userId,
      };
    } catch (error) {
      logger.error('導出分析報告錯誤:', error);
      throw new Error('導出分析報告失敗');
    }
  }

  // 更新分析偏好
  async updateAnalyticsPreferences(userId, preferences) {
    try {
      const currentPreferences = await this.getAnalyticsPreferences(userId);
      const updatedPreferences = { ...currentPreferences, ...preferences, updatedAt: new Date(),
      };

      this.analyticsPreferences.set(userId, updatedPreferences);

      logger.info(`分析偏好已更新: ${ userId }`);
      return updatedPreferences;
    } catch (error) {
      logger.error('更新分析偏好錯誤:', error);
      throw new Error('更新分析偏好失敗');
    }
  }

  // 獲取分析偏好
  getAnalyticsPreferences(userId) {
    try {
      const preferences = this.analyticsPreferences.get(userId);
      if (!preferences) {
        // 返回默認偏好
        const defaultPreferences = {
          trackingEnabled: true,
          dataRetention: 90,
          exportFormat: 'json',
          privacyLevel: 'standard',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.analyticsPreferences.set(userId, defaultPreferences);
        return defaultPreferences;
      }

      return preferences;
    } catch (error) {
      logger.error('獲取分析偏好錯誤:', error);
      throw new Error('獲取分析偏好失敗');
    }
  }

  // 輔助方法
  generateSessionId(userId) {
    return `${userId }_${ Date.now() }`;
  }

  updateUserStats(userId, eventData) {
    const userStats = this.userStats.get(userId) || {
      totalEvents: 0,
      lastActivity: null,
      sessions: new Set(),
      features: new Map(),
    };

    userStats.totalEvents++;
    userStats.lastActivity = eventData.timestamp;
    userStats.sessions.add(eventData.sessionId);

    const featureCount = userStats.features.get(eventData.category) || 0;
    userStats.features.set(eventData.category, featureCount + 1);

    this.userStats.set(userId, userStats);
  }

  getCutoffDate(period) {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  getTopActions(events) {
    const actionCounts = { };
    events.forEach(event => {
      const key = `${event.category }:${ event.action }`;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  calculateAverageEventsPerSession(events) {
    const sessions = new Set(events.map(e => e.sessionId));
    return events.length / sessions.size;
  }

  groupEventsByInterval(events, interval) {
    const groups = { };
    events.forEach(event => {
      const date = new Date(event.timestamp);
      let key;

      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  calculateAverageResponseTime(metrics) {
    if (metrics.length === 0) {
      return 0;
    }
    const totalTime = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0);
    return totalTime / metrics.length;
  }

  calculateErrorRate(metrics) {
    if (metrics.length === 0) {
      return 0;
    }
    const errors = metrics.filter(m => m.error);
    return errors.length / metrics.length;
  }

  calculateThroughput(metrics) {
    if (metrics.length === 0) {
      return 0;
    }
    const timeSpan = Math.max(1, (Date.now() - Math.min(...metrics.map(m => new Date(m.timestamp)))) / 1000);
    return metrics.length / timeSpan;
  }

  groupMetricsByEndpoint(metrics) {
    const groups = { };
    metrics.forEach(m => {
      const endpoint = m.endpoint || 'unknown';
      if (!groups[endpoint]) {
        groups[endpoint] = { count: 0, totalTime: 0, errors: 0,
        };
      }
      groups[endpoint].count++;
      groups[endpoint].totalTime += m.responseTime || 0;
      if (m.error) {
        groups[endpoint].errors++;
      }
    });

    Object.keys(groups).forEach(endpoint => {
      groups[endpoint].averageTime = groups[endpoint].totalTime / groups[endpoint].count;
      groups[endpoint].errorRate = groups[endpoint].errors / groups[endpoint].count;
    });

    return groups;
  }

  groupMetricsByType(metrics) {
    const groups = { };
    metrics.forEach(m => {
      const type = m.metric || 'unknown';
      groups[type] = (groups[type] || 0) + 1;
    });
    return groups;
  }

  groupErrorsBySeverity(errors) {
    const groups = { };
    errors.forEach(e => {
      const severity = e.severity || 'unknown';
      groups[severity] = (groups[severity] || 0) + 1;
    });
    return groups;
  }

  groupErrorsByType(errors) {
    const groups = { };
    errors.forEach(e => {
      const type = e.type || 'unknown';
      groups[type] = (groups[type] || 0) + 1;
    });
    return groups;
  }

  groupErrorsByEndpoint(errors) {
    const groups = { };
    errors.forEach(e => {
      const endpoint = e.endpoint || 'unknown';
      groups[endpoint] = (groups[endpoint] || 0) + 1;
    });
    return groups;
  }

  getTopErrors(errors) {
    const errorCounts = { };
    errors.forEach(e => {
      const key = e.message || e.type || 'unknown';
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  analyzeSessionPatterns(events) {
    const sessions = { };
    events.forEach(e => {
      if (!sessions[e.sessionId]) {
        sessions[e.sessionId] = [];
      }
      sessions[e.sessionId].push(e);
    });

    const patterns = {
      averageSessionLength: 0,
      commonPaths: [],
      sessionDurations: [],
    };

    Object.values(sessions).forEach(sessionEvents => {
      patterns.sessionDurations.push(sessionEvents.length);
    });

    patterns.averageSessionLength = patterns.sessionDurations.reduce((a, b) => a + b, 0) / patterns.sessionDurations.length;

    return patterns;
  }

  analyzeFeatureUsage(events) {
    const featureUsage = { };
    events.forEach(e => {
      const feature = e.category;
      if (!featureUsage[feature]) {
        featureUsage[feature] = { count: 0, users: new Set(),
        };
      }
      featureUsage[feature].count++;
      featureUsage[feature].users.add(e.userId);
    });

    Object.keys(featureUsage).forEach(feature => {
      featureUsage[feature].uniqueUsers = featureUsage[feature].users.size;
      delete featureUsage[feature].users;
    });

    return featureUsage;
  }

  analyzeUserJourney(events) {
    const journey = events
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(e => ({
        step: e.action,
        timestamp: e.timestamp,
        category: e.category,
      }));

    return journey;
  }

  calculateEngagementMetrics(events) {
    const sessions = new Set(events.map(e => e.sessionId));
    const uniqueFeatures = new Set(events.map(e => e.category));

    return {
      totalSessions: sessions.size,
      uniqueFeatures: uniqueFeatures.size,
      eventsPerSession: events.length / sessions.size,
      featureDiversity: uniqueFeatures.size / Math.max(events.length, 1),
    };
  }

  calculateRetentionData(events) {
  // 簡化的留存計算
    const sessions = new Set(events.map(e => e.sessionId));
    const firstSession = Math.min(...Array.from(sessions).map(s => new Date(s.split('_')[1])));
    const lastSession = Math.max(...Array.from(sessions).map(s => new Date(s.split('_')[1])));

    return {
      totalSessions: sessions.size,
      firstSession,
      lastSession,
      sessionSpan: lastSession - firstSession,
    };
  }

  calculateFunnel(events, steps) {
    const funnel = [];
    let previousCount = events.length;

    steps.forEach((step, index) => {
      const stepEvents = events.filter(e => e.action === step);
      const count = stepEvents.length;
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;

      funnel.push({
        step,
        count,
        conversionRate,
        dropOff: previousCount - count,
      });

      previousCount = count;
    });

    return funnel;
  }

  calculateRetention(events, cohort, interval) {
  // 簡化的留存計算
    const cohorts = {
    };
    events.forEach(e => {
      const date = new Date(e.timestamp);
      let cohortKey;

      switch (cohort) {
        case 'day':
          cohortKey = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          cohortKey = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          cohortKey = date.toISOString().slice(0, 7);
          break;
        default:
          cohortKey = date.toISOString().slice(0, 10);
      }

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = new Set();
      }
      cohorts[cohortKey].add(e.userId);
    });

    return Object.entries(cohorts).map(([cohort, users]) => ({
      cohort,
      users: users.size,
      retention: users.size, // 簡化計算
    }));
  }

  getTopFeatures(events, limit, category) {
    const featureCounts = { };
    events.forEach(e => {
      if (!category || e.category === category) {
        featureCounts[e.category] = (featureCounts[e.category] || 0) + 1;
      }
    });

    return Object.entries(featureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([feature, count]) => ({ feature, count }));
  }

  parseDuration(duration) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // 默認1小時
    }
  }

  calculateEventsPerMinute(events) {
    if (events.length === 0) {
      return 0;
    }
    const timeSpan = Math.max(1, (Date.now() - Math.min(...events.map(e => new Date(e.timestamp)))) / (1000 * 60));
    return events.length / timeSpan;
  }

  getTopEvents(events, limit) {
    const eventCounts = { };
    events.forEach(e => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([event, count]) => ({ event, count }));
  }

  convertToCSV(data, type) {
  // 簡化的CSV轉換
    const headers = Object.keys(data);
    const rows = [headers.join(',')];

    if (Array.isArray(data)) {
      data.forEach(row => {
        rows.push(Object.values(row).join(','));
      });
    } else {
      rows.push(Object.values(data).join(','));
    }

    return {
      format: 'csv',
      content: rows.join('\n'),
      filename: `analytics_${type
      }_${ new Date().toISOString().split('T')[0] }.csv`,
    };
  }
}

module.exports = new AnalyticsService();
