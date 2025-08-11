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
import { getUltraFastCardRecognitionService } from '../services/ultraFastCardRecognitionService';
import cardRecognitionService from '../services/cardRecognitionService';
import integratedApiService from '../services/integratedApiService';

const { width, height } = Dimensions.get('window');

const CardRecognitionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t,
  } = useTranslation();
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
          { text: t('common.cancel'), style: 'cancel',
          },
          { text: t('membership.upgrade'), onPress: () => navigation.navigate('Membership') },
        ],
      );
      return;
    }

    setIsRecognizing(true);
    setRecognitionProgress(0);
    setProgressMessage('⚡ 超高速識別中...');

    try {
      // 使用超高速卡牌識別服務
      const ultraFastService = getUltraFastCardRecognitionService();
      const result = await ultraFastService.recognizeCard(selectedImage, {
        onProgress: (progress) => {
          setRecognitionProgress(progress.progress);
          const stepNames = {
            'preprocessing': '⚡ 超高速預處理...',
            'recognition': '⚡ 並行識別中...',
            'postprocessing': '⚡ 結果優化...',
            'completed': '⚡ 識別完成！',
          };
          setProgressMessage(stepNames[progress.step] || progress.step);
        },
      });
      setRecognitionProgress(100);
      setProgressMessage('⚡ 超高速識別完成！');
      setTimeout(() => {
        setRecognitionResult(result);
        setIsRecognizing(false);
        setRecognitionProgress(0);
        setProgressMessage('');
        // 顯示性能指標
        if (result.speedOptimized && result.processTime) {
          const speedText = result.processTime < 1000 ?
            `⚡ 超高速識別成功！耗時: ${result.processTime.toFixed(0)}ms` :
            `識別完成！耗時: ${result.processTime.toFixed(0)}ms`;
          Alert.alert(
            '識別完成',
            `${speedText}\n卡牌類型: ${result.cardType}\n信心度: ${(result.confidence * 100).toFixed(1)}%`,
            [{ text: '查看詳細結果', style: 'default' }],
          );
        }
      }, 300);
    } catch (error) {
      setIsRecognizing(false);
      setRecognitionProgress(0);
      setProgressMessage('');
      Alert.alert(t('common.error'), `超高速識別失敗: ${error.message}`);
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
    <View style={ styles.cardDetails }>
      <View style={ styles.cardImageContainer }>
        <View style={ styles.cardImage }>
          <Text style={ styles.cardImageText }>Sample Card</Text>
          <Text style={ styles.cardImageSubtext }>Card</Text>
          <Text style={ styles.cardImageNumber }>001-001</Text>
        </View>
      </View>
      <View style={ styles.cardInfo }>
        <Text style={ styles.cardName }>Sample Card</Text>
        <Text style={ styles.cardPrice }>$325,67</Text>
        <View style={ styles.cardStats }>
          <View style={ styles.statRow }>
            <Text style={ styles.statLabel }>稀有度</Text>
            <Text style={ styles.statValue }>普卡</Text>
            <View style={ styles.miniChart }>
              <View style={ styles.chartBar } />
              <View style={ styles.chartBar } />
              <View style={ styles.chartBar } />
            </View>
          </View>
          <View style={ styles.statRow }>
            <Text style={ styles.statLabel }>编号</Text>
            <Text style={ styles.statValue }>#001/001</Text>
          </View>
          <View style={ styles.statRow }>
            <Text style={ styles.statLabel }>语言</Text>
            <Text style={ styles.statValue }>羹麓中文</Text>
            <Text style={ styles.limitedText }>限是</Text>
          </View>
        </View>
        <View style={ styles.averagePrice }>
          <Text style={ styles.averagePriceLabel }>Average Price</Text>
          <Text style={ styles.averagePriceValue }>$325,67</Text>
        </View>
      </View>
    </View>
  );

  const renderBottomButtons = () => (
    <View style={ styles.bottomButtons }>
      <TouchableOpacity style={ styles.bottomButton }>
        <Icon name="star" size={ 20 } color="#ffeb3b" style={ styles.bottomButtonIcon } />
        <Text style={ styles.bottomButtonText }>加入收藏</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ styles.bottomButton }>
        <Icon name="information" size={ 20 } color="#00ffff" style={ styles.bottomButtonIcon } />
        <Text style={ styles.bottomButtonText }>查看详情</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={ styles.container }>
      { /* 頂部標題 */ }
      <View style={ styles.header }>
        <Text style={ styles.headerTitle }>卡牌辨识</Text>
        <TouchableOpacity style={ styles.settingsButton }>
          <Icon name="cog" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>
        { /* 掃描框架 */ }
        { renderScanFrame() }
        { /* 操作按鈕 */ }
        { renderActionButtons() }
        { /* 卡牌詳情 */ }
        { renderCardDetails() }
        { /* 底部按鈕 */ }
        { renderBottomButtons() }
      </ScrollView>
      { /* 辨識進度模態框 */ }
      <Modal
        visible={ isRecognizing }
        transparent={ true }
        animationType="fade"
      >
        <View style={ styles.modalOverlay }>
          <View style={ styles.modalContent }>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={ styles.modalText }>{ progressMessage }</Text>
            <View style={ styles.progressBar }>
              <View
                style={ [styles.progressFill, { width: `${recognitionProgress }%` }]}
              />
            </View>
            <Text style={ styles.progressText }>{ recognitionProgress }%</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  actionButtons: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  averagePrice: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averagePriceLabel: {
    color: '#fff',
    fontSize: 14,
  },
  averagePriceValue: {
    color: '#ffeb3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  bottomButtonIcon: { marginRight: 10 },
  bottomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonIcon: { marginRight: 15 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    margin: 20,
    padding: 15,
  },
  cardImage: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    padding: 5,
    width: 80,
  },
  cardImageContainer: { marginRight: 15 },
  cardImageNumber: {
    color: '#000',
    fontSize: 8,
    marginTop: 5,
  },
  cardImageSubtext: {
    color: '#000',
    fontSize: 10,
    marginTop: 5,
  },
  cardImageText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPrice: {
    color: '#ffeb3b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardStats: { marginBottom: 15 },
  chartBar: {
    backgroundColor: '#ffeb3b',
    height: 15,
    marginHorizontal: 1,
    width: 3,
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
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
  limitedText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 20,
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 2,
    padding: 30,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    marginTop: 15,
  },
  progressBar: {
    backgroundColor: '#1A1F71',
    borderRadius: 4,
    height: 8,
    marginBottom: 10,
    overflow: 'hidden',
    width: 200,
  },
  progressFill: {
    backgroundColor: '#00ffff',
    height: '100%',
  },
  progressText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanFrame: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 2,
    height: 200,
    justifyContent: 'center',
    margin: 20,
  },
  scanFrameContent: { alignItems: 'center' },
  scanFrameText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: { flex: 1 },
  settingsButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 14,
    width: 60,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CardRecognitionScreen;
