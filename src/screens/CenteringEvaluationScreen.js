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

import PlatformCamera from '../components/PlatformCamera';
import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import { FEATURES } from '../constants';
import centeringEvaluationService from '../services/centeringEvaluationService';

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
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [randomId] = useState(`CE_${ Date.now() }_${ Math.random().toString(36).substr(2, 9) }`);

  // 模擬評估結果
  const mockEvaluationResult = {
    overallScore: 85,
    horizontalCentering: {
      left: 48,
      right: 52,
      score: 90,
    },
    verticalCentering: {
      top: 51,
      bottom: 49,
      score: 80,
    },
    grade: 'good_centering',
    confidence: 92,
    analysis: {
      printQuality: 88,
      edgeQuality: 85,
      cornerQuality: 82,
      colorAccuracy: 90,
    },
  };

  const handleTakePhoto = (side) => {
  // 模擬拍照功能
    Alert.alert(
      t('centering.take_photo'),
      t('centering.select_photo_source'),
      [
        {
          text: t('common.camera'),
          onPress: async () => {
            try {
              // 使用真實攝像頭拍照
              const imageResult = await PlatformCamera.takePhoto({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 600,
                maxWidth: 400,
                quality: 0.8,
              });
              const realImage = {
                uri: imageResult.uri,
                width: imageResult.width || 400,
                height: imageResult.height || 600,
              };
              if (side === 'front') {
                setFrontImage(realImage);
              } else {
                setBackImage(realImage);
              }
            } catch (error) {
              // Fallback到模擬圖片
              const fallbackImage = {
                uri: require('../../assets/icon.png'),
                width: 400,
                height: 600,
              };
              if (side === 'front') {
                setFrontImage(fallbackImage);
              } else {
                setBackImage(fallbackImage);
              }
            }
          },
        },
        {
          text: t('common.gallery'),
          onPress: async () => {
            try {
              // 從相簿選擇真實圖片
              const imageResult = await PlatformCamera.selectFromGallery({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 600,
                maxWidth: 400,
                quality: 0.8,
              });
              const realImage = {
                uri: imageResult.uri,
                width: imageResult.width || 400,
                height: imageResult.height || 600,
              };
              if (side === 'front') {
                setFrontImage(realImage);
              } else {
                setBackImage(realImage);
              }
            } catch (error) {
              // Fallback到模擬圖片
              const fallbackImage = {
                uri: require('../../assets/icon.png'),
                width: 400,
                height: 600,
              };
              if (side === 'front') {
                setFrontImage(fallbackImage);
              } else {
                setBackImage(fallbackImage);
              }
            }
          },
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
    );
  };

  const handleEvaluate = async () => {
    if (!frontImage) {
      Alert.alert(t('common.error'), '請至少上傳正面照片');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('開始評估...');
    setProcessingProgress(0);

    try {
      // 呼叫真實的置中評估服務
      const result = await centeringEvaluationService.evaluateCardCentering(
        frontImage,
        backImage,
        {
          cardType: 'standard',
          gradingStandard: 'PSA',
          useRealApi: true,
          onProgress: (progress) => {
            setProcessingProgress(progress.progress);
            const stepNames = {
              'preprocessing': '預處理圖片...',
              'detection': '檢測卡牌邊界...',
              'analysis': '分析置中度...',
              'grading': '計算評級...',
              'completed': '評估完成！',
            };
            setProcessingStep(stepNames[progress.step] || progress.step);
          },
        },
      );
      if (result.success) {
        // 轉換結果格式以匹配原始介面
        const formattedResult = {
          id: result.data.id,
          overallScore: result.data.overallGrade.score,
          grade: result.data.overallGrade.grade,
          horizontalCentering: {
            left: result.data.frontSide.centering.horizontal.left,
            right: result.data.frontSide.centering.horizontal.right,
            score: result.data.frontSide.centering.horizontal.score,
          },
          verticalCentering: {
            top: result.data.frontSide.centering.vertical.top,
            bottom: result.data.frontSide.centering.vertical.bottom,
            score: result.data.frontSide.centering.vertical.score,
          },
          backSide: result.data.backSide ? {
            horizontalCentering: {
              left: result.data.backSide.centering.horizontal.left,
              right: result.data.backSide.centering.horizontal.right,
              score: result.data.backSide.centering.horizontal.score,
            },
            verticalCentering: {
              top: result.data.backSide.centering.vertical.top,
              bottom: result.data.backSide.centering.vertical.bottom,
              score: result.data.backSide.centering.vertical.score,
            },
          } : null,
          confidence: result.data.confidence,
          recommendations: result.data.recommendations,
          timestamp: result.data.timestamp,
          gradingStandard: result.data.gradingStandard,
        };
        setEvaluationResult(formattedResult);
        Alert.alert(
          '評估完成',
          `置中度評估已完成！\n整體評級：PSA ${formattedResult.grade}\n總分：${formattedResult.overallScore}%`,
          [{ text: '查看結果', style: 'default' }],
        );
      } else {
        throw new Error(result.error || '評估失敗');
      }
    } catch (error) {
      Alert.alert(
        '評估失敗',
        `無法完成置中評估：${error.message}\n\n將使用示範模式顯示結果。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '查看示範',
            onPress: () => {
              // 使用模擬數據作為備用
              setEvaluationResult(mockEvaluationResult);
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

  const handleShare = () => {
    const shareUrl = `https://tcgassistant.com/centering/${randomId}`;
    const shareMessage = `${t('centering.share_message')}\n\n${t('centering.overall_score')}: ${evaluationResult.overallScore}%\n${t('centering.horizontal_centering')}: ${evaluationResult.horizontalCentering.score}%\n${t('centering.vertical_centering')}: ${evaluationResult.verticalCentering.score}%\n\n${shareUrl}`;

    Share.open({
      message: shareMessage,
      title: t('centering.share_title'),
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
    color: (opacity = 1) => `rgba(26, 31, 113, ${opacity
    })`,
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
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity
        })`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={ styles.container } showsVerticalScrollIndicator={ false }>
      <LinearGradient
        colors={ COLORS.GRADIENT_PRIMARY }
        style={ styles.header }
      >
        <Text style={ styles.headerTitle }>{ t('centering.title') }</Text>
        <Text style={ styles.headerSubtitle }>{ t('centering.subtitle') }</Text>
      </LinearGradient>
      { /* 拍照區域 */ }
      <View style={ styles.photoSection }>
        <Text style={ styles.sectionTitle }>{ t('centering.upload_photos') }</Text>
        <View style={ styles.photoContainer }>
          <TouchableOpacity
            style={ [styles.photoButton, !frontImage && styles.photoButtonEmpty] }
            onPress={ () => handleTakePhoto('front') }
          >
            {
              frontImage ? (
                <Image source={frontImage
                } style={ styles.photoPreview } />
              ) : (
                <View style={ styles.photoPlaceholder }>
                  <MaterialCommunityIcons name="camera" size={ 40 } color={ COLORS.GRAY_LIGHT } />
                  <Text style={ styles.photoPlaceholderText }>{ t('centering.front_photo') }</Text>
                </View>
              )}
          </TouchableOpacity>
          <TouchableOpacity
            style={ [styles.photoButton, !backImage && styles.photoButtonEmpty] }
            onPress={ () => handleTakePhoto('back') }
          >
            {
              backImage ? (
                <Image source={backImage
                } style={ styles.photoPreview } />
              ) : (
                <View style={ styles.photoPlaceholder }>
                  <MaterialCommunityIcons name="camera" size={ 40 } color={ COLORS.GRAY_LIGHT } />
                  <Text style={ styles.photoPlaceholderText }>{ t('centering.back_photo') }</Text>
                </View>
              )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={ [styles.evaluateButton, (!frontImage || !backImage) && styles.evaluateButtonDisabled] }
          onPress={ handleEvaluate }
          disabled={ !frontImage || !backImage || isProcessing }
        >
          <LinearGradient
            colors={ (!frontImage || !backImage) ? [COLORS.GRAY_LIGHT, COLORS.GRAY_LIGHT] : COLORS.GRADIENT_PRIMARY }
            style={ styles.evaluateButtonGradient }
          >
            <Text style={ styles.evaluateButtonText }>
              { isProcessing ? t('centering.processing') : t('centering.evaluate') }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      { /* 評估結果 */ }
      {
        evaluationResult ? <View style={styles.resultSection
          }>
            <Text style={ styles.sectionTitle }>{ t('centering.evaluation_result') }</Text>
            { /* 整體分數 */ }
            <View style={ styles.overallScoreCard }>
              <LinearGradient
                colors={ COLORS.GRADIENT_PRIMARY }
                style={ styles.overallScoreGradient }
              >
                <Text style={ styles.overallScoreLabel }>{ t('centering.overall_score') }</Text>
                <Text style={ styles.overallScoreValue }>{ evaluationResult.overallScore }%</Text>
                <Text style={ styles.overallScoreGrade }>
                  { getGradeText(evaluationResult.grade) }
                </Text>
              </LinearGradient>
            </View>
            { /* 水平置中 */ }
            <View style={ styles.centeringCard }>
              <Text style={ styles.centeringTitle }>{ t('centering.horizontal_centering') }</Text>
              <View style={ styles.centeringBar }>
                <View style={ styles.centeringBarContainer }>
                  <View style={ [styles.centeringBarLeft, { flex: evaluationResult.horizontalCentering.left }]} />
                  <View style={ [styles.centeringBarRight, { flex: evaluationResult.horizontalCentering.right }]} />
                </View>
                <View style={ styles.centeringBarLabels }>
                  <Text style={ styles.centeringBarLabel }>
                    { t('centering.left_percentage') }: { evaluationResult.horizontalCentering.left }%
                  </Text>
                  <Text style={ styles.centeringBarLabel }>
                    { t('centering.right_percentage') }: { evaluationResult.horizontalCentering.right }%
                  </Text>
                </View>
              </View>
              <Text style={ styles.centeringScore }>
                { t('centering.score') }: { evaluationResult.horizontalCentering.score }%
              </Text>
            </View>
            { /* 垂直置中 */ }
            <View style={ styles.centeringCard }>
              <Text style={ styles.centeringTitle }>{ t('centering.vertical_centering') }</Text>
              <View style={ styles.centeringBar }>
                <View style={ styles.centeringBarContainer }>
                  <View style={ [styles.centeringBarTop, { flex: evaluationResult.verticalCentering.top }]} />
                  <View style={ [styles.centeringBarBottom, { flex: evaluationResult.verticalCentering.bottom }]} />
                </View>
                <View style={ styles.centeringBarLabels }>
                  <Text style={ styles.centeringBarLabel }>
                    { t('centering.top_percentage') }: { evaluationResult.verticalCentering.top }%
                  </Text>
                  <Text style={ styles.centeringBarLabel }>
                    { t('centering.bottom_percentage') }: { evaluationResult.verticalCentering.bottom }%
                  </Text>
                </View>
              </View>
              <Text style={ styles.centeringScore }>
                { t('centering.score') }: { evaluationResult.verticalCentering.score }%
              </Text>
            </View>
            { /* 雷達圖 */ }
            <View style={ styles.chartCard }>
              <Text style={ styles.chartTitle }>{ t('centering.quality_analysis') }</Text>
              <RadarChart
                data={ radarData }
                width={ width - 60 }
                height={ 220 }
                chartConfig={ chartConfig }
                bezier
                style={ styles.radarChart }
              />
            </View>
            { /* 信心度 */ }
            <View style={ styles.confidenceCard }>
              <Text style={ styles.confidenceTitle }>{ t('centering.confidence') }</Text>
              <View style={ styles.confidenceBar }>
                <View style={ [styles.confidenceBarFill, { width: `${evaluationResult.confidence }%` }]} />
              </View>
              <Text style={ styles.confidenceValue }>{ evaluationResult.confidence }%</Text>
            </View>
            { /* 分享和ID */ }
            <View style={ styles.actionCard }>
              <View style={ styles.actionRow }>
                <TouchableOpacity style={ styles.actionButton } onPress={ handleShare }>
                  <MaterialCommunityIcons name="share-variant" size={ 24 } color={ COLORS.PRIMARY } />
                  <Text style={ styles.actionButtonText }>{ t('common.share') }</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ styles.actionButton } onPress={ handleCopyId }>
                  <MaterialCommunityIcons name="content-copy" size={ 24 } color={ COLORS.PRIMARY } />
                  <Text style={ styles.actionButtonText }>{ t('common.copy') }</Text>
                </TouchableOpacity>
              </View>
              <View style={ styles.idContainer }>
                <Text style={ styles.idLabel }>{ t('common.query_id') }:</Text>
                <Text style={ styles.idValue }>{ randomId }</Text>
              </View>
            </View>
          </View> : null}
      { /* 圖片預覽模態框 */ }
      <Modal
        visible={ showImageModal }
        transparent={ true }
        animationType="fade"
        onRequestClose={ () => setShowImageModal(false) }
      >
        <View style={ styles.modalOverlay }>
          <View style={ styles.modalContent }>
            <TouchableOpacity
              style={ styles.modalCloseButton }
              onPress={ () => setShowImageModal(false) }
            >
              <MaterialCommunityIcons name="close" size={ 24 } color={ COLORS.WHITE } />
            </TouchableOpacity>
            {
              selectedImage ? <Image source={selectedImage
                } style={ styles.modalImage } resizeMode="contain" /> : null}
          </View>
        </View>
      </Modal>
      { /* 載入遮罩 */ }
      {
        isProcessing ? <View style={styles.loadingOverlay}>
            <View style={ styles.loadingCard }>
              <MaterialCommunityIcons name="loading" size={ 40 } color={ COLORS.PRIMARY } />
              <Text style={ styles.loadingText }>
                {processingStep || t('centering.processing')}
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
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  centeringBar: { marginBottom: 15 },
  centeringBarBottom: { backgroundColor: COLORS.SECONDARY },
  centeringBarContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    height: 20,
    marginBottom: 10,
    overflow: 'hidden',
  },
  centeringBarLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  centeringBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeringBarLeft: { backgroundColor: COLORS.PRIMARY },
  centeringBarRight: { backgroundColor: COLORS.SECONDARY },
  centeringBarTop: { backgroundColor: COLORS.PRIMARY },
  centeringCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centeringScore: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeringTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  confidenceBar: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 5,
    height: 10,
    marginBottom: 10,
  },
  confidenceBarFill: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 5,
    height: '100%',
  },
  confidenceCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confidenceTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  confidenceValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    flex: 1,
  },
  evaluateButton: {
    borderRadius: 15,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  evaluateButtonDisabled: { opacity: 0.6 },
  evaluateButtonGradient: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  evaluateButtonText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    marginBottom: 8,
    textAlign: 'center',
  },
  idContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  idLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 10,
  },
  idValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 5,
    padding: 30,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalCloseButton: {
    alignItems: 'center',
    backgroundColor: COLORS.BLACK,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 15,
    top: 15,
    width: 40,
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    height: '80%',
    overflow: 'hidden',
    width: '90%',
  },
  modalImage: {
    height: '100%',
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
  },
  overallScoreCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallScoreGrade: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  overallScoreGradient: {
    alignItems: 'center',
    padding: 30,
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
  photoButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    height: 200,
    overflow: 'hidden',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: (width - 60) / 2,
  },
  photoButtonEmpty: {
    borderColor: COLORS.GRAY_LIGHT,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.GRAY_LIGHT,
    marginTop: 10,
  },
  photoPreview: {
    height: '100%',
    width: '100%',
  },
  photoSection: { padding: 20 },
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
  radarChart: { borderRadius: 15 },
  resultSection: { padding: 20 },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
});

export default CenteringEvaluationScreen;
