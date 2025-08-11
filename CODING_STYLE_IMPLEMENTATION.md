# TCG助手應用程式 - 統一編碼風格實施指南

## 概述

本文檔說明如何在TCG助手應用程式中實施統一的編碼風格，包括工具配置、腳本使用和最佳實踐。

## 已實施的統一編碼風格

### 1. 編碼風格指南
- **文件**: `CODING_STYLE_GUIDE.md`
- **內容**: 完整的編碼風格規範，包括命名、結構、註釋等標準

### 2. 代碼格式化工具
- **Prettier配置**: `.prettierrc`
- **ESLint配置**: `.eslintrc.js`
- **格式化腳本**: `scripts/format-code.js`

### 3. 示例文件
- **組件示例**: `src/components/ExampleComponent.js`
- **服務示例**: `src/services/exampleService.js`
- **測試示例**: `src/tests/ExampleComponent.test.js`

## 使用方法

### 1. 安裝依賴
確保已安裝必要的開發依賴：
```bash
npm install --save-dev prettier eslint @react-native/eslint-config
```

### 2. 運行格式化腳本

#### 格式化所有代碼
```bash
npm run format
```

#### 檢查代碼風格
```bash
npm run style:check
```

#### 自動修復代碼風格問題
```bash
npm run style:fix
```

#### 單獨運行Prettier
```bash
npm run format:write  # 格式化代碼
npm run format:check  # 檢查格式
```

#### 單獨運行ESLint
```bash
npm run lint:check    # 檢查代碼風格
npm run lint:fix      # 自動修復
```

### 3. 編輯器配置

#### VS Code配置
在 `.vscode/settings.json` 中添加：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

#### 推薦的VS Code擴展
- Prettier - Code formatter
- ESLint
- React Native Tools
- Auto Rename Tag

## 編碼風格要點

### 1. 文件組織
```
src/
├── components/          # 可重用組件
├── screens/            # 頁面組件
├── services/           # 業務邏輯服務
├── utils/              # 工具函數
├── constants/          # 常數定義
├── store/              # Redux狀態管理
├── navigation/         # 導航配置
├── i18n/               # 國際化
├── config/             # 配置檔案
└── tests/              # 測試檔案
```

### 2. 導入順序
```javascript
// 1. React相關
import React, { useState, useEffect, useCallback } from 'react';

// 2. React Native組件
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

// 3. 第三方庫
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// 4. 內部服務
import exampleService from '../services/exampleService';

// 5. 內部組件
import { CustomButton } from './CustomButton';

// 6. 常數和配置
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SIZES } from '../constants';
```

### 3. 組件結構
```javascript
const ComponentName = ({ navigation, route }) => {
  // 1. Hooks
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 2. 狀態定義
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // 3. 常數定義
  const OPTIONS = [
    { key: 'option1', label: '選項1', icon: 'icon1' },
    { key: 'option2', label: '選項2', icon: 'icon2' },
  ];

  // 4. 副作用
  useEffect(() => {
    initializeComponent();
  }, []);

  // 5. 事件處理函數
  const handlePress = useCallback(() => {
    // 處理邏輯
  }, []);

  // 6. 渲染函數
  const renderItem = () => (
    <View style={styles.item}>
      <Text style={styles.text}>內容</Text>
    </View>
  );

  // 7. 主渲染
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderItem()}
      </ScrollView>
    </SafeAreaView>
  );
};
```

### 4. 命名規範
- **組件**: PascalCase (`ExampleComponent`)
- **函數**: camelCase (`handlePress`, `renderItem`)
- **常數**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **變數**: camelCase (`userData`, `isLoading`)
- **布林值**: is/has/can前綴 (`isLoading`, `hasData`)

### 5. 樣式規範
```javascript
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },

  // 標題樣式
  title: {
    fontSize: FONT_SIZES.TITLE_MEDIUM,
    fontFamily: FONTS.TITLE_PRIMARY,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SIZES.MEDIUM,
  },

  // 按鈕樣式
  button: {
    backgroundColor: COLORS.BUTTON_PRIMARY,
    borderRadius: SIZES.SMALL,
    paddingVertical: SIZES.MEDIUM,
    paddingHorizontal: SIZES.LARGE,
    alignItems: 'center',
  },
});
```

### 6. 錯誤處理
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiService.getData();
    setData(result);
  } catch (error) {
    setError(error.message);
    Alert.alert('錯誤', error.message);
  } finally {
    setLoading(false);
  }
};
```

### 7. 測試規範
```javascript
describe('ComponentName', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      // 初始狀態
    });
  });

  it('應該正確渲染組件', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ComponentName />
      </Provider>
    );
    expect(getByText('預期文字')).toBeTruthy();
  });
});
```

## 持續集成

### 1. Git Hooks
在 `.git/hooks/pre-commit` 中添加：
```bash
#!/bin/sh
npm run style:check
```

### 2. CI/CD配置
在CI/CD流程中添加代碼風格檢查：
```yaml
- name: Check code style
  run: npm run style:check
```

## 常見問題

### 1. Prettier與ESLint衝突
如果遇到Prettier與ESLint規則衝突，可以：
- 在 `.eslintrc.js` 中禁用相關規則
- 使用 `eslint-config-prettier` 來禁用衝突的規則

### 2. 忽略特定文件
在 `.prettierignore` 中添加：
```
node_modules/
*.min.js
*.bundle.js
```

### 3. 自定義規則
如果需要自定義規則，可以：
- 修改 `.prettierrc` 中的配置
- 在 `.eslintrc.js` 中添加自定義規則

## 最佳實踐

### 1. 開發流程
1. 編寫代碼時遵循編碼風格指南
2. 保存時自動格式化（配置編輯器）
3. 提交前運行 `npm run style:check`
4. 定期運行 `npm run format` 統一格式化

### 2. 代碼審查
- 檢查是否遵循命名規範
- 確認導入順序正確
- 驗證錯誤處理完整
- 確保測試覆蓋充分

### 3. 性能考慮
- 使用 `useCallback` 和 `useMemo` 優化性能
- 避免不必要的重新渲染
- 合理使用緩存機制

## 更新日誌

### v1.0.0 (2024-01-01)
- 創建統一的編碼風格指南
- 配置Prettier和ESLint
- 創建格式化腳本
- 提供示例文件

## 貢獻指南

1. 遵循現有的編碼風格
2. 在提交前運行代碼風格檢查
3. 更新相關文檔
4. 添加必要的測試

## 聯繫方式

如有問題或建議，請聯繫開發團隊或創建Issue。

---

**注意**: 所有開發者都應該遵循此編碼風格指南，以確保代碼的一致性和可維護性。
