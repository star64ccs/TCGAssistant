import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 常數
import { COLORS } from '../constants';

const SupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {      id: 1,      question: '如何使用卡牌辨識功能？',      answer: '點擊首頁的「辨識」按鈕，然後拍攝或選擇卡牌照片。系統會自動識別卡牌並顯示相關資訊。',
    },
    {      id: 2,      question: '置中評估的準確度如何？',      answer: '我們的置中評估使用先進的機器學習技術，準確度可達 95% 以上。建議在光線充足、角度正面的情況下拍攝。',
    },
    {      id: 3,      question: '真偽判斷功能可靠嗎？',      answer: '真偽判斷功能基於多項技術指標，包括印刷品質、材質分析等。但建議僅作為參考，重要交易仍需專業鑑定。',
    },
    {      id: 4,      question: '如何升級到 VIP 會員？',      answer: '前往「會員中心」頁面，選擇適合的會員方案進行升級。VIP 會員可享受更多功能和更高的使用限制。',
    },
    {      id: 5,      question: '價格預測的準確度如何？',      answer: '價格預測基於歷史數據和市場趨勢分析，但市場變化複雜，建議僅作為投資參考，不構成投資建議。',
    },
    {      id: 6,      question: '如何備份我的收藏數據？',      answer: '在「設定」頁面中，您可以找到數據備份選項。建議定期備份重要數據以防遺失。',
    },
    {      id: 7,      question: '應用程式支援哪些卡牌類型？',      answer: '目前支援寶可夢卡牌、海賊王卡牌等主流 TCG。我們會持續擴充支援的卡牌類型。',
    },
    {      id: 8,      question: '遇到技術問題怎麼辦？',      answer: '請先檢查網路連接和應用程式版本。如果問題持續，請聯絡我們的技術支援團隊。',
    },
  ];

  const supportOptions = [
    {      title: '聯絡客服',      description: '透過電子郵件聯絡我們的客服團隊',      icon: 'mail-outline',      action: () => handleContactSupport(),
    },
    {      title: '技術支援',      description: '獲得技術問題的專業協助',      icon: 'construct-outline',      action: () => handleTechnicalSupport(),
    },
    {      title: '意見回饋',      description: '分享您的使用體驗和建議',      icon: 'chatbubble-outline',      action: () => handleFeedback(),
    },
    {      title: '功能請求',      description: '建議新功能或改進現有功能',      icon: 'bulb-outline',      action: () => handleFeatureRequest(),
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@tcgassistant.com?subject=TCG助手支援請求');
  };

  const handleTechnicalSupport = () => {
    Linking.openURL('mailto:tech@tcgassistant.com?subject=技術支援請求');
  };

  const handleFeedback = () => {
    Linking.openURL('mailto:feedback@tcgassistant.com?subject=意見回饋');
  };

  const handleFeatureRequest = () => {
    Linking.openURL('mailto:features@tcgassistant.com?subject=功能請求');
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const renderHeader = () => {
    return (      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>支援與幫助</Text>        <View style={{ width: 24 }} />      </View>
    );
  };

  const renderSupportOptions = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>聯絡我們</Text>        {supportOptions.map((option, index) => (          <TouchableOpacity            key={index}            style={styles.supportOption}            onPress={option.action}          >            <View style={styles.optionIcon}>              <Ionicons name={option.icon} size={24} color={COLORS.PRIMARY} />            </View>            <View style={styles.optionContent}>              <Text style={styles.optionTitle}>{option.title}</Text>              <Text style={styles.optionDescription}>{option.description}</Text>            </View>            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />          </TouchableOpacity>        ))}      </View>
    );
  };

  const renderFAQs = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>常見問題</Text>        {faqs.map((faq) => (          <View key={faq.id} style={styles.faqItem}>            <TouchableOpacity              style={styles.faqQuestion}              onPress={() => toggleFAQ(faq.id)}            >              <Text style={styles.faqQuestionText}>{faq.question}</Text>              <Ionicons                name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}                size={20}                color={COLORS.TEXT_SECONDARY}              />            </TouchableOpacity>            {expandedFAQ === faq.id && (              <View style={styles.faqAnswer}>                <Text style={styles.faqAnswerText}>{faq.answer}</Text>              </View>            )}          </View>        ))}      </View>
    );
  };

  const renderQuickTips = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>使用技巧</Text>        <View style={styles.tipsContainer}>          <View style={styles.tipItem}>            <Ionicons name="camera-outline" size={20} color={COLORS.SUCCESS} />            <Text style={styles.tipText}>拍攝時保持光線充足，避免反光</Text>          </View>          <View style={styles.tipItem}>            <Ionicons name="crop-outline" size={20} color={COLORS.SUCCESS} />            <Text style={styles.tipText}>確保卡牌完整出現在畫面中</Text>          </View>          <View style={styles.tipItem}>            <Ionicons name="wifi-outline" size={20} color={COLORS.SUCCESS} />            <Text style={styles.tipText}>保持網路連接以獲得最佳體驗</Text>          </View>          <View style={styles.tipItem}>            <Ionicons name="refresh-outline" size={20} color={COLORS.SUCCESS} />            <Text style={styles.tipText}>定期更新應用程式以獲得新功能</Text>          </View>        </View>      </View>
    );
  };

  const renderEmergencyContact = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>緊急聯絡</Text>        <View style={styles.emergencyCard}>          <Text style={styles.emergencyTitle}>遇到緊急問題？</Text>          <Text style={styles.emergencyDescription}>            如果您遇到嚴重問題或需要立即協助，請直接聯絡我們的緊急支援團隊。          </Text>          <TouchableOpacity            style={styles.emergencyButton}            onPress={() => {              Alert.alert(                '緊急聯絡',                '請選擇聯絡方式：',                [                  { text: '取消', style: 'cancel' },                  { text: '電子郵件', onPress: () => Linking.openURL('mailto:emergency@tcgassistant.com') },                  { text: '撥打電話', onPress: () => Linking.openURL('tel:+1234567890') },                ],              );            }}          >            <Ionicons name="call-outline" size={20} color={COLORS.TEXT_WHITE} />            <Text style={styles.emergencyButtonText}>緊急聯絡</Text>          </TouchableOpacity>        </View>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      {renderHeader()}      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {renderSupportOptions()}        {renderQuickTips()}        {renderFAQs()}        {renderEmergencyContact()}      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emergencyButton: {
    alignItems: 'center',
    backgroundColor: COLORS.ERROR,
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emergencyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    padding: 20,
  },
  emergencyDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  emergencyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faqAnswer: {
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  faqAnswerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqQuestion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  faqQuestionText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
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
  optionContent: {
    flex: 1,
  },
  optionDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 15,
    width: 40,
  },
  optionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  supportOption: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  tipItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  tipsContainer: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    padding: 15,
  },
});

export default SupportScreen;
