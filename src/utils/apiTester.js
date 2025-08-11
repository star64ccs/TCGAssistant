// 導入必要的模組
import { getApiConfig } from '../config/apiConfig';

// API 測試工具
class APITester {
  // 測試 OpenAI API
  async testOpenAI() {
    try {
      const config = getApiConfig || (() => ({})) || (() => ({})) || (() => ({}))('ai', 'OPENAI');
      if (!config || !config.enabled) {
        return {
          success: false,
          error: 'OpenAI API 未配置或未啟用',
        };
      }
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4',
          messages: [
            { role: 'user', content: '測試連接，請回應 "連接成功"' },
          ],
          maxTokens: 10,
        }),
        timeout: 10000,
      });
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      const data = await response.json();
      return {
        success: true,
        message: '連接成功',
        response: data.choices[0]?.message?.content || '已連接',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 測試 Google PaLM API
  async testGooglePaLM() {
    try {
      const config = getApiConfig || (() => ({})) || (() => ({})) || (() => ({}))('ai', 'GOOGLE_PALM');
      if (!config || !config.enabled) {
        return {
          success: false,
          error: 'Google PaLM API 未配置或未啟用',
        };
      }
      const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            text: '測試連接，請回應 "連接成功"',
          },
          maxOutputTokens: 10,
        }),
        timeout: 10000,
      });
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      const data = await response.json();
      return {
        success: true,
        message: '連接成功',
        response: data.candidates[0]?.output || '已連接',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 測試 Azure OpenAI API
  async testAzureOpenAI() {
    try {
      const config = getApiConfig || (() => ({})) || (() => ({})) || (() => ({}))('ai', 'AZURE_OPENAI');
      if (!config || !config.enabled) {
        return {
          success: false,
          error: 'Azure OpenAI API 未配置或未啟用',
        };
      }
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '測試連接，請回應 "連接成功"' },
          ],
          maxTokens: 10,
        }),
        timeout: 10000,
      });
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      const data = await response.json();
      return {
        success: true,
        message: '連接成功',
        response: data.choices[0]?.message?.content || '已連接',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 測試所有 AI API
  async testAllAIAPIs() {
    const results = {};
    // 測試 OpenAI
    results.openai = await this.testOpenAI();
    // 測試 Google PaLM
    results.googlePaLM = await this.testGooglePaLM();
    // 測試 Azure OpenAI
    results.azureOpenAI = await this.testAzureOpenAI();
    // 計算統計
    const total = Object.keys(results).length;
    const successful = Object.values(results).filter(r => r.success).length;
    const failed = total - successful;
    return {
      results,
      summary: {
        total,
        successful,
        failed,
        hasAnyWorking: successful > 0,
      },
    };
  }

  // 生成測試報告
  generateTestReport(testResults) {
    const { results, summary } = testResults;
    let report = '🤖 AI API 測試報告\n\n';
    report += '📊 總結：\n';
    report += `- 總共測試：${summary.total} 個 API\n`;
    report += `- 成功：${summary.successful} 個\n`;
    report += `- 失敗：${summary.failed} 個\n`;
    report += `- 狀態：${summary.hasAnyWorking ? '✅ 有可用服務' : '❌ 無可用服務'}\n\n`;
    report += '📝 詳細結果：\n\n';
    // OpenAI 結果
    const openai = results.openai;
    report += '🔵 OpenAI GPT-4：\n';
    report += `- 狀態：${openai.success ? '✅ 成功' : '❌ 失敗'}\n`;
    if (openai.success) {
      report += `- 回應：${openai.response}\n`;
    } else {
      report += `- 錯誤：${openai.error}\n`;
    }
    report += '\n';
    // Google PaLM 結果
    const palm = results.googlePaLM;
    report += '🟢 Google PaLM：\n';
    report += `- 狀態：${palm.success ? '✅ 成功' : '❌ 失敗'}\n`;
    if (palm.success) {
      report += `- 回應：${palm.response}\n`;
    } else {
      report += `- 錯誤：${palm.error}\n`;
    }
    report += '\n';
    // Azure OpenAI 結果
    const azure = results.azureOpenAI;
    report += '🔷 Azure OpenAI：\n';
    report += `- 狀態：${azure.success ? '✅ 成功' : '❌ 失敗'}\n`;
    if (azure.success) {
      report += `- 回應：${azure.response}\n`;
    } else {
      report += `- 錯誤：${azure.error}\n`;
    }
    report += '\n';
    // 建議
    report += '💡 建議：\n';
    if (summary.hasAnyWorking) {
      report += `- 您已成功配置 ${summary.successful} 個 AI 服務\n`;
      report += '- 可以開始使用 AI 聊天功能\n';
      if (summary.failed > 0) {
        report += '- 可選擇性修復失敗的服務以獲得更好的體驗\n';
      }
    } else {
      report += '- 請檢查 API 密鑰配置\n';
      report += '- 參考 AI_INTEGRATION_SETUP_GUIDE.md 設置指南\n';
      report += '- 確認網路連接正常\n';
      report += '- 檢查 API 服務狀態和額度\n';
    }
    return report;
  }

  // 快速檢查 API 可用性
  async quickCheck() {
    try {
      const testResults = await this.testAllAIAPIs();
      return {
        hasWorkingAPI: testResults.summary.hasAnyWorking,
        workingCount: testResults.summary.successful,
        totalCount: testResults.summary.total,
        workingAPIs: Object.entries(testResults.results)
          .filter(([_, result]) => result.success)
          .map(([api, _]) => api),
      };
    } catch (error) {
      return {
        hasWorkingAPI: false,
        workingCount: 0,
        totalCount: 0,
        workingAPIs: [],
        error: error.message,
      };
    }
  }
}

export default new APITester();
