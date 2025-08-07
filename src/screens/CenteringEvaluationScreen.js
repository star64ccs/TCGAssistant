import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, RadarChart } from 'react-native-chart-kit';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import { FEATURES } from '../constants';

const { width } = Dimensions.get('window');

const CenteringEvaluationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);
  
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [randomId] = useState(`CE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // 模擬評估結果
  const mockEvaluationResult = {
    overallScore: 85,
    horizontalCentering: {
      left: 48,
      right: 52,
      score: 90
    },
    verticalCentering: {
      top: 51,
      bottom: 49,
      score: 80
    },
    grade: 'good_centering',
    confidence: 92,
    analysis: {
      printQuality: 88,
      edgeQuality: 85,
      cornerQuality: 82,
      colorAccuracy: 90
    }
  };

  const handleTakePhoto = (side) => {
    // 模擬拍照功能
    Alert.alert(
      t('centering.take_photo'),
      t('centering.select_photo_source'),
      [
        {
          text: t('common.camera'),
          onPress: () => {
            // 模擬拍照
            const mockImage = {
              uri: 'https://via.placeholder.com/400x600/1A1F71/FFFFFF?text=Card+Photo',
              width: 400,
              height: 600
            };
            if (side === 'front') {
              setFrontImage(mockImage);
            } else {
              setBackImage(mockImage);
            }
          }
        },
        {
          text: t('common.gallery'),
          onPress: () => {
            // 模擬從相簿選擇
            const mockImage = {
              uri: 'https://via.placeholder.com/400x600/6C63FF/FFFFFF?text=Card+Photo',
              width: 400,
              height: 600
            };
            if (side === 'front') {
              setFrontImage(mockImage);
            } else {
              setBackImage(mockImage);
            }
          }
        },
        {
          text: t('common.cancel'),
          style: 'cancel'
        }
      ]
    );
  };

  const handleEvaluate = () => {
    if (!frontImage || !backImage) {
      Alert.alert(t('common.error'), t('centering.both_photos_required'));
      return;
    }

    setIsProcessing(true);
    
    // TODO: 實現真實的評估過程
    Alert.alert('功能提示', '置中評估功能需要真實API支援，請聯繫開發團隊');
    setIsProcessing(false);
  };

  const handleShare = () => {
    const shareUrl = `https://tcgassistant.com/centering/${randomId}`;
    const shareMessage = `${t('centering.share_message')}\n\n${t('centering.overall_score')}: ${evaluationResult.overallScore}%\n${t('centering.horizontal_centering')}: ${evaluationResult.horizontalCentering.score}%\n${t('centering.vertical_centering')}: ${evaluationResult.verticalCentering.score}%\n\n${shareUrl}`;
    
    Share.open({
      message: shareMessage,
      title: t('centering.share_title')
    });
  };

  const handleCopyId = () => {
    // 模擬複製功能
    Alert.alert(t('common.success'), t('centering.id_copied'));
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'perfect_centering':
        return COLORS.GRADE_PERFECT;
      case 'good_centering':
        return COLORS.GRADE_GOOD;
      case 'average_centering':
        return COLORS.GRADE_AVERAGE;
      case 'poor_centering':
        return COLORS.GRADE_POOR;
      default:
        return COLORS.GRADE_AVERAGE;
    }
  };

  const getGradeText = (grade) => {
    switch (grade) {
      case 'perfect_centering':
        return t('centering.perfect_centering');
      case 'good_centering':
        return t('centering.good_centering');
      case 'average_centering':
        return t('centering.average_centering');
      case 'poor_centering':
        return t('centering.poor_centering');
      default:
        return t('centering.average_centering');
    }
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.BACKGROUND_PRIMARY,
    backgroundGradientTo: COLORS.BACKGROUND_PRIMARY,
    color: (opacity = 1) => `rgba(26, 31, 113, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const radarData = {
    labels: [t('centering.print_quality'), t('centering.edge_quality'), t('centering.corner_quality'), t('centering.color_accuracy')],
    datasets: [
      {
        data: [
          evaluationResult?.analysis.printQuality || 0,
          evaluationResult?.analysis.edgeQuality || 0,
          evaluationResult?.analysis.cornerQuality || 0,
          evaluationResult?.analysis.colorAccuracy || 0,
        ],
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={COLORS.GRADIENT_PRIMARY}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('centering.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('centering.subtitle')}</Text>
      </LinearGradient>

      {/* 拍照區域 */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>{t('centering.upload_photos')}</Text>
        
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={[styles.photoButton, !frontImage && styles.photoButtonEmpty]}
            onPress={() => handleTakePhoto('front')}
          >
            {frontImage ? (
              <Image source={frontImage} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera" size={40} color={COLORS.GRAY_LIGHT} />
                <Text style={styles.photoPlaceholderText}>{t('centering.front_photo')}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.photoButton, !backImage && styles.photoButtonEmpty]}
            onPress={() => handleTakePhoto('back')}
          >
            {backImage ? (
              <Image source={backImage} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera" size={40} color={COLORS.GRAY_LIGHT} />
                <Text style={styles.photoPlaceholderText}>{t('centering.back_photo')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.evaluateButton, (!frontImage || !backImage) && styles.evaluateButtonDisabled]}
          onPress={handleEvaluate}
          disabled={!frontImage || !backImage || isProcessing}
        >
          <LinearGradient
            colors={(!frontImage || !backImage) ? [COLORS.GRAY_LIGHT, COLORS.GRAY_LIGHT] : COLORS.GRADIENT_PRIMARY}
            style={styles.evaluateButtonGradient}
          >
            <Text style={styles.evaluateButtonText}>
              {isProcessing ? t('centering.processing') : t('centering.evaluate')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 評估結果 */}
      {evaluationResult && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>{t('centering.evaluation_result')}</Text>
          
          {/* 整體分數 */}
          <View style={styles.overallScoreCard}>
            <LinearGradient
              colors={COLORS.GRADIENT_PRIMARY}
              style={styles.overallScoreGradient}
            >
              <Text style={styles.overallScoreLabel}>{t('centering.overall_score')}</Text>
              <Text style={styles.overallScoreValue}>{evaluationResult.overallScore}%</Text>
              <Text style={styles.overallScoreGrade}>
                {getGradeText(evaluationResult.grade)}
              </Text>
            </LinearGradient>
          </View>

          {/* 水平置中 */}
          <View style={styles.centeringCard}>
            <Text style={styles.centeringTitle}>{t('centering.horizontal_centering')}</Text>
            <View style={styles.centeringBar}>
              <View style={styles.centeringBarContainer}>
                <View style={[styles.centeringBarLeft, { flex: evaluationResult.horizontalCentering.left }]} />
                <View style={[styles.centeringBarRight, { flex: evaluationResult.horizontalCentering.right }]} />
              </View>
              <View style={styles.centeringBarLabels}>
                <Text style={styles.centeringBarLabel}>
                  {t('centering.left_percentage')}: {evaluationResult.horizontalCentering.left}%
                </Text>
                <Text style={styles.centeringBarLabel}>
                  {t('centering.right_percentage')}: {evaluationResult.horizontalCentering.right}%
                </Text>
              </View>
            </View>
            <Text style={styles.centeringScore}>
              {t('centering.score')}: {evaluationResult.horizontalCentering.score}%
            </Text>
          </View>

          {/* 垂直置中 */}
          <View style={styles.centeringCard}>
            <Text style={styles.centeringTitle}>{t('centering.vertical_centering')}</Text>
            <View style={styles.centeringBar}>
              <View style={styles.centeringBarContainer}>
                <View style={[styles.centeringBarTop, { flex: evaluationResult.verticalCentering.top }]} />
                <View style={[styles.centeringBarBottom, { flex: evaluationResult.verticalCentering.bottom }]} />
              </View>
              <View style={styles.centeringBarLabels}>
                <Text style={styles.centeringBarLabel}>
                  {t('centering.top_percentage')}: {evaluationResult.verticalCentering.top}%
                </Text>
                <Text style={styles.centeringBarLabel}>
                  {t('centering.bottom_percentage')}: {evaluationResult.verticalCentering.bottom}%
                </Text>
              </View>
            </View>
            <Text style={styles.centeringScore}>
              {t('centering.score')}: {evaluationResult.verticalCentering.score}%
            </Text>
          </View>

          {/* 雷達圖 */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('centering.quality_analysis')}</Text>
            <RadarChart
              data={radarData}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.radarChart}
            />
          </View>

          {/* 信心度 */}
          <View style={styles.confidenceCard}>
            <Text style={styles.confidenceTitle}>{t('centering.confidence')}</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceBarFill, { width: `${evaluationResult.confidence}%` }]} />
            </View>
            <Text style={styles.confidenceValue}>{evaluationResult.confidence}%</Text>
          </View>

          {/* 分享和ID */}
          <View style={styles.actionCard}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <MaterialCommunityIcons name="share-variant" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.actionButtonText}>{t('common.share')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleCopyId}>
                <MaterialCommunityIcons name="content-copy" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.actionButtonText}>{t('common.copy')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>{t('common.query_id')}:</Text>
              <Text style={styles.idValue}>{randomId}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 圖片預覽模態框 */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowImageModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            {selectedImage && (
              <Image source={selectedImage} style={styles.modalImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>

      {/* 載入遮罩 */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <MaterialCommunityIcons name="loading" size={40} color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>{t('centering.processing')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.9,
  },
  photoSection: {
    padding: 20,
  },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoButton: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoButtonEmpty: {
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.GRAY_LIGHT,
    marginTop: 10,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  evaluateButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  evaluateButtonDisabled: {
    opacity: 0.6,
  },
  evaluateButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  evaluateButtonText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  resultSection: {
    padding: 20,
  },
  overallScoreCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallScoreGradient: {
    padding: 30,
    alignItems: 'center',
  },
  overallScoreLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  overallScoreValue: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  overallScoreGrade: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  centeringCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centeringTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  centeringBar: {
    marginBottom: 15,
  },
  centeringBarContainer: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  centeringBarLeft: {
    backgroundColor: COLORS.PRIMARY,
  },
  centeringBarRight: {
    backgroundColor: COLORS.SECONDARY,
  },
  centeringBarTop: {
    backgroundColor: COLORS.PRIMARY,
  },
  centeringBarBottom: {
    backgroundColor: COLORS.SECONDARY,
  },
  centeringBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeringBarLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  centeringScore: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  radarChart: {
    borderRadius: 15,
  },
  confidenceCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confidenceTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  confidenceBar: {
    height: 10,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 5,
    marginBottom: 10,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 5,
  },
  confidenceValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  actionButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
  },
  idLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 10,
  },
  idValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 15,
  },
});

export default CenteringEvaluationScreen;
