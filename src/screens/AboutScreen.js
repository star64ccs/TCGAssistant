import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 常數
import { COLORS, APP_CONFIG } from '../constants';

const AboutScreen = ({ navigation }) => {
  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const handleContact = () => {
    Linking.openURL('mailto:contact@tcgassistant.com');
  };

  const appInfo = {
    name: APP_CONFIG.NAME,
    version: APP_CONFIG.VERSION,
    buildNumber: APP_CONFIG.BUILD_NUMBER,
    description: 'TCG 助手是一款專業的卡牌辨識與分析工具，為卡牌收藏家和投資者提供全方位的服務。',
    features: [      'AI 驅動的卡牌辨識',      '專業的置中評估',      '真偽檢測技術',      '價格分析與預測',      '收藏管理功能',      '機器學習分析',      '投資建議系統',
    ],
    developer: {      name: 'TCG Assistant Team',      email: 'contact@tcgassistant.com',      website: 'https://tcgassistant.com',      github: 'https://github.com/tcgassistant',
    },
    acknowledgments: [      '感謝所有為本專案做出貢獻的開發者',      '感謝提供卡牌資料的合作夥伴',      '感謝用戶的寶貴反饋和建議',
    ],
  };

  const renderHeader = () => {
    return (      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>關於</Text>        <View style={{ width: 24 }} />      </View>
    );
  };

  const renderAppInfo = () => {
    return (      <View style={styles.section}>        <View style={styles.appLogoContainer}>          <Image source={require('../assets/icon.png')} style={styles.appLogo} />          <Text style={styles.appName}>{appInfo.name}</Text>          <Text style={styles.appVersion}>版本 {appInfo.version} (Build {appInfo.buildNumber})</Text>        </View>        <Text style={styles.description}>{appInfo.description}</Text>      </View>
    );
  };

  const renderFeatures = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>主要功能</Text>        {appInfo.features.map((feature, index) => (          <View key={index} style={styles.featureItem}>            <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />            <Text style={styles.featureText}>{feature}</Text>          </View>        ))}      </View>
    );
  };

  const renderDeveloperInfo = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>開發者資訊</Text>        <View style={styles.developerCard}>          <Text style={styles.developerName}>{appInfo.developer.name}</Text>          <TouchableOpacity            style={styles.contactItem}            onPress={() => handleContact()}          >            <Ionicons name="mail-outline" size={20} color={COLORS.PRIMARY} />            <Text style={styles.contactText}>{appInfo.developer.email}</Text>          </TouchableOpacity>          <TouchableOpacity            style={styles.contactItem}            onPress={() => handleOpenLink(appInfo.developer.website)}          >            <Ionicons name="globe-outline" size={20} color={COLORS.PRIMARY} />            <Text style={styles.contactText}>{appInfo.developer.website}</Text>          </TouchableOpacity>          <TouchableOpacity            style={styles.contactItem}            onPress={() => handleOpenLink(appInfo.developer.github)}          >            <Ionicons name="logo-github" size={20} color={COLORS.PRIMARY} />            <Text style={styles.contactText}>GitHub 專案</Text>          </TouchableOpacity>        </View>      </View>
    );
  };

  const renderAcknowledgments = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>致謝</Text>        {appInfo.acknowledgments.map((acknowledgment, index) => (          <View key={index} style={styles.acknowledgmentItem}>            <Ionicons name="heart" size={16} color={COLORS.ERROR} />            <Text style={styles.acknowledgmentText}>{acknowledgment}</Text>          </View>        ))}      </View>
    );
  };

  const renderLegalLinks = () => {
    return (      <View style={styles.section}>        <Text style={styles.sectionTitle}>法律條款</Text>        <TouchableOpacity          style={styles.legalItem}          onPress={() => navigation.navigate('PrivacyPolicy')}        >          <Ionicons name="shield-outline" size={20} color={COLORS.PRIMARY} />          <Text style={styles.legalText}>隱私政策</Text>          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />        </TouchableOpacity>        <TouchableOpacity          style={styles.legalItem}          onPress={() => navigation.navigate('TermsOfService')}        >          <Ionicons name="document-text-outline" size={20} color={COLORS.PRIMARY} />          <Text style={styles.legalText}>服務條款</Text>          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />        </TouchableOpacity>      </View>
    );
  };

  const renderFooter = () => {
    return (      <View style={styles.footer}>        <Text style={styles.footerText}>          © 2024 TCG Assistant. 保留所有權利。        </Text>        <Text style={styles.footerSubtext}>          由 AI 技術驅動，為卡牌愛好者而生        </Text>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      {renderHeader()}      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {renderAppInfo()}        {renderFeatures()}        {renderDeveloperInfo()}        {renderAcknowledgments()}        {renderLegalLinks()}        {renderFooter()}      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  acknowledgmentItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  acknowledgmentText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  appLogo: {
    borderRadius: 20,
    height: 80,
    marginBottom: 15,
    width: 80,
  },
  appLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  contactItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  description: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  developerCard: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    padding: 20,
  },
  developerName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  featureText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  footerSubtext: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 12,
    textAlign: 'center',
  },
  footerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
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
  legalItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  legalText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
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
});

export default AboutScreen;
