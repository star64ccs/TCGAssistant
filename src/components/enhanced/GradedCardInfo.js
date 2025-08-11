import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Share } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// 鑑定卡資訊組件
const GradedCardInfo = ({ 
  gradedCardData,
  style = {},
  showActions = true,
  onVerificationPress = null,
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!gradedCardData || !gradedCardData.isGradedCard) {
    return null;
  }
  
  const { 
    company,
    certification,
    verification,
    links,
    confidence 
  } = gradedCardData;

  // 獲取公司顏色主題
const getCompanyTheme = (companyName) => {
  const themes = {
    PSA: { primary: '#FF0000', secondary: '#FFFFFF', icon: 'shield-check' },
    BGS: { primary: '#000080', secondary: '#FFFFFF', icon: 'star-box' },
    CGC: { primary: '#4169E1', secondary: '#FFFFFF', icon: 'certificate' },
    SGC: { primary: '#228B22', secondary: '#FFFFFF', icon: 'medal' },
    ARS: { primary: '#FF4500', secondary: '#FFFFFF', icon: 'award' },
  };
  return themes[companyName] || { primary: '#6B7280', secondary: '#FFFFFF', icon: 'card-text' };
};
const theme = getCompanyTheme(company?.name);

  // 獲取評分顏色
const getGradeColor = (grade) => {
  if (!grade) {
    return '#94A3B8';
  }
  if (grade >= 9.5) {
    return '#10B981'; // 綠色 - 完美
  }
  if (grade >= 8.5) {
    return '#3B82F6'; // 藍色 - 優秀
  }
  if (grade >= 7.5) {
    return '#F59E0B'; // 橙色 - 良好
  }
  if (grade >= 6.0) {
    return '#EF4444'; // 紅色 - 一般
  }
  return '#94A3B8'; // 灰色 - 較差
};

  // 獲取評分文字描述
const getGradeDescription = (grade, companyName) => {
  if (!grade) {
    return '未知';
  }
  if (companyName === 'PSA') {
    if (grade === 10) {
      return 'GEM MINT';
    }
    if (grade === 9) {
      return 'MINT';
    }
    if (grade === 8) {
      return 'NM-MT';
    }
    if (grade === 7) {
      return 'NM';
    }
    if (grade === 6) {
      return 'EX-MT';
    }
    return `Grade ${grade}`;
  } else if (companyName === 'BGS') {
    if (grade >= 9.5) {
      return 'GEM MINT';
    }
    if (grade >= 9.0) {
      return 'MINT';
    }
    if (grade >= 8.5) {
      return 'NM-MT';
    }
    return `Grade ${grade}`;
  }
  return `Grade ${grade}`;
};

  // 處理連結點擊
const handleLinkPress = async (url, linkType) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('錯誤', '無法開啟此連結');
    }
  } catch (error) {
    // Alert.alert('錯誤', '開啟連結時發生錯誤');
  }
};

  // 分享鑑定資訊
const handleShare = async () => {
  try {
    const shareContent = {
      title: '鑑定卡資訊',
      message: `${company?.name || '評分機構'} 鑑定卡
評分: ${certification?.grade || 'N/A'}
編號: ${certification?.certNumber || 'N/A'}
${links?.verification ? `驗證連結: ${links.verification}` : ''}`,
    };
await Share.share(shareContent);
  } catch (error) { // }
};

  // 渲染評分徽章
const renderGradeBadge = () => {
  const grade = certification?.grade;
if (!grade) {;
return null;
}
return (
      <View style={ [styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>
        <Text style={ styles.gradeNumber }>{ grade }</Text>
        <Text style={ styles.gradeDescription }>
          { getGradeDescription(grade, company?.name) }
        </Text>
      </View>
    );
};

  // 渲染子評分（BGS）
const renderSubgrades = () => {
  if (!certification?.subgrades || Object.keys(certification.subgrades).length === 0) {
    return null;
  }
  return (
    <View style={styles.subgradesContainer}>
      <Text style={styles.subgradesTitle}>子評分:</Text>
      <View style={styles.subgradesGrid}>
        {Object.entries(certification.subgrades).map(([category, grade]) => (
          <View key={category} style={styles.subgradeItem}>
            <Text style={styles.subgradeCategory}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={styles.subgradeValue}>{grade}</Text>
            </View>
          ))}
        </View>
      </View>
    );
};

  // 渲染驗證狀態
const renderVerificationStatus = () => {
  if (!verification) {
    return null;
  }
const isValid = verification.isValid;
const statusColor = isValid === true ? '#10B981' : isValid === false ? '#EF4444' : '#F59E0B';
const statusIcon = isValid === true ? 'check-circle' : isValid === false ? 'close-circle' : 'help-circle';
const statusText = isValid === true ? '已驗證' : isValid === false ? '驗證失敗' : '無法驗證';
  return (
    <View style={[styles.verificationStatus, { borderLeftColor: statusColor }]}>
      <Icon name={statusIcon} size={16} color={statusColor} />
      <Text style={[styles.verificationText, { color: statusColor }]}>
        {statusText}
      </Text>
    </View>
  );
};

  // 渲染連結按鈕
const renderLinkButtons = () => {
  if (!links || !showActions) {
    return null;
  }
  return (
    <View style={styles.linkButtons}>
      {links.verification ? (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: theme.primary }]}
          onPress={() => handleLinkPress(links.verification, 'verification')}
          activeOpacity={0.8}
        >
          <Icon name="shield-search" size={16} color="#FFFFFF" />
          <Text style={styles.linkButtonText}>驗證</Text>
        </TouchableOpacity>
      ) : null}
      {links.search ? (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: '#6B7280' }]}
          onPress={() => handleLinkPress(links.search, 'search')}
          activeOpacity={0.8}
        >
          <Icon name="magnify" size={16} color="#FFFFFF" />
          <Text style={styles.linkButtonText}>搜尋</Text>
        </TouchableOpacity>
      ) : null}
          { links.company ? <TouchableOpacity
style={[styles.linkButton, { backgroundColor: '#8B5CF6' }]}
onPress={ () => handleLinkPress(links.company, 'company') }
activeOpacity={ 0.8 }
        >
          <Icon name="web" size={ 16 } color="#FFFFFF" />
          <Text style={ styles.linkButtonText }>官網</Text>
        </TouchableOpacity> : null}
      </View>
    );
};

  // 渲染詳細資訊
const renderDetailedInfo = () => {
  if (!isExpanded) {
    return null;
  }
  return (
    <View style={styles.detailedInfo}>
      {certification?.population ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>存世量:</Text>
          <Text style={styles.infoValue}>{certification.population}</Text>
        </View>
      ) : null}
      {certification?.dateGraded ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>鑑定日期:</Text>
          <Text style={styles.infoValue}>{certification.dateGraded}</Text>
        </View>
      ) : null}
          { certification?.cardInfo?.year ? <View style={styles.infoRow }>
          <Text style={ styles.infoLabel }>發行年份:</Text>
          <Text style={ styles.infoValue }>{ certification.cardInfo.year }</Text>
        </View> : null}
          { certification?.cardInfo?.cardName ? <View style={styles.infoRow }>
          <Text style={ styles.infoLabel }>卡牌名稱:</Text>
          <Text style={ styles.infoValue }>{ certification.cardInfo.cardName }</Text>
        </View> : null}
          <View style={ styles.infoRow }>
          <Text style={ styles.infoLabel }>識別信心度:</Text>
          <Text style={ styles.infoValue }>{ Math.round(confidence * 100) }%</Text>
        </View>
          { renderSubgrades() }
      </View>
    );
  };

  return (
    <View style={ [styles.container, style] } { ...props }>
      <LinearGradient
colors={ [theme.primary + '10', theme.primary + '05'] }
style={ styles.gradientBackground }
      >
        { /* 標題欄 */ }
        <View style={ styles.header }>
          <View style={ styles.headerLeft }>
            <View style={ [styles.companyIcon, { backgroundColor: theme.primary }]}>
              <Icon name={ theme.icon } size={ 20 } color="#FFFFFF" />
            </View>
            <View style={ styles.headerText }>
              <Text style={ styles.companyName }>{ company?.name || '評分機構' }</Text>
              <Text style={ styles.companyFullName }>{ company?.fullName }</Text>
            </View>
          </View>
          { renderGradeBadge() }
        </View>
          { /* 鑑定編號 */ }
        <View style={ styles.certNumberContainer }>
          <Icon name="barcode" size={ 16 } color="#6B7280" />
          <Text style={ styles.certNumberLabel }>鑑定編號:</Text>
          <Text style={ styles.certNumber }>{ certification?.certNumber || 'N/A' }</Text>
        </View>
          { /* 驗證狀態 */ }
        { renderVerificationStatus() }
          { /* 操作按鈕 */ }
        { showActions ? <View style={styles.actionBar }>
          <TouchableOpacity
style={ styles.expandButton }
onPress={ () => setIsExpanded(!isExpanded) }
activeOpacity={ 0.7 }
          >
            <Text style={ styles.expandButtonText }>
              { isExpanded ? '收起詳情' : '查看詳情' }
            </Text>
            <Icon
name={ isExpanded ? 'chevron-up' : 'chevron-down' }
size={ 16 }
color={ COLORS.primary }
            />
          </TouchableOpacity>
            <TouchableOpacity
style={ styles.shareButton }
onPress={ handleShare }
activeOpacity={ 0.7 }
          >
            <Icon name="share-variant" size={ 16 } color="#6B7280" />
          </TouchableOpacity>
        </View> : null}
          { /* 詳細資訊 */ }
        { renderDetailedInfo() }
          { /* 連結按鈕 */ }
        { renderLinkButtons() }
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
marginVertical: 8,
  borderRadius: 12,
  overflow: 'hidden',
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: {
width: 0,
  height: 2,
},
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
  gradientBackground: { padding: 16, },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
  headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
  companyIcon: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
  headerText: { flex: 1, },
  companyName: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1F2937',
  marginBottom: 2,
},
  companyFullName: {
  fontSize: 12,
  color: '#6B7280',
},
  gradeBadge: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
  minWidth: 80,
},
  gradeNumber: {
  fontSize: 20,
  fontWeight: '800',
  color: '#FFFFFF',
  marginBottom: 2,
},
  gradeDescription: {
  fontSize: 10,
  fontWeight: '600',
  color: '#FFFFFF',
  textAlign: 'center',
},
  certNumberContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F8FAFC',
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
},
  certNumberLabel: {
  fontSize: 14,
  color: '#6B7280',
  marginLeft: 8,
  marginRight: 8,
},
  certNumber: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1F2937',
  fontFamily: 'monospace',
},
  verificationStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  padding: 8,
  borderRadius: 6,
  borderLeftWidth: 4,
  marginBottom: 12,
},
  verificationText: {
  fontSize: 12,
  fontWeight: '600',
  marginLeft: 6,
},
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  detailedInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  subgradesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  subgradesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subgradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subgradeItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subgradeCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  subgradeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  linkButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default GradedCardInfo;
