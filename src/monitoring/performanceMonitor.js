/**
 * 企業級實時性能監控系統
 * 提供全面的性能指標追蹤、分析和報告
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {      app: {        startTime: Date.now(),        loadTime: 0,        crashes: 0,        errors: [],        memory: [],        cpu: [],        network: [],        userInteractions: [],      },      screens: new Map(),      api: new Map(),      renders: new Map(),      navigation: [],
    };    this.config = {      sampleRate: 1.0, // 採樣率      maxMetrics: 1000, // 最大指標數量      reportInterval: 30000, // 30秒報告間隔      errorThreshold: 5, // 錯誤閾值      memoryThreshold: 200, // 記憶體閾值 (MB)      responseTimeThreshold: 2000, // 響應時間閾值 (ms)
    };    this.collectors = new Map();
    this.alerts = [];
    this.isMonitoring = false;    this.initializeMonitoring();
  }

  /**
   * 初始化監控系統
   */
  initializeMonitoring() {
    if (!this.shouldMonitor()) {      return;
    }    try {      this.setupPerformanceObserver();      this.setupErrorHandling();      this.setupMemoryMonitoring();      this.setupNetworkMonitoring();      this.startReporting();      this.isMonitoring = true;      if (__DEV__) {        console.info('📊 性能監控系統已啟動');      }
    } catch (error) {      console.error('❌ 性能監控初始化失敗:', error);
    }
  }

  /**
   * 設置性能觀察器
   */
  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {      console.warn('⚠️ PerformanceObserver 不支援');      return;
    }    try {      // 導航性能      const navObserver = new PerformanceObserver((list) => {        for (const entry of list.getEntries()) {          this.recordNavigationMetric(entry);        }      });      navObserver.observe({ entryTypes: ['navigation'] });      // 資源性能      const resourceObserver = new PerformanceObserver((list) => {        for (const entry of list.getEntries()) {          this.recordResourceMetric(entry);        }      });      resourceObserver.observe({ entryTypes: ['resource'] });      // 測量性能      const measureObserver = new PerformanceObserver((list) => {        for (const entry of list.getEntries()) {          this.recordMeasureMetric(entry);        }      });      measureObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {      console.warn('⚠️ 性能觀察器設置失敗:', error);
    }
  }

  /**
   * 設置錯誤處理
   */
  setupErrorHandling() {
    // 全局錯誤處理
    const originalConsoleError = console.error;
    console.error = (...args) => {      this.recordError('console', args.join(' '));      originalConsoleError.apply(console, args);
    };    // Promise 錯誤處理
    if (typeof window !== 'undefined') {      window.addEventListener('unhandledrejection', (event) => {        this.recordError('promise', event.reason);      });      window.addEventListener('error', (event) => {        this.recordError('javascript', event.error);      });
    }
  }

  /**
   * 設置記憶體監控
   */
  setupMemoryMonitoring() {
    if (typeof performance !== 'undefined' && performance.memory) {      setInterval(() => {        const memory = {          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),          timestamp: Date.now(),        };        this.recordMemoryMetric(memory);        // 記憶體警告        if (memory.used > this.config.memoryThreshold) {          this.createAlert('memory', `記憶體使用過高: ${memory.used}MB`, 'warning');        }      }, 5000); // 每 5 秒檢查
    }
  }

  /**
   * 設置網路監控
   */
  setupNetworkMonitoring() {
    // 監控 fetch 請求
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {      const startTime = performance.now();      const url = args[0];      try {        const response = await originalFetch(...args);        const endTime = performance.now();        this.recordNetworkMetric({          url,          method: args[1]?.method || 'GET',          status: response.status,          duration: endTime - startTime,          success: response.ok,          timestamp: Date.now(),        });        return response;      } catch (error) {        const endTime = performance.now();        this.recordNetworkMetric({          url,          method: args[1]?.method || 'GET',          status: 0,          duration: endTime - startTime,          success: false,          error: error.message,          timestamp: Date.now(),        });        throw error;      }
    };
  }

  /**
   * 記錄屏幕性能
   */
  recordScreenMetric(screenName, action, duration) {
    if (!this.shouldMonitor()) {      return;
    }    const metric = {      screen: screenName,      action,      duration,      timestamp: Date.now(),
    };    if (!this.metrics.screens.has(screenName)) {      this.metrics.screens.set(screenName, []);
    }    const screenMetrics = this.metrics.screens.get(screenName);
    screenMetrics.push(metric);    // 保持最新的 100 個記錄
    if (screenMetrics.length > 100) {      screenMetrics.shift();
    }    // 性能警告
    if (duration > 3000) { // 3秒      this.createAlert('screen', `屏幕 ${screenName} ${action} 耗時過長: ${duration}ms`, 'warning');
    }    if (__DEV__) {      console.debug(`📱 屏幕性能: ${screenName} ${action} ${duration}ms`);
    }
  }

  /**
   * 記錄 API 性能
   */
  recordAPIMetric(endpoint, method, duration, success, statusCode) {
    if (!this.shouldMonitor()) {      return;
    }    const metric = {      endpoint,      method,      duration,      success,      statusCode,      timestamp: Date.now(),
    };    if (!this.metrics.api.has(endpoint)) {      this.metrics.api.set(endpoint, []);
    }    const apiMetrics = this.metrics.api.get(endpoint);
    apiMetrics.push(metric);    // 保持最新的 100 個記錄
    if (apiMetrics.length > 100) {      apiMetrics.shift();
    }    // API 性能警告
    if (duration > this.config.responseTimeThreshold) {      this.createAlert('api', `API ${endpoint} 響應過慢: ${duration}ms`, 'warning');
    }    if (!success) {      this.createAlert('api', `API ${endpoint} 失敗: ${statusCode}`, 'error');
    }    if (__DEV__) {      console.debug(`🌐 API 性能: ${method} ${endpoint} ${duration}ms ${success ? '✅' : '❌'}`);
    }
  }

  /**
   * 記錄渲染性能
   */
  recordRenderMetric(componentName, renderTime, props) {
    if (!this.shouldMonitor()) {      return;
    }    const metric = {      component: componentName,      renderTime,      propsCount: props ? Object.keys(props).length : 0,      timestamp: Date.now(),
    };    if (!this.metrics.renders.has(componentName)) {      this.metrics.renders.set(componentName, []);
    }    const renderMetrics = this.metrics.renders.get(componentName);
    renderMetrics.push(metric);    // 保持最新的 50 個記錄
    if (renderMetrics.length > 50) {      renderMetrics.shift();
    }    // 渲染性能警告
    if (renderTime > 16) { // 16ms (60fps)      this.createAlert('render', `組件 ${componentName} 渲染過慢: ${renderTime}ms`, 'warning');
    }    if (__DEV__) {      console.debug(`⚛️ 渲染性能: ${componentName} ${renderTime}ms`);
    }
  }

  /**
   * 記錄用戶交互
   */
  recordUserInteraction(type, target, duration) {
    if (!this.shouldMonitor()) {      return;
    }    const interaction = {      type,      target,      duration,      timestamp: Date.now(),
    };    this.metrics.app.userInteractions.push(interaction);    // 保持最新的 100 個交互
    if (this.metrics.app.userInteractions.length > 100) {      this.metrics.app.userInteractions.shift();
    }    // 交互響應時間警告
    if (duration > 300) { // 300ms      this.createAlert('interaction', `用戶交互響應過慢: ${type} ${duration}ms`, 'warning');
    }
  }

  /**
   * 記錄導航性能
   */
  recordNavigationMetric(entry) {
    const metric = {      name: entry.name,      duration: entry.duration,      startTime: entry.startTime,      type: entry.entryType,      timestamp: Date.now(),
    };    this.metrics.navigation.push(metric);    if (this.metrics.navigation.length > 50) {      this.metrics.navigation.shift();
    }
  }

  /**
   * 記錄資源性能
   */
  recordResourceMetric(entry) {
    if (entry.duration > 1000) { // 資源載入超過 1 秒      this.createAlert('resource', `資源載入過慢: ${entry.name} ${entry.duration}ms`, 'warning');
    }
  }

  /**
   * 記錄測量性能
   */
  recordMeasureMetric(entry) {
    if (__DEV__) {      console.debug(`📏 性能測量: ${entry.name} ${entry.duration}ms`);
    }
  }

  /**
   * 記錄記憶體指標
   */
  recordMemoryMetric(memory) {
    this.metrics.app.memory.push(memory);    if (this.metrics.app.memory.length > 100) {      this.metrics.app.memory.shift();
    }
  }

  /**
   * 記錄網路指標
   */
  recordNetworkMetric(metric) {
    this.metrics.app.network.push(metric);    if (this.metrics.app.network.length > 100) {      this.metrics.app.network.shift();
    }
  }

  /**
   * 記錄錯誤
   */
  recordError(type, error) {
    if (!this.shouldMonitor()) {      return;
    }    const errorMetric = {      type,      message: error?.message || error,      stack: error?.stack,      timestamp: Date.now(),
    };    this.metrics.app.errors.push(errorMetric);
    this.metrics.app.crashes++;    if (this.metrics.app.errors.length > 50) {      this.metrics.app.errors.shift();
    }    this.createAlert('error', `錯誤: ${errorMetric.message}`, 'error');    if (__DEV__) {      console.error('🐛 錯誤記錄:', errorMetric);
    }
  }

  /**
   * 創建警告
   */
  createAlert(category, message, level) {
    const alert = {      id: Date.now(),      category,      message,      level,      timestamp: Date.now(),
    };    this.alerts.push(alert);    if (this.alerts.length > 20) {      this.alerts.shift();
    }    if (__DEV__) {      const emoji = level === 'error' ? '🚨' : '⚠️';      console.warn(`${emoji} 性能警告: ${message}`);
    }
  }

  /**
   * 生成性能報告
   */
  generateReport() {
    const now = Date.now();
    const uptime = now - this.metrics.app.startTime;    // API 統計
    const apiStats = this.calculateAPIStats();    // 屏幕統計
    const screenStats = this.calculateScreenStats();    // 記憶體統計
    const memoryStats = this.calculateMemoryStats();    // 錯誤統計
    const errorStats = this.calculateErrorStats();    const report = {      timestamp: now,      uptime,      summary: {        totalErrors: this.metrics.app.crashes,        activeAlerts: this.alerts.length,        avgMemoryUsage: memoryStats.average,        apiSuccessRate: apiStats.successRate,        screenLoadTime: screenStats.averageLoadTime,      },      details: {        api: apiStats,        screens: screenStats,        memory: memoryStats,        errors: errorStats,        alerts: this.alerts.slice(-10), // 最新 10 個警告      },      recommendations: this.generateRecommendations(apiStats, screenStats, memoryStats),
    };    return report;
  }

  /**
   * 計算統計
   */
  calculateAPIStats() {
    const allMetrics = [];
    for (const metrics of this.metrics.api.values()) {      allMetrics.push(...metrics);
    }    if (allMetrics.length === 0) {      return { successRate: 100, averageResponseTime: 0, totalRequests: 0 };
    }    const successful = allMetrics.filter(m => m.success).length;
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length;    return {      successRate: (successful / allMetrics.length * 100).toFixed(2),      averageResponseTime: Math.round(avgResponseTime),      totalRequests: allMetrics.length,      slowestEndpoint: this.findSlowestEndpoint(),
    };
  }

  calculateScreenStats() {
    const allMetrics = [];
    for (const metrics of this.metrics.screens.values()) {      allMetrics.push(...metrics);
    }    if (allMetrics.length === 0) {      return { averageLoadTime: 0, totalNavigations: 0 };
    }    const loadMetrics = allMetrics.filter(m => m.action === 'load');
    const avgLoadTime = loadMetrics.length > 0      ? loadMetrics.reduce((sum, m) => sum + m.duration, 0) / loadMetrics.length      : 0;    return {      averageLoadTime: Math.round(avgLoadTime),      totalNavigations: allMetrics.length,      slowestScreen: this.findSlowestScreen(),
    };
  }

  calculateMemoryStats() {
    const memoryMetrics = this.metrics.app.memory;    if (memoryMetrics.length === 0) {      return { average: 0, peak: 0, current: 0 };
    }    const current = memoryMetrics[memoryMetrics.length - 1];
    const average = memoryMetrics.reduce((sum, m) => sum + m.used, 0) / memoryMetrics.length;
    const peak = Math.max(...memoryMetrics.map(m => m.used));    return {      average: Math.round(average),      peak,      current: current.used,      trend: this.calculateMemoryTrend(),
    };
  }

  calculateErrorStats() {
    const errors = this.metrics.app.errors;
    const last24h = errors.filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000);    return {      total: errors.length,      last24h: last24h.length,      errorRate: (last24h.length / 24).toFixed(2), // 每小時平均錯誤數      commonErrors: this.getCommonErrors(),
    };
  }

  /**
   * 生成優化建議
   */
  generateRecommendations(apiStats, screenStats, memoryStats) {
    const recommendations = [];    if (parseFloat(apiStats.successRate) < 95) {      recommendations.push({        type: 'api',        priority: 'high',        message: 'API 成功率低於 95%，建議檢查網路處理和錯誤重試機制',      });
    }    if (apiStats.averageResponseTime > 2000) {      recommendations.push({        type: 'api',        priority: 'medium',        message: 'API 響應時間過長，建議優化請求或實施快取',      });
    }    if (screenStats.averageLoadTime > 2000) {      recommendations.push({        type: 'screen',        priority: 'medium',        message: '屏幕載入時間過長，建議實施代碼分割和懶加載',      });
    }    if (memoryStats.average > 150) {      recommendations.push({        type: 'memory',        priority: 'high',        message: '記憶體使用過高，建議檢查記憶體洩漏和優化快取策略',      });
    }    return recommendations;
  }

  /**
   * 開始定期報告
   */
  startReporting() {
    setInterval(() => {      if (__DEV__) {        const report = this.generateReport();        console.info('📊 性能報告:', report.summary);        if (report.details.alerts.length > 0) {          console.warn('⚠️ 活躍警告:', report.details.alerts);        }      }
    }, this.config.reportInterval);
  }

  /**
   * 工具方法
   */
  shouldMonitor() {
    return Math.random() < this.config.sampleRate;
  }

  findSlowestEndpoint() {
    let slowest = null;
    let maxTime = 0;    for (const [endpoint, metrics] of this.metrics.api.entries()) {      const avgTime = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;      if (avgTime > maxTime) {        maxTime = avgTime;        slowest = endpoint;      }
    }    return slowest;
  }

  findSlowestScreen() {
    let slowest = null;
    let maxTime = 0;    for (const [screen, metrics] of this.metrics.screens.entries()) {      const loadMetrics = metrics.filter(m => m.action === 'load');      if (loadMetrics.length > 0) {        const avgTime = loadMetrics.reduce((sum, m) => sum + m.duration, 0) / loadMetrics.length;        if (avgTime > maxTime) {          maxTime = avgTime;          slowest = screen;        }      }
    }    return slowest;
  }

  calculateMemoryTrend() {
    const metrics = this.metrics.app.memory.slice(-10); // 最近 10 個記錄
    if (metrics.length < 2) {      return 'stable';
    }    const first = metrics[0].used;
    const last = metrics[metrics.length - 1].used;
    const change = ((last - first) / first) * 100;    if (change > 10) {      return 'increasing';
    }
    if (change < -10) {      return 'decreasing';
    }
    return 'stable';
  }

  getCommonErrors() {
    const errorCounts = {};    for (const error of this.metrics.app.errors) {      const message = error.message || 'Unknown error';      errorCounts[message] = (errorCounts[message] || 0) + 1;
    }    return Object.entries(errorCounts)      .sort(([,a], [,b]) => b - a)      .slice(0, 5)      .map(([message, count]) => ({ message, count }));
  }

  /**
   * 獲取性能統計數據
   */
  getPerformanceHookData() {
    return {      report: this.generateReport(),      recordScreen: this.recordScreenMetric.bind(this),      recordAPI: this.recordAPIMetric.bind(this),      recordRender: this.recordRenderMetric.bind(this),      recordInteraction: this.recordUserInteraction.bind(this),      getStats: () => this.generateReport(),
    };
  }

  /**
   * 性能測量工具
   */
  measure(name, fn) {
    const start = performance.now();    try {      const result = fn();      if (result && typeof result.then === 'function') {        // 異步函數        return result.finally(() => {          const duration = performance.now() - start;          this.recordMeasureMetric({ name, duration });        });      }      // 同步函數      const duration = performance.now() - start;      this.recordMeasureMetric({ name, duration });      return result;
    } catch (error) {      const duration = performance.now() - start;      this.recordMeasureMetric({ name, duration });      this.recordError('measure', error);      throw error;
    }
  }
}

// 創建單例
const performanceMonitor = new PerformanceMonitor();

// React Hook
export const usePerformanceMonitor = () => performanceMonitor.usePerformanceMonitor();

// 性能測量裝飾器
export const measurePerformance = (name) => (target, propertyKey, descriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    return performanceMonitor.measure(`${target.constructor.name}.${propertyKey}`, () => {      return originalMethod.apply(this, args);
    });
  };

  return descriptor;
};

export default performanceMonitor;
