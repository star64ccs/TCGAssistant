import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { upgradeMembership, cancelMembership } from '../store/slices/authSlice';

// 常數
import { COLORS, ROUTES, MEMBERSHIP_TYPES, MEMBERSHIP_FEATURES, FEATURES } from '../constants';

const MembershipScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, membership } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const membershipPlans = [
    {      type: MEMBERSHIP_TYPES.FREE,      name: '免費會員',      price: '免費',      period: '',      features: MEMBERSHIP_FEATURES[MEMBERSHIP_TYPES.FREE],      color: COLORS.TEXT_SECONDARY,      popular: false,
    },
    {      type: MEMBERSHIP_TYPES.VIP_TRIAL,      name: 'VIP 試用',      price: '免費',      period: '7天',      features: MEMBERSHIP_FEATURES[MEMBERSHIP_TYPES.VIP_TRIAL],      color: COLORS.PRIMARY,      popular: true,
    },
    {      type: MEMBERSHIP_TYPES.VIP_PAID,      name: 'VIP 會員',      price: '$9.99',      period: '月',      features: MEMBERSHIP_FEATURES[MEMBERSHIP_TYPES.VIP_PAID],      color: COLORS.SUCCESS,      popular: false,
    },
  ];

  const handleUpgrade = async (planType) => {
    if (planType === MEMBERSHIP_TYPES.FREE) {      Alert.alert('提示', '您已經是免費會員');      return;
    }    if (planType === membership.type) {      Alert.alert('提示', '您已經是此等級會員');      return;
    }    setIsLoading(true);
    try {      await dispatch(upgradeMembership(planType)).unwrap();      Alert.alert('成功', '會員升級成功！');
    } catch (error) {      Alert.alert('錯誤', '升級失敗，請稍後再試');
    } finally {      setIsLoading(false);
    }
  };

  const handleCancelMembership = () => {
    Alert.alert(      '取消會員',      '確定要取消 VIP 會員嗎？您將失去所有 VIP 功能。',      [        { text: '取消', style: 'cancel' },        {          text: '確定取消',          style: 'destructive',          onPress: async () => {            try {              await dispatch(cancelMembership()).unwrap();              Alert.alert('成功', '已取消 VIP 會員');            } catch (error) {              Alert.alert('錯誤', '取消失敗，請稍後再試');            }          },        },      ],
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@tcgassistant.com');
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case FEATURES.CARD_RECOGNITION:        return 'camera-outline';
      case FEATURES.CENTERING_EVALUATION:        return 'crop-outline';
      case FEATURES.AUTHENTICITY_CHECK:        return 'shield-checkmark-outline';
      case FEATURES.PRICE_ANALYSIS:        return 'trending-up-outline';
      case FEATURES.AI_PREDICTION:        return 'analytics-outline';
      case FEATURES.ML_ANALYSIS:        return 'brain-outline';
      case FEATURES.INVESTMENT_ADVICE:        return 'bulb-outline';
      case FEATURES.COLLECTION_MANAGEMENT:        return 'folder-outline';
      case FEATURES.SHARE_LINK:        return 'share-outline';
      case FEATURES.QUERY_HISTORY:        return 'time-outline';
      case FEATURES.AI_CHATBOT:        return 'chatbubble-outline';
      default:        return 'checkmark-outline';
    }
  };

  const getFeatureLabel = (feature) => {
    switch (feature) {
      case FEATURES.CARD_RECOGNITION:        return '卡牌辨識';
      case FEATURES.CENTERING_EVALUATION:        return '置中評估';
      case FEATURES.AUTHENTICITY_CHECK:        return '真偽判斷';
      case FEATURES.PRICE_ANALYSIS:        return '價格分析';
      case FEATURES.AI_PREDICTION:        return 'AI 價格預測';
      case FEATURES.ML_ANALYSIS:        return '機器學習分析';
      case FEATURES.INVESTMENT_ADVICE:        return '投資建議';
      case FEATURES.COLLECTION_MANAGEMENT:        return '收藏管理';
      case FEATURES.SHARE_LINK:        return '分享連結';
      case FEATURES.QUERY_HISTORY:        return '查詢歷史';
      case FEATURES.AI_CHATBOT:        return 'AI 助手';
      default:        return feature;
    }
  };

  const renderCurrentMembership = () => {
    const currentPlan = membershipPlans.find(plan => plan.type === membership.type);    return (      <View style={styles.currentMembershipContainer}>        <Text style={styles.sectionTitle}>當前會員</Text>        <View style={[styles.currentPlanCard, { borderColor: currentPlan.color }]}>          <View style={styles.planHeader}>            <View style={[styles.planBadge, { backgroundColor: currentPlan.color }]}>              <Text style={styles.planBadgeText}>{currentPlan.name}</Text>            </View>            {membership.expiryDate ? <Text style={styles.expiryDate}>                到期: {new Date(membership.expiryDate).toLocaleDateString()}              </Text> : null}          </View>          <View style={styles.featuresList}>            {currentPlan.features.map((feature, index) => (              <View key={index} style={styles.featureItem}>                <Ionicons name={getFeatureIcon(feature)} size={16} color={COLORS.SUCCESS} />                <Text style={styles.featureText}>{getFeatureLabel(feature)}</Text>              </View>            ))}          </View>          {membership.type !== MEMBERSHIP_TYPES.FREE && (            <TouchableOpacity              style={styles.cancelButton}              onPress={handleCancelMembership}            >              <Text style={styles.cancelButtonText}>取消會員</Text>            </TouchableOpacity>          )}        </View>      </View>
    );
  };

  const renderUpgradeOptions = () => {
    return (      <View style={styles.upgradeContainer}>        <Text style={styles.sectionTitle}>升級選項</Text>        {membershipPlans.map((plan, index) => (          <View key={index} style={styles.planCard}>            {plan.popular ? <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>                <Text style={styles.popularText}>最受歡迎</Text>              </View> : null}            <View style={styles.planInfo}>              <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>              <View style={styles.planPrice}>                <Text style={[styles.priceText, { color: plan.color }]}>{plan.price}</Text>                {plan.period ? <Text style={styles.periodText}>/{plan.period}</Text> : null}              </View>            </View>            <View style={styles.featuresList}>              {plan.features.map((feature, index) => (                <View key={index} style={styles.featureItem}>                  <Ionicons name={getFeatureIcon(feature)} size={16} color={COLORS.SUCCESS} />                  <Text style={styles.featureText}>{getFeatureLabel(feature)}</Text>                </View>              ))}            </View>            <TouchableOpacity              style={[                styles.upgradeButton,                { backgroundColor: plan.color },                plan.type === membership.type && styles.currentPlanButton,              ]}              onPress={() => handleUpgrade(plan.type)}              disabled={isLoading || plan.type === membership.type}            >              <Text style={styles.upgradeButtonText}>                {plan.type === membership.type ? '當前方案' : '選擇方案'}              </Text>            </TouchableOpacity>          </View>        ))}      </View>
    );
  };

  const renderSupportSection = () => {
    return (      <View style={styles.supportContainer}>        <Text style={styles.sectionTitle}>支援與幫助</Text>        <TouchableOpacity style={styles.supportItem} onPress={handleContactSupport}>          <Ionicons name="mail-outline" size={24} color={COLORS.PRIMARY} />          <Text style={styles.supportText}>聯絡客服</Text>          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />        </TouchableOpacity>        <TouchableOpacity          style={styles.supportItem}          onPress={() => navigation.navigate(ROUTES.SUPPORT)}        >          <Ionicons name="help-circle-outline" size={24} color={COLORS.PRIMARY} />          <Text style={styles.supportText}>常見問題</Text>          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />        </TouchableOpacity>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>會員中心</Text>        <View style={{ width: 24 }} />      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 當前會員 */}        {renderCurrentMembership()}        {/* 升級選項 */}        {renderUpgradeOptions()}        {/* 支援與幫助 */}        {renderSupportSection()}      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  currentMembershipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  currentPlanButton: {
    backgroundColor: COLORS.TEXT_LIGHT,
  },
  currentPlanCard: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
  },
  expiryDate: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    marginLeft: 8,
  },
  featuresList: {
    marginBottom: 15,
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
  periodText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginLeft: 2,
  },
  planBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  planBadgeText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginBottom: 15,
    padding: 20,
    position: 'relative',
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  planInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  popularBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'absolute',
    right: 20,
    top: -10,
  },
  popularText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  supportContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  supportItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  supportText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  upgradeButton: {
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});

export default MembershipScreen;
