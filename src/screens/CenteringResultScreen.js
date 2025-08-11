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
import { COLORS, ROUTES, CARD_GRADES } from '../constants';

const CenteringResultScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const result = route.params?.result || {};
  const {
    cardName,
    cardImage,
    centeringScore,
    grade,
    analysis,
    recommendations,
    marketValue,
    priceImpact,
  } = result;

  useEffect(() => {
    if (result && Object.keys(result).length > 0) {      // 添加到搜尋歷史      dispatch(addToSearchHistory({        type: 'centering',        cardName,        timestamp: new Date().toISOString(),        result,      }));
    }
  }, [result]);

  const handleSaveToCollection = async () => {
    if (!user) {      Alert.alert('需要登入', '請先登入以保存到收藏');      return;
    }    setIsLoading(true);
    try {      await dispatch(saveToCollection({        cardName,        cardImage,        centeringScore,        grade,        marketValue,        addedAt: new Date().toISOString(),      })).unwrap();      Alert.alert('成功', '已保存到收藏');
    } catch (error) {      Alert.alert('錯誤', '保存失敗，請稍後再試');
    } finally {      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {      const shareMessage = `我在 TCG 助手中評估了這張卡牌的置中：${cardName}\n置中評分：${centeringScore}/10\n等級：${grade}\n市場價值：$${marketValue}`;      await Share.share({        message: shareMessage,        title: 'TCG 助手 - 置中評估結果',      });
    } catch (error) {}
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case CARD_GRADES.MINT:        return COLORS.SUCCESS;
      case CARD_GRADES.NM:        return COLORS.PRIMARY;
      case CARD_GRADES.LP:        return COLORS.WARNING;
      case CARD_GRADES.MP:        return COLORS.ERROR;
      case CARD_GRADES.HP:        return COLORS.ERROR;
      default:        return COLORS.TEXT_SECONDARY;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) {
      return COLORS.SUCCESS;
    }
    if (score >= 7) {
      return COLORS.PRIMARY;
    }
    if (score >= 5) {
      return COLORS.WARNING;
    }
    return COLORS.ERROR;
  };

  const renderScoreSection = () => {
    return (      <View style={styles.scoreContainer}>        <Text style={styles.scoreLabel}>置中評分</Text>        <View style={styles.scoreDisplay}>          <Text style={[styles.scoreValue, { color: getScoreColor(centeringScore) }]}>            {centeringScore}/10          </Text>          <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>            <Text style={styles.gradeText}>{grade}</Text>          </View>        </View>      </View>
    );
  };

  const renderAnalysisSection = () => {
    if (!analysis) {
      return null;
    }    return (      <View style={styles.analysisContainer}>        <Text style={styles.sectionTitle}>詳細分析</Text>        {Object.entries(analysis).map(([aspect, details]) => (          <View key={aspect} style={styles.analysisItem}>            <View style={styles.analysisHeader}>              <Text style={styles.aspectName}>{aspect}</Text>              <View style={styles.aspectScore}>                <Text style={styles.aspectScoreText}>{details.score}/10</Text>                <View style={[styles.aspectScoreBar, { width: `${details.score * 10}%` }]} />              </View>            </View>            <Text style={styles.aspectDescription}>{details.description}</Text>          </View>        ))}      </View>
    );
  };

  const renderMarketImpact = () => {
    if (!priceImpact) {
      return null;
    }    return (      <View style={styles.marketImpactContainer}>        <Text style={styles.sectionTitle}>市場影響</Text>        <View style={styles.marketImpactGrid}>          <View style={styles.marketImpactItem}>            <Text style={styles.marketImpactLabel}>當前價值</Text>            <Text style={styles.marketImpactValue}>${marketValue}</Text>          </View>          <View style={styles.marketImpactItem}>            <Text style={styles.marketImpactLabel}>價格影響</Text>            <Text style={[              styles.marketImpactValue,              { color: priceImpact > 0 ? COLORS.SUCCESS : COLORS.ERROR },            ]}>              {priceImpact > 0 ? '+' : ''}{priceImpact}%            </Text>          </View>        </View>      </View>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return null;
    }    return (      <View style={styles.recommendationsContainer}>        <Text style={styles.sectionTitle}>建議</Text>        {recommendations.map((recommendation, index) => (          <View key={index} style={styles.recommendationItem}>            <Ionicons              name="bulb-outline"              size={16}              color={COLORS.PRIMARY}              style={styles.recommendationIcon}            />            <Text style={styles.recommendationText}>{recommendation}</Text>          </View>        ))}      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>置中評估結果</Text>        <TouchableOpacity onPress={handleShare}>          <Ionicons name="share-outline" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 卡牌圖片 */}        <View style={styles.cardImageContainer}>          <Image source={{ uri: cardImage }} style={styles.cardImage} />        </View>        {/* 卡牌名稱 */}        <View style={styles.cardInfoContainer}>          <Text style={styles.cardName}>{cardName}</Text>        </View>        {/* 評分區域 */}        {renderScoreSection()}        {/* 詳細分析 */}        {renderAnalysisSection()}        {/* 市場影響 */}        {renderMarketImpact()}        {/* 建議 */}        {renderRecommendations()}      </ScrollView>      {/* 操作按鈕 */}      <View style={styles.actionButtons}>        <TouchableOpacity          style={[styles.actionButton, styles.saveButton]}          onPress={handleSaveToCollection}          disabled={isLoading}        >          <Ionicons name="bookmark-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>            {isLoading ? '保存中...' : '保存到收藏'}          </Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.retakeButton]}          onPress={() => navigation.navigate(ROUTES.CENTERING_EVALUATION)}        >          <Ionicons name="camera-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>重新評估</Text>        </TouchableOpacity>      </View>
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
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  gradeBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gradeText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 14,
    fontWeight: 'bold',
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
  marketImpactContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  marketImpactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketImpactItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    padding: 15,
    width: '48%',
  },
  marketImpactLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
  },
  marketImpactValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
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
  retakeButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
  },
  scoreDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scoreLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 15,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default CenteringResultScreen;
