import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

// 常數
import { COLORS, TEXT_STYLES, ROUTES } from '../constants';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // 最近記錄 - 從真實API獲取
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // 載入最近記錄
  useEffect(() => {
    const loadRecentRecords = async () => {
      setIsLoadingRecent(true);
      try {
        // 調用API整合管理器獲取最近記錄
        const apiIntegrationManager = require('../services/apiIntegrationManager').default;
        const result = await apiIntegrationManager.callApi(
          'userHistory',
          'getRecentHistory',
          { limit: 5 },
          { useCache: true }
        );
        
        if (result && result.data && result.data.history) {
          setRecentRecords(result.data.history);
        } else {
          // 如果沒有數據，顯示空狀態
          setRecentRecords([]);
        }
      } catch (error) {
        console.error('載入最近記錄失敗:', error);
        setRecentRecords([]);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    if (user?.id) {
      loadRecentRecords();
    }
  }, [user?.id]);

  // 主要功能按鈕
  const featureButtons = [
    {
      id: 'card_recognition',
      title: '卡牌辨识',
      icon: 'camera',
      route: ROUTES.CARD_RECOGNITION,
      color: '#00ffff',
    },
    {
      id: 'price_prediction',
      title: '价格预测',
      icon: 'chart-line',
      route: ROUTES.PRICE_PREDICTION,
      color: '#ffeb3b',
    },
    {
      id: 'authenticity',
      title: '真伪检查',
      icon: 'shield-check',
      route: ROUTES.AUTHENTICITY_CHECK,
      color: '#4caf50',
    },
    {
      id: 'collection',
      title: '收藏管理',
      icon: 'cards',
      route: ROUTES.COLLECTION,
      color: '#ff9800',
    },
  ];

  const renderRecentCard = (card) => (
    <View key={card.id} style={styles.recentCard}>
      <View style={styles.cardImageContainer}>
        {card.image ? (
          <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImage}>
            <Text style={styles.cardImageText}>{card.name || 'Unknown Card'}</Text>
            <Text style={styles.cardImageSubtext}>Card</Text>
            <Text style={styles.cardImageNumber}>{card.number || 'N/A'}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{card.name || 'Unknown Card'}</Text>
        <Text style={styles.cardPrice}>{card.price || 'N/A'}</Text>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>稀有度</Text>
            <Text style={styles.statValue}>{card.rarity || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>编号</Text>
            <Text style={styles.statValue}>#{card.number || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.radarChart}>
          <View style={styles.radarChartInner}>
            <Text style={styles.radarLabel}>△一</Text>
            <Text style={styles.radarLabel}>高估</Text>
            <Text style={styles.radarLabel}>超值</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.statusButton}>
          <Text style={styles.statusButtonText}>高估</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeatureButton = (button) => (
    <TouchableOpacity
      key={button.id}
      style={[styles.featureButton, { borderColor: button.color }]}
      onPress={() => navigation.navigate(button.route)}
    >
      <Icon name={button.icon} size={24} color={button.color} />
      <Text style={[styles.featureButtonText, { color: button.color }]}>
        {button.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1F71" />
      
      {/* 頂部標題 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TCG助手</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Icon name="account" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      {/* 搜索欄 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.scanButton}>
            <Icon name="qrcode-scan" size={20} color="#00ffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 最近記錄 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          {isLoadingRecent ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>載入中...</Text>
            </View>
          ) : recentRecords.length > 0 ? (
            recentRecords.map(renderRecentCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cards-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>暫無最近記錄</Text>
              <Text style={styles.emptySubtext}>開始使用卡牌辨識功能來查看記錄</Text>
            </View>
          )}
        </View>

        {/* 功能按鈕 */}
        <View style={styles.section}>
          <View style={styles.featureGrid}>
            {featureButtons.map(renderFeatureButton)}
          </View>
        </View>

        {/* 特殊功能按鈕 */}
        <View style={styles.section}>
          <View style={styles.specialButtons}>
            <TouchableOpacity style={styles.specialButton}>
              <Icon name="qrcode" size={24} color="#fff" />
              <Text style={styles.specialButtonText}>剀市</Text>
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>VIP</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.specialButton}>
              <Icon name="robot" size={24} color="#00ffff" />
              <Text style={styles.specialButtonText}>Copilot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  scanButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  recentCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  cardImageContainer: {
    marginRight: 15,
  },
  cardImage: {
    width: 80,
    height: 120,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  cardImageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  cardImageSubtext: {
    fontSize: 10,
    color: '#000',
    marginTop: 5,
  },
  cardImageNumber: {
    fontSize: 8,
    color: '#000',
    marginTop: 5,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffeb3b',
    marginBottom: 10,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statItem: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  radarChart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  radarChartInner: {
    width: 40,
    height: 40,
    backgroundColor: '#00ffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarLabel: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  statusButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureButton: {
    width: (width - 60) / 2,
    height: 80,
    borderWidth: 2,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  specialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specialButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#00ffff',
    position: 'relative',
  },
  specialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  vipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
