/**
 * 終極優化管理器
 * 整合所有高級優化功能的中央控制系統
 */

import codeSplitter from '../utils/codeSplitter';
// import from "../workers/aiWorkerManager" - 路徑不存在
// import from "../cache/advancedCacheManager" - 路徑不存在
import performanceMonitor from '../monitoring/performanceMonitor';
// import from "../ai/modelOptimizer" - 路徑不存在
// import from "../utils/memoryOptimizer" - 路徑不存在

class UltimateOptimizationManager {
  constructor() {
    this.systems = {
      codeSplitter,
      performanceMonitor,
    };
    this.optimizationLevel = 'auto'; // auto, basic, aggressive, enterprise
    this.isInitialized = false;
    this.stats = {};
    this.healthChecks = new Map();
    this.config = {
      autoOptimization: true,
      performanceThresholds: {
        memoryUsage: 200, // MB
        responseTime: 2000, // ms
        errorRate: 0.05, // 5%
        cacheHitRate: 0.8, // 80%
      },
      optimizationSchedule: {
        memory: 5 * 60 * 1000, // 5分鐘
        cache: 10 * 60 * 1000, // 10分鐘
        performance: 15 * 60 * 1000, // 15分鐘
      },
    };
  }

  /**
   * 初始化終極優化系統
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      return;
    }
    const {
      level = 'auto',
      features = 'all',
      monitoring = true,
    } = options;
    try {
      console.info('🚀 啟動終極優化系統...');
      // 設置優化級別
      this.optimizationLevel = level;
      // 初始化各個系統
      await this.initializeSystems(features);
      // 啟動性能監控
      if (monitoring) {
        this.startPerformanceMonitoring();
      }
      // 啟動自動優化
      if (this.config.autoOptimization) {
        this.startAutoOptimization();
      }
      // 啟動健康檢查
      this.startHealthChecks();
      this.isInitialized = true;
      console.info('✅ 終極優化系統啟動完成');
      if (__DEV__) {
        this.logSystemStatus();
      }
    } catch (error) {
      console.error('❌ 終極優化系統初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化各個子系統
   */
  async initializeSystems(features) {
    const featuresToInit = features === 'all'
      ? Object.keys(this.systems)
      : Array.isArray(features) ? features : [features];
    for (const feature of featuresToInit) {
      try {
        if (this.systems[feature] && this.systems[feature].initialize) {
          await this.systems[feature].initialize();
          console.info(`✅ ${feature} 系統初始化完成`);
        }
      } catch (error) {
        console.warn(`⚠️ ${feature} 系統初始化失敗:`, error);
      }
    }
  }

  /**
   * 智能性能優化
   */
  async optimizePerformance(target = 'auto') {
    console.info(`🎯 開始智能性能優化: ${target}`);
    const optimizations = [];
    try {
      switch (target) {
        case 'memory':
          optimizations.push(await this.optimizeMemory());
          break;
        case 'cache':
          optimizations.push(await this.optimizeCache());
          break;
        case 'network':
          optimizations.push(await this.optimizeNetwork());
          break;
        case 'ai':
          optimizations.push(await this.optimizeAI());
          break;
        case 'auto':
        default:
        // 根據當前性能指標自動選擇優化策略
          const metrics = await this.getCurrentMetrics();
          optimizations.push(...await this.autoOptimize(metrics));
          break;
      }
      const results = await Promise.allSettled(optimizations);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.info(`✅ 性能優化完成: ${successful}/${results.length} 項優化成功`);
      return {
        total: results.length,
        successful,
        failed: results.length - successful,
        details: results,
      };
    } catch (error) {
      console.error('❌ 性能優化失敗:', error);
      throw error;
    }
  }

  /**
   * 記憶體優化
   */
  async optimizeMemory() {
    console.info('🧠 執行記憶體優化...');
    const actions = [];
    // 清理記憶體優化器快取
    if (this.systems.memoryOptimizer.clearUnusedCache) {
      actions.push(this.systems.memoryOptimizer.clearUnusedCache());
    }
    // 清理代碼分割器快取
    if (this.systems.codeSplitter.cleanupCache) {
      actions.push(this.systems.codeSplitter.cleanupCache());
    }
    // 清理高級快取管理器
    const cacheStats = this.systems.advancedCacheManager.getStats();
    if (parseFloat(cacheStats.hitRate) < 60) { // 命中率低於60%
      actions.push(this.systems.advancedCacheManager.performCleanup());
    }
    // 強制垃圾回收 (如果可用)
    if (global.gc && __DEV__) {
      actions.push(Promise.resolve(global.gc()));
    }
    await Promise.all(actions);
    return { type: 'memory', actions: actions.length };
  }

  /**
   * 快取優化
   */
  async optimizeCache() {
    console.info('🗄️ 執行快取優化...');
    const cacheManager = this.systems.advancedCacheManager;
    // 執行預測性預載入
    if (cacheManager.predictivePreload) {
      await cacheManager.predictivePreload();
    }
    // 優化快取策略
    const stats = cacheManager.getStats();
    const hitRate = parseFloat(stats.hitRate);
    if (hitRate < 70) {
      // 快取命中率低，增加預載入
      console.info('📈 快取命中率低，增加預載入策略');
    }
    return { type: 'cache', hitRate, optimized: true };
  }

  /**
   * 網路優化
   */
  async optimizeNetwork() {
    console.info('🌐 執行網路優化...');
    // 檢查網路性能指標
    const performanceReport = this.systems.performanceMonitor.generateReport();
    const apiStats = performanceReport.details.api;
    const optimizations = [];
    // API 響應時間優化
    if (apiStats.averageResponseTime > 1500) {
      optimizations.push('增加 API 快取策略');
    }
    // API 成功率優化
    if (parseFloat(apiStats.successRate) < 95) {
      optimizations.push('實施 API 重試機制');
    }
    return { type: 'network', optimizations, apiStats };
  }

  /**
   * AI 優化
   */
  async optimizeAI() {
    console.info('🤖 執行 AI 優化...');
    const modelOptimizer = this.systems.modelOptimizer;
    const systemStats = modelOptimizer.getSystemStats();
    const optimizations = [];
    // 模型預熱
    for (const modelStat of systemStats.modelStats) {
      if (modelStat && modelStat.averageInferenceTime > 1000) {
        optimizations.push(`優化模型 ${modelStat.name} 推理性能`);
      }
    }
    // AI Worker 優化
    const aiWorkerStats = this.systems.aiWorkerManager.getStats();
    if (aiWorkerStats.queueLength > 5) {
      optimizations.push('增加 AI Worker 並發數');
    }
    return { type: 'ai', optimizations, modelCount: systemStats.modelsLoaded };
  }

  /**
   * 自動優化策略
   */
  async autoOptimize(metrics) {
    const optimizations = [];
    const thresholds = this.config.performanceThresholds;
    // 基於指標的智能優化決策
    if (metrics.memoryUsage > thresholds.memoryUsage) {
      optimizations.push(this.optimizeMemory());
    }
    if (metrics.responseTime > thresholds.responseTime) {
      optimizations.push(this.optimizeCache());
      optimizations.push(this.optimizeNetwork());
    }
    if (metrics.errorRate > thresholds.errorRate) {
      optimizations.push(this.optimizeNetwork());
    }
    if (metrics.cacheHitRate < thresholds.cacheHitRate) {
      optimizations.push(this.optimizeCache());
    }
    return optimizations;
  }

  /**
   * 獲取當前性能指標
   */
  async getCurrentMetrics() {
    const report = this.systems.performanceMonitor.generateReport();
    const cacheStats = this.systems.advancedCacheManager.getStats();
    return {
      memoryUsage: report.summary.avgMemoryUsage,
      responseTime: report.summary.apiSuccessRate,
      errorRate: report.details.errors.last24h / 24 / 100, // 轉換為比率
      cacheHitRate: parseFloat(cacheStats.hitRate) / 100,
      timestamp: Date.now(),
    };
  }

  /**
   * 開始性能監控
   */
  startPerformanceMonitoring() {
    console.info('📊 啟動性能監控...');
    setInterval(async () => {
      try {
        const metrics = await this.getCurrentMetrics();
        this.stats = { ...this.stats, latest: metrics };
        // 自動優化觸發
        if (this.shouldTriggerAutoOptimization(metrics)) {
          await this.optimizePerformance('auto');
        }
      } catch (error) {
        console.error('❌ 性能監控錯誤:', error);
      }
    }, 30000); // 每30秒檢查
  }

  /**
   * 開始自動優化
   */
  startAutoOptimization() {
    console.info('🤖 啟動自動優化...');
    // 記憶體優化排程
    setInterval(() => {
      this.optimizeMemory().catch(console.error);
    }, this.config.optimizationSchedule.memory);
    // 快取優化排程
    setInterval(() => {
      this.optimizeCache().catch(console.error);
    }, this.config.optimizationSchedule.cache);
    // 性能優化排程
    setInterval(() => {
      this.optimizePerformance('auto').catch(console.error);
    }, this.config.optimizationSchedule.performance);
  }

  /**
   * 開始健康檢查
   */
  startHealthChecks() {
    console.info('🏥 啟動系統健康檢查...');
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // 每分鐘檢查
  }

  /**
   * 執行健康檢查
   */
  async performHealthCheck() {
    const checks = [];
    // 檢查各個子系統
    for (const [name, system] of Object.entries(this.systems)) {
      try {
        const isHealthy = await this.checkSystemHealth(name, system);
        this.healthChecks.set(name, {
          healthy: isHealthy,
          lastCheck: Date.now(),
          status: isHealthy ? 'ok' : 'warning',
        });
      } catch (error) {
        this.healthChecks.set(name, {
          healthy: false,
          lastCheck: Date.now(),
          status: 'error',
          error: error.message,
        });
      }
    }
    // 記錄不健康的系統
    const unhealthy = Array.from(this.healthChecks.entries())
      .filter(([name, check]) => !check.healthy);
    if (unhealthy.length > 0 && __DEV__) {
      console.warn('⚠️ 不健康的系統:', unhealthy.map(([name]) => name));
    }
  }

  /**
   * 檢查子系統健康狀態
   */
  async checkSystemHealth(name, system) {
    switch (name) {
      case 'advancedCacheManager':
        const cacheStats = system.getStats();
        return parseFloat(cacheStats.hitRate) > 30; // 命中率 > 30%
      case 'performanceMonitor':
        const report = system.generateReport();
        return report.summary.totalErrors < 10; // 錯誤數 < 10
      case 'modelOptimizer':
        const modelStats = system.getSystemStats();
        return modelStats.modelsLoaded >= 0; // 基本檢查
      case 'aiWorkerManager':
        const workerStats = system.getStats();
        return !workerStats.fallbackMode; // 不在降級模式
      default:
        return true; // 默認健康
    }
  }

  /**
   * 判斷是否應該觸發自動優化
   */
  shouldTriggerAutoOptimization(metrics) {
    const thresholds = this.config.performanceThresholds;
    return (
      metrics.memoryUsage > thresholds.memoryUsage ||
      metrics.responseTime > thresholds.responseTime ||
      metrics.errorRate > thresholds.errorRate ||
      metrics.cacheHitRate < thresholds.cacheHitRate
    );
  }

  /**
   * 獲取系統總覽
   */
  getSystemOverview() {
    return {
      initialized: this.isInitialized,
      optimizationLevel: this.optimizationLevel,
      healthStatus: Object.fromEntries(this.healthChecks),
      performanceStats: this.stats,
      systemStatus: {
        cache: this.systems.advancedCacheManager.getStats(),
        performance: this.systems.performanceMonitor.generateReport().summary,
        ai: this.systems.modelOptimizer.getSystemStats(),
        workers: this.systems.aiWorkerManager.getStats(),
      },
    };
  }

  /**
   * 記錄系統狀態
   */
  logSystemStatus() {
    const overview = this.getSystemOverview();
    console.group('🚀 終極優化系統狀態');
    console.info('📊 優化級別:', overview.optimizationLevel);
    console.info('🏥 健康狀態:', overview.healthStatus);
    console.info('⚡ 性能統計:', overview.performanceStats);
    console.info('🔧 子系統狀態:', overview.systemStatus);
    console.groupEnd();
  }

  /**
   * 清理系統
   */
  async cleanup() {
    console.info('🧹 清理終極優化系統...');
    for (const [name, system] of Object.entries(this.systems)) {
      try {
        if (system.cleanup) {
          await system.cleanup();
        } else if (system.destroy) {
          await system.destroy();
        }
      } catch (error) {
        console.warn(`⚠️ 清理 ${name} 失敗:`, error);
      }
    }
    this.healthChecks.clear();
    this.stats = {};
    this.isInitialized = false;
    console.info('✅ 終極優化系統清理完成');
  }
}

// 創建單例
const ultimateOptimizationManager = new UltimateOptimizationManager();

// React Hook 輔助函數（需要在 React 組件中使用）
export const createUltimateOptimizationHook = () => {
  return {
    getSystemOverview: () => ultimateOptimizationManager.getSystemOverview(),
    optimizePerformance: (target = 'auto') => ultimateOptimizationManager.optimizePerformance(target),
    isReady: () => ultimateOptimizationManager.isInitialized,
    initialize: () => ultimateOptimizationManager.initialize(),
    cleanup: () => ultimateOptimizationManager.cleanup(),
  };
};

export default ultimateOptimizationManager;
