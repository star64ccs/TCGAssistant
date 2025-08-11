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
import { removeFromCollection, updateCollectionItem } from '../store/slices/collectionSlice';

// 常數
import { COLORS, ROUTES, CARD_GRADES } from '../constants';

const CollectionDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const card = route.params?.card || {};
  const {
    id,
    cardName,
    cardImage,
    cardType,
    rarity,
    set,
    price,
    centeringScore,
    authenticityScore,
    grade,
    addedAt,
    notes,
  } = card;

  const handleRemoveFromCollection = () => {
    Alert.alert(      '移除收藏',      '確定要從收藏中移除這張卡牌嗎？',      [        { text: '取消', style: 'cancel' },        {          text: '移除',          style: 'destructive',          onPress: async () => {            try {              await dispatch(removeFromCollection(id)).unwrap();              Alert.alert('成功', '已從收藏中移除');              navigation.goBack();            } catch (error) {              Alert.alert('錯誤', '移除失敗，請稍後再試');            }          },        },      ],
    );
  };

  const handleShare = async () => {
    try {      const shareMessage = `我的收藏：${cardName}\n類型：${cardType}\n稀有度：${rarity}\n系列：${set}\n價格：$${price}`;      await Share.share({        message: shareMessage,        title: 'TCG 助手 - 收藏分享',      });
    } catch (error) {}
  };

  const handleEditNotes = () => {
    Alert.prompt(      '編輯備註',      '請輸入備註：',      [        { text: '取消', style: 'cancel' },        {          text: '保存',          onPress: async (newNotes) => {            try {              await dispatch(updateCollectionItem({                id,                notes: newNotes,              })).unwrap();              Alert.alert('成功', '備註已更新');            } catch (error) {              Alert.alert('錯誤', '更新失敗，請稍後再試');            }          },        },      ],      'plain-text',      notes || '',
    );
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

  const renderCardImage = () => {
    return (      <View style={styles.cardImageContainer}>        <Image source={{ uri: cardImage }} style={styles.cardImage} />        {grade ? <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>            <Text style={styles.gradeText}>{grade}</Text>          </View> : null}      </View>
    );
  };

  const renderCardInfo = () => {
    return (      <View style={styles.cardInfoContainer}>        <Text style={styles.cardName}>{cardName}</Text>        <View style={styles.cardDetails}>          <View style={styles.detailItem}>            <Text style={styles.detailLabel}>類型</Text>            <Text style={styles.detailValue}>{cardType}</Text>          </View>          <View style={styles.detailItem}>            <Text style={styles.detailLabel}>稀有度</Text>            <Text style={styles.detailValue}>{rarity}</Text>          </View>          <View style={styles.detailItem}>            <Text style={styles.detailLabel}>系列</Text>            <Text style={styles.detailValue}>{set}</Text>          </View>        </View>      </View>
    );
  };

  const renderScores = () => {
    return (      <View style={styles.scoresContainer}>        <Text style={styles.sectionTitle}>評分資訊</Text>        <View style={styles.scoresGrid}>          {centeringScore ? <View style={styles.scoreItem}>              <Text style={styles.scoreLabel}>置中評分</Text>              <Text style={styles.scoreValue}>{centeringScore}/10</Text>            </View> : null}          {authenticityScore ? <View style={styles.scoreItem}>              <Text style={styles.scoreLabel}>真偽評分</Text>              <Text style={styles.scoreValue}>{authenticityScore}/10</Text>            </View> : null}          {price ? <View style={styles.scoreItem}>              <Text style={styles.scoreLabel}>當前價格</Text>              <Text style={styles.priceValue}>${price}</Text>            </View> : null}        </View>      </View>
    );
  };

  const renderNotes = () => {
    return (      <View style={styles.notesContainer}>        <View style={styles.notesHeader}>          <Text style={styles.sectionTitle}>備註</Text>          <TouchableOpacity onPress={handleEditNotes}>            <Ionicons name="create-outline" size={20} color={COLORS.PRIMARY} />          </TouchableOpacity>        </View>        <View style={styles.notesContent}>          {notes ? (            <Text style={styles.notesText}>{notes}</Text>          ) : (            <Text style={styles.noNotesText}>點擊編輯按鈕添加備註</Text>          )}        </View>      </View>
    );
  };

  const renderCollectionInfo = () => {
    return (      <View style={styles.collectionInfoContainer}>        <Text style={styles.sectionTitle}>收藏資訊</Text>        <View style={styles.infoItem}>          <Text style={styles.infoLabel}>加入時間</Text>          <Text style={styles.infoValue}>            {new Date(addedAt).toLocaleDateString()}          </Text>        </View>        <View style={styles.infoItem}>          <Text style={styles.infoLabel}>收藏 ID</Text>          <Text style={styles.infoValue}>{id}</Text>        </View>      </View>
    );
  };

  const renderActionButtons = () => {
    return (      <View style={styles.actionButtons}>        <TouchableOpacity          style={[styles.actionButton, styles.analyzeButton]}          onPress={() => navigation.navigate(ROUTES.CARD_RECOGNITION, { cardName })}        >          <Ionicons name="camera-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>重新分析</Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.priceButton]}          onPress={() => navigation.navigate(ROUTES.PRICE_PREDICTION, { cardName })}        >          <Ionicons name="trending-up-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>價格分析</Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.removeButton]}          onPress={handleRemoveFromCollection}        >          <Ionicons name="trash-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>移除收藏</Text>        </TouchableOpacity>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>收藏詳情</Text>        <TouchableOpacity onPress={handleShare}>          <Ionicons name="share-outline" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 卡牌圖片 */}        {renderCardImage()}        {/* 卡牌資訊 */}        {renderCardInfo()}        {/* 評分資訊 */}        {renderScores()}        {/* 備註 */}        {renderNotes()}        {/* 收藏資訊 */}        {renderCollectionInfo()}      </ScrollView>      {/* 操作按鈕 */}      {renderActionButtons()}
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
    marginHorizontal: 3,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 12,
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
  analyzeButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    position: 'relative',
  },
  cardInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  collectionInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gradeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 50,
    top: 10,
  },
  gradeText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 12,
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
  infoItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 15,
  },
  infoLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noNotesText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontStyle: 'italic',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  notesContent: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    minHeight: 60,
    padding: 15,
  },
  notesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  notesText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
  },
  priceButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  priceValue: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: COLORS.ERROR,
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    padding: 15,
    width: '30%',
  },
  scoreLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 5,
  },
  scoreValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default CollectionDetailScreen;
