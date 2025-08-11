import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 常數
import { COLORS } from '../constants';

const PrivacyPolicyScreen = ({ navigation }) => {
  const privacyPolicy = {
    lastUpdated: '2024年1月1日',
    sections: [      {        title: '資訊收集',        content: '我們收集您提供的資訊，包括帳戶資訊、使用數據和卡牌圖片。這些資訊用於提供服務和改善用戶體驗。',      },      {        title: '資訊使用',        content: '我們使用收集的資訊來提供卡牌辨識、分析和其他相關服務。我們不會將您的個人資訊出售給第三方。',      },      {        title: '資訊保護',        content: '我們採用行業標準的安全措施來保護您的個人資訊，包括加密傳輸和安全儲存。',      },      {        title: '資訊分享',        content: '除法律要求外，我們不會與第三方分享您的個人資訊。我們可能會與服務提供商分享必要的資訊以提供服務。',      },      {        title: '您的權利',        content: '您有權訪問、更正或刪除您的個人資訊。您也可以選擇退出某些數據收集活動。',      },      {        title: 'Cookie 使用',        content: '我們使用 Cookie 和類似技術來改善網站功能和用戶體驗。您可以選擇禁用這些技術。',      },      {        title: '第三方服務',        content: '我們的應用程式可能包含第三方服務的連結。這些服務有自己的隱私政策，我們不承擔其責任。',      },      {        title: '兒童隱私',        content: '我們的服務不針對13歲以下的兒童。如果我們發現收集了兒童的個人資訊，會立即刪除。',      },      {        title: '政策更新',        content: '我們可能會更新此隱私政策。重大變更會透過應用程式通知或電子郵件告知用戶。',      },      {        title: '聯絡我們',        content: '如果您對隱私政策有任何問題，請聯絡我們：privacy@tcgassistant.com',      },
    ],
  };

  const renderHeader = () => {
    return (      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>隱私政策</Text>        <View style={{ width: 24 }} />      </View>
    );
  };

  const renderPolicyHeader = () => {
    return (      <View style={styles.policyHeader}>        <Text style={styles.policyTitle}>隱私政策</Text>        <Text style={styles.lastUpdated}>最後更新：{privacyPolicy.lastUpdated}</Text>        <Text style={styles.policyIntroduction}>          本隱私政策說明我們如何收集、使用和保護您的個人資訊。使用我們的服務即表示您同意本政策的條款。        </Text>      </View>
    );
  };

  const renderSections = () => {
    return privacyPolicy.sections.map((section, index) => (      <View key={index} style={styles.section}>        <Text style={styles.sectionTitle}>{section.title}</Text>        <Text style={styles.sectionContent}>{section.content}</Text>      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>      {renderHeader()}      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {renderPolicyHeader()}        {renderSections()}      </ScrollView>
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
  lastUpdated: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 15,
  },
  policyHeader: {
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  policyIntroduction: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
  },
  policyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionContent: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default PrivacyPolicyScreen;
