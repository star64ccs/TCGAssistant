import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// 互動式卡牌組件
const InteractiveCard = ({ card,
  onPress = null,
  onSwipeLeft = null,
  onSwipeRight = null,
  onLongPress = null,
  showActions = true,
  showPriceHistory = false,
  showAuthenticityBadge = true,
  enableSwipeGestures = false,
  enableFlipAnimation = true,
  style = {},
  ...props
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 卡牌翻轉動畫
  const performFlip = () => {
    if (!enableFlipAnimation) {
      return;
    }
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  // 按壓動畫
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 懸停動畫（觸摸時）
  const createHoverEffect = () => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
  };

  // 滑動手勢處理
  const handleSwipeGesture = (direction) => {
    const toValue = direction === 'left' ? -width : width;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft(card);
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight(card);
      }
      // 重置動畫
      translateX.setValue(0);
      opacity.setValue(1);
    });
  };

  // 獲取稀有度顏色
  const getRarityColor = (rarity) => {
    const rarityColors = {
      'Common': '#94A3B8',
      'Uncommon': '#10B981',
      'Rare': '#3B82F6',
      'Ultra Rare': '#8B5CF6',
      'Secret Rare': '#F59E0B',
      'Special': '#EF4444',
    };
    return rarityColors.rarity || '#94A3B8';
  };

  // 獲取品質評級顏色
  const getGradeColor = (grade) => {
    if (grade >= 9) {
      return '#10B981';
    } // 綠色
    if (grade >= 7) {
      return '#F59E0B';
    } // 橙色
    if (grade >= 5) {
      return '#EF4444';
    } // 紅色
    return '#94A3B8'; // 灰色
  };

  // 渲染真偽徽章
  const renderAuthenticityBadge = () => {
    if (!showAuthenticityBadge || !card.authenticity) {
      return null;
    }
    const isAuthentic = card.authenticity.isAuthentic;
    const confidence = card.authenticity.confidence;
    return (
      <View style={
        [
          styles.authenticityBadge,
          { backgroundColor: isAuthentic ? '#10B981' : '#EF4444',
          },
        ]}>
        <Icon
          name={ isAuthentic ? 'shield-check' : 'shield-alert' }
          size={ 14 }
          color="#FFFFFF"
        />
        <Text style={ styles.authenticityText }>
          { isAuthentic ? '真品' : '疑似' }
        </Text>
        <Text style={ styles.confidenceText }>
          { confidence }%
        </Text>
      </View>
    );
  };

  // 渲染價格歷史
  const renderPriceHistory = () => {
    if (!showPriceHistory || !card.priceHistory) {
      return null;
    }
    const latestPrice = card.priceHistory[card.priceHistory.length - 1];
    const previousPrice = card.priceHistory[card.priceHistory.length - 2];
    const change = latestPrice && previousPrice
      ? ((latestPrice.price - previousPrice.price) / previousPrice.price * 100)
      : 0;
    return (
      <View style={ styles.priceHistoryContainer }>
        <Text style={ styles.currentPrice }>
${ latestPrice?.price || 'N/A' }
        </Text>
        <View style={
          [
            styles.priceChange,
            { backgroundColor: change >= 0 ? '#10B981' : '#EF4444',
            },
          ]}>
          <Icon
            name={ change >= 0 ? 'trending-up' : 'trending-down' }
            size={ 12 }
            color="#FFFFFF"
          />
          <Text style={ styles.priceChangeText }>
            { Math.abs(change).toFixed(1) }%
          </Text>
        </View>
      </View>
    );
  };

  // 渲染動作按鈕
  const renderActionButtons = () => {
    if (!showActions) {
      return null;
    }
    return (
      <View style={ styles.actionContainer }>
        <TouchableOpacity
          style={ styles.actionButton }
          onPress={ () => setShowDetails(!showDetails) }
          activeOpacity={ 0.7 }
        >
          <Icon name="information" size={ 20 } color={ COLORS.primary } />
        </TouchableOpacity>
        <TouchableOpacity
          style={ styles.actionButton }
          onPress={ () => {/* 添加到收藏 */ }}
          activeOpacity={ 0.7 }
        >
          <Icon name="heart-outline" size={ 20 } color={ COLORS.primary } />
        </TouchableOpacity>
        <TouchableOpacity
          style={ styles.actionButton }
          onPress={ () => {/* 分享 */ }}
          activeOpacity={ 0.7 }
        >
          <Icon name="share-variant" size={ 20 } color={ COLORS.primary } />
        </TouchableOpacity>
        { enableFlipAnimation ? <TouchableOpacity
          style={styles.actionButton }
          onPress={ performFlip }
          activeOpacity={ 0.7 }
        >
          <Icon name="rotate-3d-variant" size={ 20 } color={ COLORS.primary } />
        </TouchableOpacity> : null}
      </View>
    );
  };

  // 渲染詳細信息
  const renderDetails = () => {
    if (!showDetails) {
      return null;
    }
    return (
      <Animated.View
        style={
          [
            styles.detailsContainer,
            {
              opacity: showDetails ? 1 : 0,
              transform: [{
                translateY: showDetails ? 0 : 20,
              }],
            },
          ]}
      >
        <Text style={ styles.detailTitle }>卡牌詳情</Text>
        <View style={ styles.detailRow }>
          <Text style={ styles.detailLabel }>編號:</Text>
          <Text style={ styles.detailValue }>{ card.number || 'N/A' }</Text>
        </View>
        <View style={ styles.detailRow }>
          <Text style={ styles.detailLabel }>稀有度:</Text>
          <View style={
            [
              styles.rarityBadge,
              { backgroundColor: getRarityColor(card.rarity),
              },
            ]}>
            <Text style={ styles.rarityText }>{ card.rarity || 'Unknown' }</Text>
          </View>
        </View>
        <View style={ styles.detailRow }>
          <Text style={ styles.detailLabel }>品質:</Text>
          <View style={
            [
              styles.gradeBadge,
              { backgroundColor: getGradeColor(card.grade),
              },
            ]}>
            <Text style={ styles.gradeText }>{ card.grade || 'N/A' }</Text>
          </View>
        </View>
        { card.setName ? <View style={styles.detailRow }>
          <Text style={ styles.detailLabel }>系列:</Text>
          <Text style={ styles.detailValue }>{ card.setName }</Text>
        </View> : null}
      </Animated.View>
    );
  };

  // 前面樣式
  const frontStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  // 背面樣式
  const backStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  // 主容器樣式
  const containerTransform = {
    transform: [
      { scale: scaleAnimation,
      },
      {
        rotate: rotateAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '2deg'],
        }),
      },
      { translateX },
      { translateY },
    ],
    opacity,
  };
  return (
    <Animated.View style={ [styles.container, containerTransform, style] }>
      <TouchableOpacity
        onPress={ onPress }
        onLongPress={ onLongPress }
        onPressIn={ handlePressIn }
        onPressOut={ handlePressOut }
        activeOpacity={ 0.9 }
        style={ styles.touchableContainer }
      >
        <LinearGradient
          colors={ ['#FFFFFF', '#F8FAFC'] }
          style={ styles.cardGradient }
          start={ { x: 0, y: 0 }}
          end={ { x: 1, y: 1 }}
        >
          { /* 卡牌正面 */ }
          <Animated.View style={ [styles.cardFace, frontStyle] }>
            <View style={ styles.imageContainer }>
              <Image
                source={ { uri: card.imageUrl }}
                style={ styles.cardImage }
                resizeMode="cover"
              />
              { renderAuthenticityBadge() }
            </View>
            <View style={ styles.cardInfo }>
              <Text style={ styles.cardName } numberOfLines={ 2 }>
                { card.name }
              </Text>
              { renderPriceHistory() }
            </View>
          </Animated.View>
          { /* 卡牌背面 */ }
          <Animated.View style={ [styles.cardFace, styles.cardBack, backStyle] }>
            <View style={ styles.backContent }>
              <Icon name="cards" size={ 48 } color={ COLORS.primary } />
              <Text style={ styles.backTitle }>TCG助手</Text>
              <Text style={ styles.backSubtitle }>專業卡牌管理</Text>
            </View>
          </Animated.View>
          { /* 懸停效果指示器 */ }
          { isPressed ? <View style={styles.hoverEffect }>
            <LinearGradient
              colors={ [`${COLORS.primary }20`, `${COLORS.primary }40`] }
              style={ styles.hoverGradient }
            />
          </View> : null}
        </LinearGradient>
        { renderActionButtons() }
      </TouchableOpacity>
      { renderDetails() }
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionContainer: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authenticityBadge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  authenticityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  backContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  backTitle: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
  },
  cardBack: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardFace: {
    backfaceVisibility: 'hidden',
    borderRadius: 16,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  cardInfo: { padding: 16 },
  cardName: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 9,
    marginLeft: 4,
  },
  container: {
    borderRadius: 16,
    elevation: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  currentPrice: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  gradeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hoverEffect: {
    borderRadius: 16,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hoverGradient: {
    borderRadius: 16,
    flex: 1,
  },
  imageContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  priceChange: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceChangeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceHistoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rarityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  touchableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
export default InteractiveCard;
