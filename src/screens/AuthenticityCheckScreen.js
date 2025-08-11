import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Share from 'react-native-share';
import { BarChart, ProgressChart } from 'react-native-chart-kit';

import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import authenticityCheckService from '../services/authenticityCheckService';
import ultraPrecisionAuthenticityService from '../services/ultraPrecisionAuthenticityService';

const { width } = Dimensions.get('window');

const AuthenticityCheckScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [randomId] = useState(`AC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // 模擬結果數據（備用）
  const mockResult = {
    isAuthentic: true,
    confidence: 92,
    overallScore: 88,
    analysis: {
      printQuality: {
        textSharpness: { score: 95, confidence: 0.9 },
        colorAccuracy: { score: 88, confidence: 0.8 },
        imageClarty: { score: 90, confidence: 0.85 },
        borderDefinition: { score: 87, confidence: 0.8 },
      },
      materialCheck: {
        cardStock: { score: 85, confidence: 0.7 },
        coating: { score: 82, confidence: 0.6 },
        thickness: { score: 78, confidence: 0.5 },
        flexibility: { score: 80, confidence: 0.5 },
      },
      securityFeatures: {
        hologram: { score: 75, confidence: 0.6 },
        watermark: { score: 70, confidence: 0.5 },
        microtext: { score: 68, confidence: 0.4 },
        colorChanging: { score: 72, confidence: 0.5 },
      },
    },
    riskFactors: [],
    recommendations: [
      {
        type: 'positive',
        message: '卡牌通過真偽檢測',
        action: '可以安心收藏或交易',
      },
    ],
  };

  // 選擇圖片
  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    Alert.alert(
      '選擇圖片',
      '請選擇圖片來源',
      [
        { text: '取消', style: 'cancel' },
        { text: '相機', onPress: () => handleImageSelection('camera') },
        { text: '相簿', onPress: () => handleImageSelection('library') },
      ],
    );
  };

  const handleImageSelection = (source) => {
    // 模擬圖片選擇
    const defaultCardImage = require('../../assets/icon.png');
    setSelectedImage(defaultCardImage);
  };

  // 執行真偽檢查
  const handleAuthenticityCheck = async () => {
    if (!selectedImage) {
      Alert.alert(t('common.error'), '請先選擇一張卡牌圖片');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('開始超高精度檢測...');
    setProcessingProgress(0);

    try {
      // 使用超高精度真偽判斷服務
      const result = await ultraPrecisionAuthenticityService.checkAuthenticity(
        selectedImage,
        {
          cardType: 'pokemon', // 可以根據用戶選擇調整
          useRealApi: true,
          onProgress: (progress) => {
            setProcessingProgress(progress.progress);
            const stepNames = {
              'preprocessing': '超高精度預處理...',
              'algorithm_analysis': '多重算法分析...',
              'result_aggregation': '結果聚合...',
              'validation': '驗證優化...',
              'learning': '學習改進...',
              'completed': '超高精度分析完成！',
            };
            setProcessingStep(stepNames[progress.step] || progress.step);
          },
        },
      );
      if (result.success) {
        setCheckResult(result.data);
        const statusText = result.data.isAuthentic ? '真品' : '疑似偽品';
        const accuracyText = `準確率: ${(result.data.accuracy * 100).toFixed(1)}%`;
        Alert.alert(
          '超高精度檢測完成',
          `真偽檢測已完成！\n結果：${statusText}\n信心度：${result.data.confidence}%\n${accuracyText}`,
          [{ text: '查看詳細結果', style: 'default' }],
        );
      } else {
        throw new Error(result.error || '檢測失敗');
      }
    } catch (error) {
      Alert.alert(
        '檢測失敗',
        `無法完成超高精度真偽檢測：${error.message}\n\n將使用示範模式顯示結果。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '查看示範',
            onPress: () => {
              setCheckResult(mockResult);
            },
          },
        ],
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProcessingProgress(0);
    }
  };

  // 分享結果
  const handleShare = () => {
    if (!checkResult) {
      return;
    }

    const shareUrl = `https://tcgassistant.com/authenticity/${randomId}`;
    const statusText = checkResult.isAuthentic ? '真品' : '疑似偽品';
    const shareMessage = 'TCG 助手真偽檢測結果\n\n' +
      `結果：${statusText}\n` +
      `信心度：${checkResult.confidence}%\n` +
      `總分：${checkResult.overallScore}/100\n\n` +
      `查看詳細報告：${shareUrl}`;

    Share.open({
      message: shareMessage,
      url: shareUrl,
      title: 'TCG 真偽檢測結果',
    });
  };

  // 複製ID
  const handleCopyId = () => {
    // 實際應用中應該複製到剪貼板
    Alert.alert('已複製', `檢測ID：${randomId}`);
  };

  // 重新檢測
  const handleRecheck = () => {
    setCheckResult(null);
    setSelectedImage(null);
  };

  // 計算類別分數
  const calculateCategoryScore = (category) => {
    const scores = Object.values(category).map(item => item.score);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  // 渲染結果卡片
  const renderResultCard = () => {
    if (!checkResult) {
      return null;
    }

    const printScore = calculateCategoryScore(checkResult.analysis.printQuality);
    const materialScore = calculateCategoryScore(checkResult.analysis.materialCheck);
    const securityScore = calculateCategoryScore(checkResult.analysis.securityFeatures);

    return (
      <View style={styles.resultCard}>
        {/* 總體結果 */}
        <View style={styles.overallResult}>
          <View style={[
            styles.resultIcon,
            { backgroundColor: checkResult.isAuthentic ? '#4CAF50' : '#FF3B3B' },
          ]}>
            <Icon
              name={checkResult.isAuthentic ? 'check-circle' : 'alert-circle'}
              size={40}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>
              {checkResult.isAuthentic ? '檢測為真品' : '疑似偽品'}
            </Text>
            <Text style={styles.confidenceText}>
              信心度：{checkResult.confidence}%
            </Text>
            <Text style={styles.scoreText}>
              總分：{checkResult.overallScore}/100
            </Text>
          </View>
        </View>
        {/* 詳細分析 */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>詳細分析</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>印刷品質</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${printScore}%`, backgroundColor: '#4CAF50' }]} />
            </View>
            <Text style={styles.scoreValue}>{printScore}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>材質檢查</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${materialScore}%`, backgroundColor: '#FF9800' }]} />
            </View>
            <Text style={styles.scoreValue}>{materialScore}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>安全特徵</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${securityScore}%`, backgroundColor: '#2196F3' }]} />
            </View>
            <Text style={styles.scoreValue}>{securityScore}</Text>
          </View>
        </View>
        {/* 風險因素 */}
        {checkResult.riskFactors && checkResult.riskFactors.length > 0 ? <View style={styles.riskSection}>
            <Text style={styles.sectionTitle}>風險因素</Text>
            {checkResult.riskFactors.map((risk, index) => (
              <View key={index} style={styles.riskItem}>
                <Icon name="alert" size={16} color="#FF3B3B" />
                <Text style={styles.riskText}>{risk.description}</Text>
              </View>
            ))}
          </View> : null}
        {/* 建議 */}
        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>建議</Text>
          {checkResult.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Icon
                name={rec.type === 'positive' ? 'check' : 'information'}
                size={16}
                color={rec.type === 'positive' ? '#4CAF50' : '#FF9800'}
              />
              <View style={styles.recommendationText}>
                <Text style={styles.recommendationMessage}>{rec.message}</Text>
                <Text style={styles.recommendationAction}>{rec.action}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* 操作按鈕 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>分享結果</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyId}>
            <Icon name="content-copy" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>複製ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.recheckButton]} onPress={handleRecheck}>
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>重新檢測</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.PRIMARY, COLORS.SECONDARY]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>真偽判斷</Text>
        <Text style={styles.headerSubtitle}>
          AI 智能檢測卡牌真偽
        </Text>
      </LinearGradient>
      {/* 圖片選擇區域 */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>選擇卡牌圖片</Text>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={selectedImage ? () => setShowImageModal(true) : handleSelectImage}
        >
          {selectedImage ? (
            <Image source={selectedImage} style={styles.cardImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera-plus" size={50} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.placeholderText}>點擊選擇圖片</Text>
            </View>
          )}
        </TouchableOpacity>
        {selectedImage ? <TouchableOpacity style={styles.changeImageButton} onPress={handleSelectImage}>
            <Icon name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.changeImageText}>更換圖片</Text>
          </TouchableOpacity> : null}
      </View>
      {/* 檢測按鈕 */}
      {selectedImage && !checkResult ? <TouchableOpacity
          style={[styles.checkButton, isProcessing && styles.checkButtonDisabled]}
          onPress={handleAuthenticityCheck}
          disabled={isProcessing}
        >
          <Icon name="shield-search" size={20} color="#FFFFFF" />
          <Text style={styles.checkButtonText}>
            {isProcessing ? '檢測中...' : '開始真偽檢測'}
          </Text>
        </TouchableOpacity> : null}
      {/* 結果顯示 */}
      {renderResultCard()}
      {/* 圖片預覽 Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowImageModal(false)}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedImage ? <Image source={selectedImage} style={styles.modalImage} /> : null}
          </View>
        </View>
      </Modal>
      {/* 處理進度 Modal */}
      {isProcessing ? <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>
              {processingStep || '處理中...'}
            </Text>
            {processingProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${processingProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {processingProgress}%
                </Text>
              </View>
            )}
          </View>
        </View> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analysisSection: {
    marginBottom: 20,
  },
  cardImage: {
    borderRadius: 13,
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  changeImageButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  checkButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  checkButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  confidenceText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    ...TEXT_STYLES.HEADING_LARGE,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderColor: COLORS.BORDER,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 300,
    justifyContent: 'center',
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageSection: {
    padding: 20,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderRadius: 15,
    minWidth: 200,
    padding: 30,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 15,
    textAlign: 'center',
  },
  modalClose: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  modalContent: {
    height: width * 1.2,
    position: 'relative',
    width: width * 0.9,
  },
  modalImage: {
    borderRadius: 10,
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    justifyContent: 'center',
  },
  overallResult: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  placeholderText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: '80%',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  progressFill: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
    height: '100%',
  },
  progressText: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  recheckButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  recommendationAction: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  recommendationItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  recommendationMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderRadius: 15,
    elevation: 5,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  resultIcon: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginRight: 15,
    width: 60,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    ...TEXT_STYLES.HEADING_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  riskItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  riskSection: {
    marginBottom: 20,
  },
  riskText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    marginLeft: 8,
  },
  scoreBar: {
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    flex: 1,
    height: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  scoreBarFill: {
    borderRadius: 4,
    height: '100%',
  },
  scoreLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    width: 80,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  scoreText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  scoreValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 30,
  },
  sectionTitle: {
    ...TEXT_STYLES.HEADING_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },
});

export default AuthenticityCheckScreen;
