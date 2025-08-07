import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS, TEXT_STYLES } from '../constants';
import cardRecognitionService from '../services/cardRecognitionService';
import integratedApiService from '../services/integratedApiService';

const { width, height } = Dimensions.get('window');

const CardRecognitionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { membershipType, dailyUsage, dailyLimit } = useSelector((state) => state.membership);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [recognitionProgress, setRecognitionProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.error) {
        Alert.alert(t('common.error'), response.error);
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setRecognitionResult(null);
      }
    });
  };

  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.error) {
        Alert.alert(t('common.error'), response.error);
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setRecognitionResult(null);
      }
    });
  };

  const handleRecognize = async () => {
    if (!selectedImage) {
      Alert.alert(t('common.error'), t('card_recognition.select_image_first'));
      return;
    }

    // Check membership limits
    if (membershipType === 'free' && dailyUsage >= dailyLimit) {
      Alert.alert(
        t('membership.limit_reached_title'),
        t('membership.limit_reached_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('membership.upgrade'), onPress: () => navigation.navigate('Membership') }
        ]
      );
      return;
    }

    setIsRecognizing(true);
    setRecognitionProgress(0);
    setProgressMessage('正在分析圖片...');

    try {
      // Simulate recognition progress
      const progressInterval = setInterval(() => {
        setRecognitionProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await cardRecognitionService.recognizeCard(selectedImage);
      
      clearInterval(progressInterval);
      setRecognitionProgress(100);
      setProgressMessage('辨識完成！');

      setTimeout(() => {
        setRecognitionResult(result);
        setIsRecognizing(false);
        setRecognitionProgress(0);
        setProgressMessage('');
      }, 500);

    } catch (error) {
      setIsRecognizing(false);
      setRecognitionProgress(0);
      setProgressMessage('');
      Alert.alert(t('common.error'), error.message);
    }
  };

  const renderScanFrame = () => (
    <View style={styles.scanFrame}>
      <View style={styles.scanFrameContent}>
        <Text style={styles.scanFrameText}>请对准卡牌中央</Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
        <Icon name="camera" size={24} color="#00ffff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>拍摄卡牌</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleSelectImage}>
        <Icon name="image" size={24} color="#00ffff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>上传图片</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardDetails = () => (
    <View style={styles.cardDetails}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImage}>
          <Text style={styles.cardImageText}>Sample Card</Text>
          <Text style={styles.cardImageSubtext}>Card</Text>
          <Text style={styles.cardImageNumber}>001-001</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>Sample Card</Text>
        <Text style={styles.cardPrice}>$325,67</Text>
        <View style={styles.cardStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>稀有度</Text>
            <Text style={styles.statValue}>普卡</Text>
            <View style={styles.miniChart}>
              <View style={styles.chartBar} />
              <View style={styles.chartBar} />
              <View style={styles.chartBar} />
            </View>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>编号</Text>
            <Text style={styles.statValue}>#001/001</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>语言</Text>
            <Text style={styles.statValue}>羹麓中文</Text>
            <Text style={styles.limitedText}>限是</Text>
          </View>
        </View>
        <View style={styles.averagePrice}>
          <Text style={styles.averagePriceLabel}>Average Price</Text>
          <Text style={styles.averagePriceValue}>$325,67</Text>
        </View>
      </View>
    </View>
  );

  const renderBottomButtons = () => (
    <View style={styles.bottomButtons}>
      <TouchableOpacity style={styles.bottomButton}>
        <Icon name="star" size={20} color="#ffeb3b" style={styles.bottomButtonIcon} />
        <Text style={styles.bottomButtonText}>加入收藏</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomButton}>
        <Icon name="information" size={20} color="#00ffff" style={styles.bottomButtonIcon} />
        <Text style={styles.bottomButtonText}>查看详情</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 頂部標題 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>卡牌辨识</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="cog" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 掃描框架 */}
        {renderScanFrame()}

        {/* 操作按鈕 */}
        {renderActionButtons()}

        {/* 卡牌詳情 */}
        {renderCardDetails()}

        {/* 底部按鈕 */}
        {renderBottomButtons()}
      </ScrollView>

      {/* 辨識進度模態框 */}
      <Modal
        visible={isRecognizing}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={styles.modalText}>{progressMessage}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${recognitionProgress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{recognitionProgress}%</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scanFrame: {
    margin: 20,
    height: 200,
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrameContent: {
    alignItems: 'center',
  },
  scanFrameText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    backgroundColor: '#2A2F81',
    margin: 20,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  cardImageContainer: {
    marginRight: 15,
  },
  cardImage: {
    width: 80,
    height: 120,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  cardImageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  cardImageSubtext: {
    fontSize: 10,
    color: '#000',
    marginTop: 5,
  },
  cardImageNumber: {
    fontSize: 8,
    color: '#000',
    marginTop: 5,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffeb3b',
    marginBottom: 15,
  },
  cardStats: {
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    width: 60,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
  },
  chartBar: {
    width: 3,
    backgroundColor: '#ffeb3b',
    marginHorizontal: 1,
    height: 15,
  },
  limitedText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
  },
  averagePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  averagePriceLabel: {
    fontSize: 14,
    color: '#fff',
  },
  averagePriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffeb3b',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  bottomButtonIcon: {
    marginRight: 10,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: '#1A1F71',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
  },
  progressText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CardRecognitionScreen;
