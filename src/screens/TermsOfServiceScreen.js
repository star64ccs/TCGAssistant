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

const TermsOfServiceScreen = ({ navigation }) => {
  const termsOfService = {
    lastUpdated: '2024年1月1日',
    sections: [      {        title: '服務說明',        content: 'TCG 助手提供卡牌辨識、分析和管理服務。我們致力於為用戶提供準確、可靠的卡牌相關資訊。',      },      {        title: '使用條款',        content: '使用我們的服務即表示您同意遵守所有適用的法律法規，並承諾不會濫用服務或從事任何違法活動。',      },      {        title: '帳戶責任',        content: '您有責任保護您的帳戶安全，包括密碼和登入資訊。您對帳戶下的所有活動負責。',      },      {        title: '內容政策',        content: '您上傳的內容必須合法且不侵犯他人權利。我們保留刪除違規內容的權利。',      },      {        title: '服務限制',        content: '我們保留限制或終止服務的權利，特別是在濫用、違法或技術問題的情況下。',      },      {        title: '免責聲明',        content: '我們的服務僅供參考，不構成投資建議。我們不對因使用服務而造成的任何損失負責。',      },      {        title: '智慧財產權',        content: '應用程式及其內容的智慧財產權歸我們所有。未經許可，不得複製、修改或分發。',      },      {        title: '隱私保護',        content: '我們重視您的隱私，詳細的隱私政策請參閱隱私政策頁面。',      },      {        title: '服務變更',        content: '我們可能會更新服務內容和條款。重大變更會提前通知用戶。',      },      {        title: '爭議解決',        content: '任何爭議應透過友好協商解決。如無法解決，將提交至有管轄權的法院。',      },      {        title: '聯絡資訊',        content: '如有問題，請聯絡我們：legal@tcgassistant.com',      },
    ],
  };

  const renderHeader = () => {
    return (      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>服務條款</Text>        <View style={{ width: 24 }} />      </View>
    );
  };

  const renderTermsHeader = () => {
    return (      <View style={styles.termsHeader}>        <Text style={styles.termsTitle}>服務條款</Text>        <Text style={styles.lastUpdated}>最後更新：{termsOfService.lastUpdated}</Text>        <Text style={styles.termsIntroduction}>          本服務條款規範您使用 TCG 助手服務的權利和義務。使用我們的服務即表示您同意本條款的所有內容。        </Text>      </View>
    );
  };

  const renderSections = () => {
    return termsOfService.sections.map((section, index) => (      <View key={index} style={styles.section}>        <Text style={styles.sectionTitle}>{section.title}</Text>        <Text style={styles.sectionContent}>{section.content}</Text>      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>      {renderHeader()}      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {renderTermsHeader()}        {renderSections()}      </ScrollView>
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
  termsHeader: {
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  termsIntroduction: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
  },
  termsTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TermsOfServiceScreen;
