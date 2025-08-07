# 貢獻指南

感謝您對TCG助手項目的關注！我們歡迎所有形式的貢獻。

## 目錄

- [行為準則](#行為準則)
- [如何貢獻](#如何貢獻)
- [開發環境設置](#開發環境設置)
- [代碼規範](#代碼規範)
- [提交規範](#提交規範)
- [測試指南](#測試指南)
- [發布流程](#發布流程)

## 行為準則

### 我們的承諾

為了營造一個開放和友善的環境，我們作為貢獻者和維護者承諾，無論年齡、體型、身體狀況、殘疾、種族、性別認同和表達、經驗水平、教育程度、社會經濟地位、國籍、個人外表、種族、宗教或性取向如何，參與我們的項目和社區都是一種無騷擾的體驗。

### 我們的標準

有助於創造積極環境的行為包括：

- 使用友善和包容的語言
- 尊重不同的觀點和經驗
- 優雅地接受建設性批評
- 專注於對社區最有利的事情
- 對其他社區成員表現同理心

不可接受的行為包括：

- 使用性暗示的語言或圖像，或不受歡迎的性關注或示好
- 惡意挑釁、侮辱/貶損性評論，以及個人或政治攻擊
- 公開或私下騷擾
- 在未明確許可的情況下發布他人的私人信息，如實際或電子地址
- 在專業環境中可能被認為不適當的其他行為

## 如何貢獻

### 報告Bug

1. 使用GitHub Issues報告bug
2. 使用bug報告模板
3. 提供詳細的重現步驟
4. 包含錯誤截圖或日誌

### 功能請求

1. 使用GitHub Issues提出功能請求
2. 使用功能請求模板
3. 詳細描述功能需求
4. 說明使用場景

### 代碼貢獻

1. Fork項目
2. 創建功能分支
3. 提交變更
4. 發起Pull Request

## 開發環境設置

### 系統要求

- Node.js >= 16
- npm >= 8
- React Native CLI
- Expo CLI
- Android Studio (Android開發)
- Xcode (iOS開發)

### 安裝步驟

```bash
# 克隆項目
git clone https://github.com/your-username/tcg-assistant.git
cd tcg-assistant

# 安裝依賴
npm install

# 啟動開發服務器
npm start

# 運行測試
npm test

# 代碼檢查
npm run lint
```

### 環境變數

複製`.env.example`為`.env`並配置必要的API密鑰：

```bash
cp .env.example .env
```

## 代碼規範

### JavaScript/React Native

- 使用ES6+語法
- 使用函數組件和Hooks
- 遵循React最佳實踐
- 使用TypeScript（可選）

### 命名規範

- 組件：PascalCase (如 `CardRecognitionScreen`)
- 函數：camelCase (如 `handleCardRecognition`)
- 常量：UPPER_SNAKE_CASE (如 `API_ENDPOINTS`)
- 文件：kebab-case (如 `card-recognition-screen.js`)

### 文件結構

```
src/
├── components/     # 可重用組件
├── screens/        # 頁面組件
├── services/       # API服務
├── store/          # Redux狀態管理
├── utils/          # 工具函數
├── constants/      # 常量定義
├── navigation/     # 導航配置
└── i18n/          # 國際化
```

### 代碼風格

- 使用2個空格縮進
- 使用單引號
- 行尾不加分號
- 使用尾隨逗號
- 最大行長度80字符

## 提交規範

使用[Conventional Commits](https://www.conventionalcommits.org/)格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 類型

- `feat`: 新功能
- `fix`: 修復bug
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `refactor`: 代碼重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

### 示例

```
feat(card-recognition): 添加AI卡牌辨識功能

- 整合Google Vision API
- 添加本地數據庫支持
- 實現置信度評分

Closes #123
```

## 測試指南

### 單元測試

- 使用Jest框架
- 測試文件命名：`*.test.js`
- 測試覆蓋率目標：>80%

### 組件測試

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import CardRecognitionScreen from '../CardRecognitionScreen';

describe('CardRecognitionScreen', () => {
  test('should render correctly', () => {
    const { getByText } = render(<CardRecognitionScreen />);
    expect(getByText('卡牌辨識')).toBeTruthy();
  });
});
```

### 集成測試

- 測試API調用
- 測試導航流程
- 測試狀態管理

### 端到端測試

- 使用Detox或Appium
- 測試完整用戶流程
- 測試跨平台兼容性

## 發布流程

### 版本管理

- 使用語義化版本控制
- 主版本號：不兼容的API修改
- 次版本號：向下兼容的功能性新增
- 修訂號：向下兼容的問題修正

### 發布步驟

1. 更新版本號
2. 更新CHANGELOG.md
3. 創建發布標籤
4. 部署到應用商店

### 分支策略

- `main`: 生產環境代碼
- `develop`: 開發環境代碼
- `feature/*`: 功能分支
- `hotfix/*`: 緊急修復分支

## 聯繫方式

- 項目維護者：[維護者郵箱]
- 技術討論：[GitHub Discussions]
- 問題報告：[GitHub Issues]

## 許可證

通過貢獻代碼，您同意您的貢獻將在MIT許可證下發布。

---

感謝您的貢獻！
