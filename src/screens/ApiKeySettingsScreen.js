/**
* API密鑰設置界面
* 提供安全的API密鑰管理功能
*/
import React, { useState, useEffect } from 'react';
import { View,
Text,
StyleSheet,
ScrollView,
TextInput,
TouchableOpacity,
Alert,
Switch,
ActivityIndicator,
KeyboardAvoidingView,
Platform, } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import secureApiKeyManager from '../utils/secureApiKeyManager';
import { COLORS } from '../constants/colors';
const ApiKeySettingsScreen = ({ navigation }) => {
const { t } = useTranslation();
const [isLoading, setIsLoading] = useState(false);
const [apiKeys, setApiKeys] = useState({});
const [showKeys, setShowKeys] = useState({});
const [hasChanges, setHasChanges] = useState(false);

  // 支持的API服務配置
const apiServices = [
    {
  id: 'tcgplayer',
  name: 'TCGPlayer',
  description: '提供卡牌市場價格數據',
  required: true,
  website: 'https://www.tcgplayer.com/',
  helpUrl: 'https://docs.tcgplayer.com/',
  placeholder: '輸入TCGPlayer API密鑰',
  validation: (key) => key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key),
},
    {
  id: 'cardmarket',
  name: 'Cardmarket',
  description: '歐洲卡牌市場價格數據',
  required: true,
  website: 'https://www.cardmarket.com/',
  helpUrl: 'https://api.cardmarket.com/',
  placeholder: '輸入Cardmarket API密鑰',
  validation: (key) => key.length >= 16 && /^[a-zA-Z0-9_-]+$/.test(key),
},
    {
  id: 'ebay',
  name: 'eBay',
  description: '二手市場價格參考',
  required: false,
  website: 'https://developer.ebay.com/',
  helpUrl: 'https://developer.ebay.com/api-docs/',
  placeholder: '輸入eBay API密鑰',
  validation: (key) => key.length >= 20 && key.includes('-'),
},
    {
  id: 'openai',
  name: 'OpenAI',
  description: 'AI分析和聊天功能',
  required: false,
  website: 'https://openai.com/',
  helpUrl: 'https://platform.openai.com/docs/',
  placeholder: '輸入OpenAI API密鑰 (sk-...)',
  validation: (key) => key.startsWith('sk-') && key.length >= 48,
},
    {
  id: 'google',
  name: 'Google Vision',
  description: '圖片識別和OCR功能',
  required: false,
  website: 'https://cloud.google.com/',
  helpUrl: 'https://cloud.google.com/vision/docs/',
  placeholder: '輸入Google Cloud API密鑰',
  validation: (key) => key.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(key),
}
  ];
  useEffect(() => {
    loadApiKeys();
  }, []);

  // 載入已存儲的API密鑰
const loadApiKeys = async () => {
setIsLoading(true);
try {
const storedServices = await secureApiKeyManager.getStoredServices();
const keysData = {};
const showData = {};
for (const service of apiServices) {
  if (storedServices.includes(service.id)) {
const key = await secureApiKeyManager.getApiKey(service.id);
keysData[service.id] = key || '';
} else { keysData[service.id] = ''; }
showData[service.id] = false;
    }
setApiKeys(keysData);
setShowKeys(showData);
  } catch (error) {
  // Alert.alert('錯誤', '載入API密鑰失敗');
} finally { setIsLoading(false); }
};

  // 更新API密鑰
  const updateApiKey = (serviceId, value) => {
    setApiKeys(prev => ({
      ...prev,
      [serviceId]: value,
    }));
    setHasChanges(true);
  };

  // 切換密鑰顯示
  const toggleShowKey = (serviceId) => {
    setShowKeys(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  // 驗證API密鑰
  const validateApiKey = (service, key) => {
    if (!key) {
      return { valid: true }; // 空密鑰允許（用戶可能想清除）
    }
if (service.validation && !service.validation(key)) {
  return {
valid: false,
  error: `${service.name
} API密鑰格式不正確`,
    };
  }
return { valid: true };
};

  // 保存API密鑰
  const saveApiKeys = async () => {
    setIsLoading(true);
    try {
const results = [];
for (const service of apiServices) {
const key = apiKeys[service.id];
if (key) {
          // 驗證密鑰格式
const validation = validateApiKey(service, key);
if (!validation.valid) {
Alert.alert('驗證失敗', validation.error);
setIsLoading(false);
return;
}
          // 設置密鑰
try {
  await secureApiKeyManager.setApiKey(service.id, key);
results.push({ service: service.name, success: true
});
        } catch (error) {
  results.push({
service: service.name,
  success: false,
  error: error.message,
});
        }
      } else {
  // 清除密鑰
try {
await secureApiKeyManager.removeApiKey(service.id);
results.push({ service: service.name, success: true, action: 'removed'
});
        } catch (error) { // 忽略移除不存在密鑰的錯誤 }
      }
    }
const successCount = results.filter(r => r.success).length;
const failureCount = results.filter(r => !r.success).length;
    if (failureCount === 0) {
      Alert.alert('成功', `已保存 ${successCount} 個API密鑰設置`);
setHasChanges(false);
    } else {
      Alert.alert(
        '部分失敗',
        `成功: ${successCount}個，失敗: ${failureCount}個`,
      );
    }
  } catch (error) {
    // Alert.alert('錯誤', '保存API密鑰失敗');
  } finally { 
    setIsLoading(false); 
  }
};

  // 測試API密鑰
  const testApiKey = async (service) => {
    const key = apiKeys[service.id];
    if (!key) {
      Alert.alert('提示', '請先輸入API密鑰');
      return;
    }
    Alert.alert(
      '測試API',
      `將測試 ${service.name} API密鑰連接性`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '測試',
          onPress: async () => {
            setIsLoading(true);
            try {
              // 調用API測試
              // 暫時只做格式驗證
              const validation = await secureApiKeyManager.validateApiKey(service.id, key);
              if (validation.valid) {
                Alert.alert('測試成功', `${service.name} API密鑰格式正確`);
              } else { 
                Alert.alert('測試失敗', validation.error); 
              }
            } catch (error) { 
              Alert.alert('測試失敗', error.message); 
            } finally { 
              setIsLoading(false); 
            }
          },
        },
      ],
    );
  };

  // 清除所有API密鑰
  const clearAllKeys = () => {
    Alert.alert(
      '確認清除',
      '確定要清除所有API密鑰嗎？此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await secureApiKeyManager.clearAllApiKeys();
              const emptyKeys = {};
              apiServices.forEach(service => {
                emptyKeys[service.id] = '';
              });
              setApiKeys(emptyKeys);
              setHasChanges(false);
              Alert.alert('成功', '已清除所有API密鑰');
            } catch (error) { 
              Alert.alert('錯誤', '清除API密鑰失敗'); 
            } finally { 
              setIsLoading(false); 
            }
          },
        },
      ],
    );
  };

  // 顯示幫助信息
  const showHelp = (service) => {
    Alert.alert(
      `${service.name} API設置`,
      `${service.description}\n\n如何獲取API密鑰：\n1. 訪問 ${service.website}\n2. 註冊開發者帳戶\n3. 創建API應用\n4. 複製API密鑰`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '訪問官網',
          onPress: () => {
            // 這裡可以打開瀏覽器
            // TODO: 實現瀏覽器打開功能
          },
        },
      ],
    );
  };

  // 渲染API服務設置項
  const renderServiceItem = (service) => {
    const hasKey = apiKeys[service.id] && apiKeys[service.id].length > 0;
    const isVisible = showKeys[service.id];
    return (
      <View key={service.id} style={styles.serviceItem}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {service.required ? <Text style={styles.requiredTag}>必需</Text> : null}
          </View>
          <TouchableOpacity
style={ styles.helpButton }
onPress={ () => showHelp(service) }
          >
            <Icon name="help-circle-outline" size={ 20 } color={ COLORS.PRIMARY } />
          </TouchableOpacity>
        </View>
        <Text style={ styles.serviceDescription }>{ service.description }</Text>
        <View style={ styles.inputContainer }>
          <TextInput
style={ [styles.input, hasKey && styles.inputWithKey] }
placeholder={ service.placeholder }
value={ apiKeys[service.id] }
onChangeText={ (value) => updateApiKey(service.id, value) }
secureTextEntry={ !isVisible }
autoCapitalize="none"
autoCorrect={ false }
          />
          <View style={ styles.inputActions }>
            <TouchableOpacity
style={ styles.actionButton }
onPress={ () => toggleShowKey(service.id) }
            >
              <Icon
name={ isVisible ? 'eye-off' : 'eye' }
size={ 20 }
color={ COLORS.TEXT_PRIMARY }
              />
            </TouchableOpacity>
            <TouchableOpacity
style={ styles.actionButton }
onPress={ () => testApiKey(service) }
disabled={ !hasKey }
            >
              <Icon
name="play-circle-outline"
size={ 20 }
color={ hasKey ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY }
              />
            </TouchableOpacity>
          </View>
        </View>
        { hasKey ? <View style={styles.statusContainer }>
          <Icon name="check-circle" size={ 16 } color={ COLORS.SUCCESS } />
          <Text style={ styles.statusText }>已配置</Text>
        </View> : null}
      </View>
    );
};
if (isLoading) {
  return (
      <View style = {styles.loadingContainer}>
        <ActivityIndicator size="large" color={ COLORS.PRIMARY } />
        <Text style={ styles.loadingText }>處理中...</Text>
      </View>
    );
}
return (
    <KeyboardAvoidingView
style = { styles.container }
behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
    >
      <ScrollView style={ styles.scrollView }>
        <View style={ styles.header }>
          <Text style={ styles.title }>API密鑰設置</Text>
          <Text style={ styles.subtitle }>
            安全管理第三方服務API密鑰，所有密鑰均以加密方式存儲
          </Text>
        </View>
        <View style={ styles.warningBox }>
          <Icon name="shield-alert" size={ 24 } color={ COLORS.WARNING } />
          <View style={ styles.warningContent }>
            <Text style={ styles.warningTitle }>安全提醒</Text>
            <Text style={ styles.warningText }>
              • API密鑰具有重要價值，請妥善保管{ '\n' }
              • 不要與他人分享您的API密鑰{ '\n' }
              • 定期輪換密鑰以確保安全{ '\n' }
              • 所有密鑰都將加密存儲在設備上
            </Text>
          </View>
        </View>
        <View style={ styles.servicesContainer }>
          { apiServices.map(renderServiceItem) }
        </View>
        <View style={ styles.actions }>
          <TouchableOpacity
style={ [styles.button, styles.saveButton, !hasChanges && styles.buttonDisabled] }
onPress={ saveApiKeys }
disabled={ !hasChanges }
          >
            <Icon name="content-save" size={ 20 } color="#fff" />
            <Text style={ styles.buttonText }>保存設置</Text>
          </TouchableOpacity>
          <TouchableOpacity
style={ [styles.button, styles.clearButton] }
onPress={ clearAllKeys }
          >
            <Icon name="delete-sweep" size={ 20 } color="#fff" />
            <Text style={ styles.buttonText }>清除所有</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
flex: 1,
  backgroundColor: COLORS.BACKGROUND_PRIMARY,
},
  scrollView: { flex: 1, },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.BACKGROUND_PRIMARY,
},
  loadingText: {
  marginTop: 16,
  fontSize: 16,
  color: COLORS.TEXT_PRIMARY,
},
  header: {
  padding: 20,
  backgroundColor: COLORS.PRIMARY,
},
  title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
  marginBottom: 8,
},
  subtitle: {
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: 20,
},
  warningBox: {
  flexDirection: 'row',
  margin: 16,
  padding: 16,
  backgroundColor: 'rgba(255, 193, 7, 0.1)',
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: COLORS.WARNING,
},
  warningContent: {
  flex: 1,
  marginLeft: 12,
},
  warningTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: COLORS.WARNING,
  marginBottom: 8,
},
  warningText: {
  fontSize: 14,
  color: COLORS.TEXT_PRIMARY,
  lineHeight: 20,
},
  servicesContainer: { padding: 16, },
  serviceItem: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2
},
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
  serviceHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
  serviceInfo: {
  flexDirection: 'row',
  alignItems: 'center',
},
  serviceName: {
  fontSize: 18,
  fontWeight: 'bold',
  color: COLORS.TEXT_PRIMARY,
  marginRight: 8,
},
  requiredTag: {
  fontSize: 12,
  color: '#fff',
  backgroundColor: COLORS.ERROR,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
},
  helpButton: { padding: 4, },
  serviceDescription: {
  fontSize: 14,
  color: COLORS.TEXT_SECONDARY,
  marginBottom: 12,
  lineHeight: 20,
},
  inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
  input: {
  flex: 1,
  height: 48,
  borderWidth: 1,
  borderColor: COLORS.CARD_BORDER,
  borderRadius: 8,
  paddingHorizontal: 12,
  fontSize: 14,
  backgroundColor: '#f8f9fa',
},
  inputWithKey: {
  borderColor: COLORS.SUCCESS,
  backgroundColor: 'rgba(40, 167, 69, 0.05)',
},
  inputActions: {
  flexDirection: 'row',
  marginLeft: 8,
},
  actionButton: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  marginLeft: 4,
},
  statusContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},
  statusText: {
  fontSize: 12,
  color: COLORS.SUCCESS,
  marginLeft: 4,
},
  actions: {
  padding: 16,
  paddingBottom: 32,
},
  button: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 48,
  borderRadius: 8,
  marginBottom: 12,
},
  saveButton: { backgroundColor: COLORS.PRIMARY, },
  clearButton: { backgroundColor: COLORS.ERROR, },
  buttonDisabled: { backgroundColor: COLORS.CARD_BORDER, },
  buttonText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#fff',
  marginLeft: 8,
},
});

export default ApiKeySettingsScreen;
