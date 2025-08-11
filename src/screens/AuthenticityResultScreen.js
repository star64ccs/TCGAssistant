import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { saveToCollection, addToSearchHistory } from '../store/slices/collectionSlice';

// 常數
import { COLORS, ROUTES } from '../constants';

const AuthenticityResultScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const result = route.params?.result || {};
  const {
    cardName,
    cardImage,
    authenticityScore,
    isAuthentic,
    confidence,
    analysis,
    redFlags,
    recommendations,
    marketValue,
  } = result;

  useEffect(() => {
    if (result && Object.keys(result).length > 0) {      // 添加到搜尋歷史      dispatch(addToSearchHistory({        type: 'authenticity',        cardName,        timestamp: new Date().toISOString(),        result,      }));
    }
  }, [result]);

  const handleSaveToCollection = async () => {
    if (!user) {      Alert.alert('需要登入', '請先登入以保存到收藏');      return;
    }    setIsLoading(true);
    try {      await dispatch(saveToCollection({        cardName,        cardImage,        authenticityScore,        isAuthentic,        marketValue,        addedAt: new Date().toISOString(),      })).unwrap();      Alert.alert('成功', '已保存到收藏');
    } catch (error) {      Alert.alert('錯誤', '保存失敗，請稍後再試');
    } finally {      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {      const authenticityStatus = isAuthentic ? '真品' : '疑似假貨';      const shareMessage = `我在 TCG 助手中檢測了這張卡牌的真偽：${cardName}\n真偽評分：${authenticityScore}/10\n結果：${authenticityStatus}\n信心度：${Math.round(confidence * 100)}%`;      await Share.share({        message: shareMessage,        title: 'TCG 助手 - 真偽判斷結果',      });
    } catch (error) {}
  };

  const getAuthenticityColor = (score) => {
    if (score >= 8) {
      return COLORS.SUCCESS;
    }
    if (score >= 6) {
      return COLORS.WARNING;
    }
    return COLORS.ERROR;
  };

  const getAuthenticityIcon = (isAuthentic) => {
    return isAuthentic ? 'checkmark-circle' : 'close-circle';
  };

  const renderAuthenticityResult = () => {
    return (      <View style={styles.resultContainer}>        <View style={styles.resultHeader}>          <Ionicons            name={getAuthenticityIcon(isAuthentic)}            size={60}            color={getAuthenticityColor(authenticityScore)}          />          <Text style={[styles.resultTitle, { color: getAuthenticityColor(authenticityScore) }]}>            {isAuthentic ? '真品' : '疑似假貨'}          </Text>        </View>        <View style={styles.scoreContainer}>          <Text style={styles.scoreLabel}>真偽評分</Text>          <Text style={[styles.scoreValue, { color: getAuthenticityColor(authenticityScore) }]}>            {authenticityScore}/10          </Text>          <Text style={styles.confidenceText}>            信心度: {Math.round(confidence * 100)}%          </Text>        </View>      </View>
    );
  };

  const renderAnalysis = () => {
    if (!analysis) {
      return null;
    }    return (      <View style={styles.analysisContainer}>        <Text style={styles.sectionTitle}>詳細分析</Text>        {Object.entries(analysis).map(([aspect, details]) => (          <View key={aspect} style={styles.analysisItem}>            <View style={styles.analysisHeader}>              <Text style={styles.aspectName}>{aspect}</Text>              <View style={styles.aspectScore}>                <Text style={styles.aspectScoreText}>{details.score}/10</Text>                <View style={[styles.aspectScoreBar, { width: `${details.score * 10}%` }]} />              </View>            </View>            <Text style={styles.aspectDescription}>{details.description}</Text>            {details.issues && details.issues.length > 0 ? <View style={styles.issuesContainer}>                {details.issues.map((issue, index) => (                  <View key={index} style={styles.issueItem}>                    <Ionicons name="warning-outline" size={14} color={COLORS.WARNING} />                    <Text style={styles.issueText}>{issue}</Text>                  </View>                ))}              </View> : null}          </View>        ))}      </View>
    );
  };

  const renderRedFlags = () => {
    if (!redFlags || redFlags.length === 0) {
      return null;
    }    return (      <View style={styles.redFlagsContainer}>        <Text style={styles.sectionTitle}>警告標誌</Text>        {redFlags.map((flag, index) => (          <View key={index} style={styles.redFlagItem}>            <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />            <Text style={styles.redFlagText}>{flag}</Text>          </View>        ))}      </View>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return null;
    }    return (      <View style={styles.recommendationsContainer}>        <Text style={styles.sectionTitle}>建議</Text>        {recommendations.map((recommendation, index) => (          <View key={index} style={styles.recommendationItem}>            <Ionicons              name="bulb-outline"              size={16}              color={COLORS.PRIMARY}              style={styles.recommendationIcon}            />            <Text style={styles.recommendationText}>{recommendation}</Text>          </View>        ))}      </View>
    );
  };

  const renderMarketValue = () => {
    if (!marketValue) {
      return null;
    }    return (      <View style={styles.marketValueContainer}>        <Text style={styles.sectionTitle}>市場價值</Text>        <View style={styles.marketValueContent}>          <Text style={styles.marketValueLabel}>估計價值</Text>          <Text style={styles.marketValueAmount}>${marketValue}</Text>          <Text style={styles.marketValueNote}>            * 基於真偽評分的估計價值          </Text>        </View>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>真偽判斷結果</Text>        <TouchableOpacity onPress={handleShare}>          <Ionicons name="share-outline" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 卡牌圖片 */}        <View style={styles.cardImageContainer}>          <Image source={{ uri: cardImage }} style={styles.cardImage} />        </View>        {/* 卡牌名稱 */}        <View style={styles.cardInfoContainer}>          <Text style={styles.cardName}>{cardName}</Text>        </View>        {/* 真偽結果 */}        {renderAuthenticityResult()}        {/* 詳細分析 */}        {renderAnalysis()}        {/* 警告標誌 */}        {renderRedFlags()}        {/* 市場價值 */}        {renderMarketValue()}        {/* 建議 */}        {renderRecommendations()}      </ScrollView>      {/* 操作按鈕 */}      <View style={styles.actionButtons}>        <TouchableOpacity          style={[styles.actionButton, styles.saveButton]}          onPress={handleSaveToCollection}          disabled={isLoading}        >          <Ionicons name="bookmark-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>            {isLoading ? '保存中...' : '保存到收藏'}          </Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.retakeButton]}          onPress={() => navigation.navigate(ROUTES.AUTHENTICITY_CHECK)}        >          <Ionicons name="camera-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>重新檢測</Text>        </TouchableOpacity>      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 5,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  actionButtons: {
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  analysisContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  analysisHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  analysisItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  aspectDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  aspectName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  aspectScore: {
    alignItems: 'flex-end',
  },
  aspectScoreBar: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
    height: 4,
    width: 60,
  },
  aspectScoreText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardImage: {
    borderRadius: 10,
    height: 280,
    resizeMode: 'cover',
    width: 200,
  },
  cardImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
  },
  issueItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
  },
  issueText: {
    color: COLORS.WARNING,
    flex: 1,
    fontSize: 12,
    marginLeft: 5,
  },
  issuesContainer: {
    marginTop: 10,
  },
  marketValueAmount: {
    color: COLORS.PRIMARY,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  marketValueContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  marketValueContent: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    padding: 20,
  },
  marketValueLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginBottom: 5,
  },
  marketValueNote: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationItem: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  recommendationText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  redFlagItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  redFlagText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  redFlagsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  retakeButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default AuthenticityResultScreen;
