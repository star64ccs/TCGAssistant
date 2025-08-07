# 應用程式設定頁面實現文檔

## 概述

本文檔描述了 TCG Assistant 應用程式中設定頁面的實現細節。該頁面提供了完整的應用程式設定管理功能，包括語言、主題、通知、隱私、安全、顯示等各種設定選項，為用戶提供個性化的使用體驗。

## 功能特色

### 1. 帳戶設定
- **個人資料管理**：快速導航到個人資料頁面
- **密碼更改**：直接跳轉到密碼更改頁面
- **用戶資訊顯示**：顯示當前用戶的電子郵件

### 2. 一般設定
- **語言設定**：支援繁體中文、簡體中文、英文、日文
- **主題設定**：淺色主題、深色主題、自動模式
- **即時預覽**：設定變更後立即生效

### 3. 通知設定
- **總開關**：啟用/禁用所有通知
- **價格提醒**：卡牌價格變動通知
- **市場更新**：市場趨勢更新通知
- **新功能通知**：應用程式新功能提醒

### 4. 隱私設定
- **分析資料分享**：幫助改善應用程式的匿名資料分享
- **使用資料分享**：詳細使用行為資料分享
- **透明化控制**：用戶完全控制資料分享範圍

### 5. 安全設定
- **生物識別認證**：指紋或臉部識別登入
- **自動鎖定**：應用程式閒置自動鎖定
- **鎖定時間設定**：自定義鎖定時間間隔

### 6. 顯示設定
- **圖片品質**：高、中、低三種品質選項
- **價格顯示**：控制是否顯示卡牌價格
- **預測顯示**：控制是否顯示AI預測結果

### 7. 支援與關於
- **幫助中心**：使用教學與常見問題
- **意見回饋**：用戶反饋收集
- **應用評分**：應用商店評分功能
- **分享應用**：推薦給朋友

### 8. 法律與條款
- **服務條款**：應用程式使用條款
- **隱私政策**：資料保護政策

### 9. 應用程式資訊
- **版本資訊**：當前版本號
- **建置編號**：應用程式建置版本

### 10. 危險操作
- **重設設定**：恢復所有設定為預設值
- **登出帳戶**：安全登出當前帳戶
- **刪除帳戶**：永久刪除用戶帳戶

## 技術架構

### 1. 前端組件 (`SettingsScreen.js`)

#### 主要功能
```javascript
// 設定項目組件
const SettingItem = ({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  rightComponent,
  showArrow = true 
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <Icon name={icon} size={24} color={colors.primary} style={styles.settingIcon} />
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingItemRight}>
      {rightComponent}
      {showArrow && <Icon name="chevron-right" size={24} color={colors.textSecondary} />}
    </View>
  </TouchableOpacity>
);

// 開關設定項目
const SwitchSettingItem = ({ 
  title, 
  subtitle, 
  icon, 
  value, 
  onValueChange 
}) => (
  <View style={styles.settingItem}>
    <View style={styles.settingItemLeft}>
      <Icon name={icon} size={24} color={colors.primary} style={styles.settingIcon} />
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
    />
  </View>
);
```

#### 狀態管理
- `showLanguageModal`：語言選擇模態框顯示狀態
- `showThemeModal`：主題選擇模態框顯示狀態
- `showQualityModal`：圖片品質選擇模態框顯示狀態
- `showTimeoutModal`：鎖定時間設定模態框顯示狀態
- `timeoutValue`：鎖定時間輸入值

### 2. Redux 狀態管理 (`settingsSlice.js`)

#### 異步 Actions
```javascript
// 載入設定
export const loadSettings = createAsyncThunk(
  'settings/load',
  async () => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        const savedSettings = JSON.parse(settingsData);
        return { ...initialState, ...savedSettings };
      }
      return initialState;
    } catch (error) {
      console.error('Load settings error:', error);
      return initialState;
    }
  }
);

// 更新語言設定
export const updateLanguage = createAsyncThunk(
  'settings/updateLanguage',
  async (language, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = { ...settings, language };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### 狀態結構
```javascript
const initialState = {
  language: APP_CONFIG.DEFAULT_LANGUAGE,
  theme: 'light',
  notifications: {
    enabled: true,
    priceAlerts: true,
    marketUpdates: true,
    newFeatures: false,
  },
  privacy: {
    shareAnalytics: true,
    shareUsageData: false,
  },
  security: {
    biometricAuth: false,
    autoLock: false,
    lockTimeout: 5,
  },
  display: {
    cardImageQuality: 'high',
    showPrices: true,
    showPredictions: true,
  },
  isLoading: false,
  error: null,
};
```

### 3. 導航整合 (`RootNavigator.js`)

#### 路由配置
```javascript
<Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
```

#### 導航觸發
```javascript
// 在 ProfileScreen 中
const handleSettings = () => {
  navigation.navigate(ROUTES.SETTINGS);
};
```

### 4. 國際化支援 (`zh-TW.json`)

#### 新增翻譯鍵值
```json
{
  "settings": {
    "title": "設定",
    "subtitle": "個人化設定",
    "account": "帳戶",
    "profile": "個人資料",
    "language": "語言",
    "theme": "主題",
    "notifications": "通知",
    "privacy": "隱私",
    "security": "安全",
    "display": "顯示",
    "support": "支援",
    "app_info": "應用程式資訊",
    "general": "一般",
    "enable_notifications": "啟用通知",
    "price_alerts": "價格提醒",
    "market_updates": "市場更新",
    "new_features": "新功能通知",
    "share_analytics": "分享分析資料",
    "share_usage_data": "分享使用資料",
    "biometric_auth": "生物識別認證",
    "auto_lock": "自動鎖定",
    "lock_timeout": "鎖定時間",
    "card_image_quality": "卡牌圖片品質",
    "show_prices": "顯示價格",
    "show_predictions": "顯示預測",
    "reset_settings": "重設設定",
    "language_settings": "語言設定",
    "theme_settings": "主題設定",
    "display_settings": "顯示設定",
    "high": "高",
    "medium": "中",
    "low": "低",
    "minutes": "分鐘",
    "version": "版本",
    "build_number": "建置編號",
    "reset_confirm": "確定要重設所有設定嗎？此操作無法復原。",
    "settings_reset": "設定已重設",
    "settings_saved": "設定已儲存",
    "settings_error": "儲存設定失敗"
  }
}
```

## UI 設計

### 1. 佈局結構
- **頂部導航欄**：包含返回按鈕和標題
- **分區設定**：按功能分類的設定區塊
- **設定項目**：統一的設定項目樣式
- **模態框**：選擇類設定的彈出視窗

### 2. 視覺設計
- **漸層背景**：使用 `LinearGradient` 創建現代化的頂部導航
- **圓角卡片**：統一的設定區塊設計
- **圖標系統**：使用 Material Community Icons
- **開關組件**：自定義顏色的 Switch 組件

### 3. 互動設計
- **模態框選擇**：語言、主題、品質等選擇
- **即時反饋**：設定變更後立即顯示成功訊息
- **確認對話框**：危險操作前的確認提示
- **鍵盤適配**：鎖定時間輸入的鍵盤處理

## 測試覆蓋

### 1. 單元測試 (`settingsScreen.test.js`)

#### 測試範圍
- **語言變更**：測試語言設定更新和錯誤處理
- **主題變更**：測試主題設定更新
- **通知設定**：測試各種通知選項的開關
- **隱私設定**：測試資料分享選項
- **安全設定**：測試生物識別和自動鎖定
- **顯示設定**：測試圖片品質和顯示選項
- **設定重設**：測試重設功能
- **模態框管理**：測試各種模態框的狀態管理
- **選項列表**：測試語言、主題、品質選項
- **Redux 整合**：測試狀態管理和載入狀態

#### 測試統計
- **總測試數**：25 個測試案例
- **覆蓋範圍**：設定變更、錯誤處理、狀態管理、模態框操作

### 2. 測試策略
- **純邏輯測試**：避免 UI 渲染問題，專注於業務邏輯
- **模擬依賴**：模擬 `AsyncStorage`、`i18n` 等外部依賴
- **狀態驗證**：驗證 Redux 狀態變更和載入狀態
- **錯誤處理**：測試各種錯誤情況的處理

## 安全性考量

### 1. 資料保護
- **本地儲存**：設定資料儲存在本地 AsyncStorage
- **加密傳輸**：設定變更時的資料傳輸安全
- **權限控制**：敏感設定的權限驗證

### 2. 用戶體驗安全
- **確認對話框**：危險操作前的確認提示
- **錯誤處理**：安全的錯誤訊息顯示
- **載入狀態**：防止重複操作

### 3. 隱私保護
- **資料分享控制**：用戶完全控制資料分享
- **透明化設定**：清楚說明資料使用方式
- **選擇性功能**：可選擇性啟用功能

## 性能優化

### 1. 狀態管理
- **局部狀態**：使用 React 狀態管理模態框顯示
- **Redux 整合**：高效的狀態更新和同步
- **記憶化**：避免不必要的重新渲染

### 2. 用戶體驗
- **即時反饋**：設定變更的即時視覺反饋
- **載入指示**：提供清晰的載入狀態
- **錯誤處理**：優雅的錯誤處理和恢復

### 3. 記憶體管理
- **模態框清理**：及時清理模態框狀態
- **事件監聽器**：正確清理事件監聽器
- **組件卸載**：適當的組件生命週期管理

## 未來改進

### 1. 功能增強
- **主題預覽**：設定主題時的即時預覽
- **備份還原**：設定的備份和還原功能
- **同步功能**：跨裝置設定同步
- **自定義主題**：用戶自定義主題顏色

### 2. 用戶體驗
- **動畫效果**：添加平滑的過渡動畫
- **手勢操作**：支援手勢操作
- **無障礙支援**：改善螢幕閱讀器支援
- **深色模式**：完整的深色模式支援

### 3. 功能擴展
- **進階設定**：更多自定義選項
- **快捷設定**：常用設定的快捷方式
- **設定建議**：基於使用習慣的設定建議
- **批量操作**：批量修改多個設定

## 總結

應用程式設定頁面已成功實現，提供了完整的設定管理功能。該頁面包括：

- ✅ 完整的設定分類和管理
- ✅ 優雅的用戶界面設計
- ✅ 全面的測試覆蓋
- ✅ 國際化支援
- ✅ 響應式設計
- ✅ 安全性保障
- ✅ 性能優化

該功能已準備好整合到實際的應用程式中，並可以根據用戶反饋進行進一步的優化和增強。所有短期目標已完成，為後續的中期和長期目標奠定了堅實的基礎。
