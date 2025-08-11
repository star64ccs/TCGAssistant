import React, { useState, useEffect } from 'react';
import { View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity,  TextInput,  Alert,  ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import connectionManager from '../services/connectionManager';
const ConnectionTestScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [currentConfig, setCurrentConfig] = useState(null);
  useEffect(() => {    loadCurrentConfig();
  }, []);
  const loadCurrentConfig = async () => {
    await connectionManager.init();
    const config = connectionManager.getCurrentApiConfig();
    const summary = connectionManager.getConnectionSummary();
    setCurrentConfig(config);
    setCustomUrl(summary.customUrl || config.baseUrl);
  };
  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {      id: Date.now(),
      test,      status,      message,      details,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };
  const testLocalConnection = async () => {
    setIsLoading(true);
    addTestResult('本地連接測試', 'running', '正在測試本地連接...');
    try {      const result = await connectionManager.testConnection();
      if (result.success) {        addTestResult('本地連接測試', 'success', '本地 API 連接成功', {          url: result.url,
          status: result.status,
          responseTime: `${result.responseTime
          }ms`,        });      } else {
        addTestResult('本地連接測試', 'error', result.message, {          url: result.url,
          error: result.error,
        });      }
    } catch (error) {
      addTestResult('本地連接測試', 'error', `連接失敗: ${error.message }`, { error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };
  const testCustomConnection = async () => {
    if (!customUrl.trim()) {      Alert.alert('錯誤', '請輸入有效的 URL');
      return;
    }    setIsLoading(true);
    addTestResult('自定義連接測試', 'running', `正在測試: ${ customUrl }`);
    try {
      const result = await connectionManager.testConnection(customUrl);
      if (result.success) {        addTestResult('自定義連接測試', 'success', '自定義 API 連接成功', {          url: result.url,
          status: result.status,
          responseTime: `${result.responseTime
          }ms`,        });        // 如果測試成功，保存這個 URL        await connectionManager.saveCustomUrl(customUrl);
        Alert.alert('成功', '連接測試成功，已保存此 API 地址');      } else {
        addTestResult('自定義連接測試', 'error', result.message, {          url: result.url,
          error: result.error,
        });      }
    } catch (error) {
      addTestResult('自定義連接測試', 'error', `連接失敗: ${error.message }`, {
        url: customUrl,
        error: error.toString(),
      });
    } finally {
      setIsLoading(false);
    }
  };
  const testNetworkConnectivity = async () => {
    setIsLoading(true);
    addTestResult('網路連接測試', 'running', '正在測試網路連接...');
    try {      // 測試基本網路連接      const response = await fetch('https://www.google.com', {        method: 'HEAD',
        timeout: 5000,
      });
      if (response.ok) {
        addTestResult('網路連接測試', 'success', '網路連接正常');
      } else {
        addTestResult('網路連接測試', 'error', '網路連接異常');
      }
    } catch (error) {
      addTestResult('網路連接測試', 'error', `網路連接失敗: ${error.message }`);
    } finally {
      setIsLoading(false);
    }
  };
  const autoDiscoverEndpoint = async () => {
    setIsLoading(true);
    addTestResult('自動發現端點', 'running', '正在自動尋找可用的 API 端點...');
    try {      const result = await connectionManager.autoDiscoverApiEndpoint();
      if (result) {        addTestResult('自動發現端點', 'success', `發現可用的 API 端點: ${result.url
        }`, {
          url: result.url,
          responseTime: `${result.responseTime
          }ms`,        });        // 更新輸入框        setCustomUrl(result.url);
        Alert.alert('成功', `已發現並設置 API 端點: ${ result.url }`);      } else {
        addTestResult('自動發現端點', 'error', '未發現可用的 API 端點', {          suggestion: '請手動輸入正確的 API 地址' });      }
    } catch (error) {
      addTestResult('自動發現端點', 'error', `自動發現失敗: ${error.message }`, { error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };
  const clearResults = () => {
    setTestResults([]);
  };
  const getStatusIcon = (status) => {
    switch (status) {      case 'success':        return <Icon name="check-circle" size={20 } color="#4caf50" />;
      case 'error':        return <Icon name="close-circle" size={ 20 } color="#f44336" />;
      case 'running':        return <ActivityIndicator size={ 20 } color="#00ffff" />;      default:        return <Icon name="help-circle" size={ 20 } color="#ff9800" />;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {      case 'success':        return '#4caf50';
      case 'error':        return '#f44336';
      case 'running':        return '#00ffff';      default:        return '#ff9800';
    }
  };
  return (
    <View style={ styles.container }>      { /* Header */ }      <View style={ styles.header }>        <TouchableOpacity onPress={ () => navigation.goBack() } style={ styles.backButton }>          <Icon name="arrow-left" size={ 24 } color="#00ffff" />        </TouchableOpacity>        <Text style={ styles.headerTitle }>連接測試</Text>        <TouchableOpacity onPress={ clearResults } style={ styles.clearButton }>          <Icon name="delete-sweep" size={ 24 } color="#00ffff" />        </TouchableOpacity>      </View>      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>        { /* 當前配置 */ }        <View style={ styles.configSection }>          <Text style={ styles.sectionTitle }>當前配置</Text>          <View style={ styles.configCard }>            <Text style={ styles.configLabel }>環境:</Text>            <Text style={ styles.configValue }>{ currentConfig?.baseUrl || '未配置' }</Text>            <Text style={ styles.configLabel }>超時時間:</Text>            <Text style={ styles.configValue }>{ currentConfig?.timeout || 30000 }ms</Text>          </View>        </View>        { /* 自定義 URL 輸入 */ }        <View style={ styles.inputSection }>          <Text style={ styles.sectionTitle }>自定義連接地址</Text>          <View style={ styles.inputContainer }>            <TextInput              style={ styles.textInput }              value={ customUrl }              onChangeText={ setCustomUrl }              placeholder="輸入 API 地址 (例如: http://192.168.1.100:8081)"              placeholderTextColor="#666"            />            <TouchableOpacity              style={ [styles.testButton, isLoading && styles.testButtonDisabled] }              onPress={ testCustomConnection }              disabled={ isLoading }            >              <Text style={ styles.testButtonText }>測試</Text>            </TouchableOpacity>          </View>        </View>        { /* 測試按鈕 */ }        <View style={ styles.testSection }>          <Text style={ styles.sectionTitle }>連接測試</Text>          <View style={ styles.testButtons }>            <TouchableOpacity              style={ [styles.testButton, isLoading && styles.testButtonDisabled] }              onPress={ testLocalConnection }              disabled={ isLoading }            >              <Icon name="wifi" size={ 20 } color="#00ffff" />              <Text style={ styles.testButtonText }>本地連接</Text>            </TouchableOpacity>            <TouchableOpacity              style={ [styles.testButton, isLoading && styles.testButtonDisabled] }              onPress={ testNetworkConnectivity }              disabled={ isLoading }            >              <Icon name="earth" size={ 20 } color="#00ffff" />              <Text style={ styles.testButtonText }>網路連接</Text>            </TouchableOpacity>          </View>          <View style={ styles.testButtons }>            <TouchableOpacity              style={ [styles.testButton, isLoading && styles.testButtonDisabled] }              onPress={ autoDiscoverEndpoint }              disabled={ isLoading }            >              <Icon name="radar" size={ 20 } color="#00ffff" />              <Text style={ styles.testButtonText }>自動發現</Text>            </TouchableOpacity>            <TouchableOpacity              style={ [styles.testButton, isLoading && styles.testButtonDisabled] }              onPress={
                async () => {                  const reset = await connectionManager.resetToDefault();
                  if (reset) {                    loadCurrentConfig();
                    Alert.alert('成功', '已重置為預設配置');
                  }                }}              disabled={ isLoading }            >              <Icon name="refresh" size={ 20 } color="#00ffff" />              <Text style={ styles.testButtonText }>重置配置</Text>            </TouchableOpacity>          </View>        </View>        { /* 測試結果 */ }        <View style={ styles.resultsSection }>          <Text style={ styles.sectionTitle }>測試結果</Text>          {
            testResults.length === 0 ? (              <View style={styles.noResults
              }>                <Icon name="information" size={ 48 } color="#666" />                <Text style={ styles.noResultsText }>尚未進行測試</Text>              </View>            ) : (              testResults.map((result) => (                <View key={ result.id } style={ styles.resultCard }>                  <View style={ styles.resultHeader }>                    { getStatusIcon(result.status) }                    <Text style={ [styles.resultTest, { color: getStatusColor(result.status) }]}>                      { result.test }                    </Text>                    <Text style={ styles.resultTime }>{ result.timestamp }</Text>                  </View>                  <Text style={ styles.resultMessage }>{ result.message }</Text>                  { result.details ? <View style={styles.resultDetails }>                    {
                      Object.entries(result.details).map(([key, value]) => (                        <Text key={key
                        } style={ styles.detailText }>                          { key }: { value }                        </Text>                      ))}                  </View> : null}                </View>              ))            )}        </View>        { /* 故障排除建議 */ }        <View style={ styles.troubleshootSection }>          <Text style={ styles.sectionTitle }>故障排除</Text>          <View style={ styles.troubleshootCard }>            <Text style={ styles.troubleshootTitle }>常見問題解決方案：</Text>            <Text style={ styles.troubleshootText }>              • 確保後端服務器正在運行{ '\n' }              • 檢查防火牆設置{ '\n' }              • 確認網路連接正常{ '\n' }              • 驗證 API 地址是否正確{ '\n' }              • 檢查端口是否被佔用            </Text>          </View>        </View>      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  clearButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  configCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
  },
  configLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  configSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  configValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {    backgroundColor: '#1A1F71',
    flex: 1,
  },
  detailText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  resultDetails: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  resultMessage: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  resultTest: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultTime: {
    color: '#ccc',
    fontSize: 12,
  },
  resultsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollView: { flex: 1 },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  testButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 5,
    padding: 15,
  },
  testButtonDisabled: { opacity: 0.6 },
  testButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  textInput: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 10,
    borderWidth: 1,
    color: '#fff',
    flex: 1,
    marginRight: 10,
    padding: 15,
  },
  troubleshootCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
  },
  troubleshootSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  troubleshootText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  troubleshootTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
export default ConnectionTestScreen;
