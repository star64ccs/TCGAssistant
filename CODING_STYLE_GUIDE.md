# TCG助手應用程式編碼風格指南

## 概述
本文檔定義了TCG助手應用程式的統一編碼風格標準，確保所有程式碼的一致性和可維護性。

## 1. 檔案組織與命名

### 1.1 檔案命名
- **React組件**: 使用PascalCase，例如 `InvestmentAdviceScreen.js`
- **服務類**: 使用camelCase，例如 `investmentAdviceService.js`
- **常數檔案**: 使用camelCase，例如 `colors.js`, `typography.js`
- **工具函數**: 使用camelCase，例如 `apiUtils.js`
- **測試檔案**: 使用 `.test.js` 或 `.spec.js` 後綴

### 1.2 目錄結構
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

## 2. 導入順序

### 2.1 標準導入順序
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
import investmentAdviceService from '../services/investmentAdviceService';

// 5. 內部組件
import { LightweightChart } from '../components/LightweightChart';

// 6. 常數和配置
import { COLORS, FONTS, SIZES } from '../constants';
```

## 3. 組件結構

### 3.1 組件定義順序
```javascript
const ComponentName = ({ navigation, route }) => {
  // 1. Hooks
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 2. 狀態定義
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // 3. 常數定義
  const options = [
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

## 4. 命名規範

### 4.1 變數命名
- **常數**: 使用UPPER_SNAKE_CASE，例如 `MAX_RETRY_COUNT`
- **組件**: 使用PascalCase，例如 `InvestmentAdviceScreen`
- **函數**: 使用camelCase，例如 `generateAdvice`
- **變數**: 使用camelCase，例如 `investmentAmount`
- **布林值**: 使用is/has/can前綴，例如 `isLoading`, `hasData`

### 4.2 函數命名
- **事件處理**: 使用handle前綴，例如 `handlePress`, `handleSubmit`
- **渲染函數**: 使用render前綴，例如 `renderItem`, `renderHeader`
- **工具函數**: 使用動詞開頭，例如 `calculateTotal`, `formatPrice`

## 5. 樣式規範

### 5.1 StyleSheet組織
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

  // 按鈕文字
  buttonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: FONT_SIZES.BUTTON_MEDIUM,
    fontFamily: FONTS.BODY_PRIMARY,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
});
```

### 5.2 顏色使用
- 使用 `COLORS` 常數，避免硬編碼顏色值
- 使用語義化顏色名稱，例如 `COLORS.SUCCESS`, `COLORS.ERROR`

### 5.3 字體使用
- 使用 `FONTS` 和 `FONT_SIZES` 常數
- 根據內容重要性選擇適當的字體大小

## 6. 狀態管理

### 6.1 Redux使用
```javascript
// 使用useSelector選擇狀態
const { user, isAuthenticated } = useSelector((state) => state.auth);

// 使用useDispatch發送動作
const dispatch = useDispatch();
dispatch(loginUser(credentials));
```

### 6.2 本地狀態
```javascript
// 使用useState管理本地狀態
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

## 7. 錯誤處理

### 7.1 異步函數錯誤處理
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

### 7.2 條件渲染
```javascript
{loading && <ActivityIndicator size="large" color={COLORS.PRIMARY} />}
{error && <Text style={styles.errorText}>{error}</Text>}
{data && renderData(data)}
```

## 8. 註釋規範

### 8.1 函數註釋
```javascript
/**
 * 生成投資建議
 * @param {string} userId - 用戶ID
 * @param {number} amount - 投資金額
 * @param {string} riskLevel - 風險等級
 * @returns {Promise<Object>} 投資建議對象
 */
const generateAdvice = async (userId, amount, riskLevel) => {
  // 實現邏輯
};
```

### 8.2 複雜邏輯註釋
```javascript
// 計算風險加權分數
const riskScore = factors.reduce((total, factor) => {
  return total + (factor.weight * factor.value);
}, 0);
```

## 9. 測試規範

### 9.1 測試檔案結構
```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ComponentName from '../ComponentName';

const mockStore = configureStore([]);

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

## 10. 性能優化

### 10.1 使用useCallback和useMemo
```javascript
const handlePress = useCallback(() => {
  // 處理邏輯
}, [dependency]);

const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 10.2 避免不必要的重新渲染
```javascript
// 使用React.memo包裝組件
const MemoizedComponent = React.memo(({ data }) => {
  return <View>{/* 組件內容 */}</View>;
});
```

## 11. 國際化

### 11.1 使用翻譯函數
```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Text>{t('common.loading')}</Text>
```

## 12. 安全規範

### 12.1 輸入驗證
```javascript
const validateInput = (input) => {
  if (!input || input.trim().length === 0) {
    throw new Error('輸入不能為空');
  }
  return input.trim();
};
```

### 12.2 敏感數據處理
```javascript
// 不要在日誌中記錄敏感信息
console.log('用戶操作:', { userId: user.id, action: 'login' });
// 避免: console.log('密碼:', password);
```

## 13. 版本控制

### 13.1 提交訊息格式
```
feat: 新增投資建議功能
fix: 修復登入驗證問題
docs: 更新API文檔
style: 統一編碼風格
refactor: 重構用戶服務
test: 新增組件測試
chore: 更新依賴包
```

## 14. 代碼審查檢查清單

- [ ] 遵循命名規範
- [ ] 正確的導入順序
- [ ] 適當的錯誤處理
- [ ] 完整的測試覆蓋
- [ ] 性能優化考慮
- [ ] 國際化支持
- [ ] 無安全漏洞
- [ ] 代碼註釋完整
- [ ] 樣式一致性

## 15. 工具配置

### 15.1 ESLint配置
使用項目根目錄的 `.eslintrc.js` 配置

### 15.2 Prettier配置
使用項目根目錄的 `.prettierrc` 配置

### 15.3 TypeScript配置
使用項目根目錄的 `tsconfig.json` 配置

---

**注意**: 所有開發者都應該遵循此編碼風格指南，以確保代碼的一致性和可維護性。如有疑問，請與團隊討論或更新此文檔。
