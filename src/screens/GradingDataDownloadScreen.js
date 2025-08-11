import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const GradingDataDownloadScreen = ({ navigation }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadStatus('開始下載評級資料...');
      // 模擬下載過程
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        setDownloadStatus(`下載進度: ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setDownloadStatus('下載完成！');
      Alert.alert('成功', '評級資料下載完成');
    } catch (error) {
      setDownloadStatus('下載失敗');
      Alert.alert('錯誤', '下載過程中發生錯誤');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>評級資料下載</Text>
          <Text style={styles.subtitle}>
            下載最新的卡牌評級資料以獲得準確的市場資訊
          </Text>
        </View>
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>下載狀態</Text>
            <Text style={styles.statusText}>{downloadStatus}</Text>
            {isDownloading ? <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{downloadProgress}%</Text>
              </View> : null}
          </View>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloading && styles.downloadButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.downloadButtonText}>開始下載</Text>
            )}
          </TouchableOpacity>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>支援的評級機構</Text>
            <Text style={styles.infoText}>• PSA (Professional Sports Authenticator)</Text>
            <Text style={styles.infoText}>• CGC (Certified Guaranty Company)</Text>
            <Text style={styles.infoText}>• ARS (Authentic Rating Service)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  downloadButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 30,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressFill: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    height: '100%',
  },
  progressText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  statusTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default GradingDataDownloadScreen;
