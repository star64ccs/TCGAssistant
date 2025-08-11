import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/slices/authSlice';
import { addToCollection } from '../store/slices/collectionSlice';
import { setNotification } from '../store/slices/notificationSlice';
import ReduxDebugger from '../utils/reduxDebugger';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

// 常數
import { COLORS, TEXT_STYLES, ROUTES } from '../constants';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const collection = useSelector((state) => state.collection);
  const notification = useSelector((state) => state.notification);

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
          { useCache: true },
        );
        if (result && result.data && result.data.history) {
          setRecentRecords(result.data.history);
        } else {
          // 如果沒有數據，顯示空狀態
          setRecentRecords([]);
        }
      } catch (error) {
        setRecentRecords([]);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    if (auth?.user?.id) {
      loadRecentRecords();
    }
  }, [auth?.user?.id]);

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
    <View key={ card.id } style={ styles.recentCard }>
      <View style={ styles.cardImageContainer }>
        {
          card.image ? (
            <Image source={{ uri: card.image,
            }} style={ styles.cardImage } resizeMode="cover" />
          ) : (
            <View style={ styles.cardImage }>
              <Text style={ styles.cardImageText }>{ card.name || 'Unknown Card' }</Text>
              <Text style={ styles.cardImageSubtext }>Card</Text>
              <Text style={ styles.cardImageNumber }>{ card.number || 'N/A' }</Text>
            </View>
          )}
      </View>
      <View style={ styles.cardInfo }>
        <Text style={ styles.cardName }>{ card.name || 'Unknown Card' }</Text>
        <Text style={ styles.cardPrice }>{ card.price || 'N/A' }</Text>
        <View style={ styles.cardStats }>
          <View style={ styles.statItem }>
            <Text style={ styles.statLabel }>稀有度</Text>
            <Text style={ styles.statValue }>{ card.rarity || 'N/A' }</Text>
          </View>
          <View style={ styles.statItem }>
            <Text style={ styles.statLabel }>编号</Text>
            <Text style={ styles.statValue }>#{ card.number || 'N/A' }</Text>
          </View>
        </View>
        <View style={ styles.radarChart }>
          <View style={ styles.radarChartInner }>
            <Text style={ styles.radarLabel }>△一</Text>
            <Text style={ styles.radarLabel }>高估</Text>
            <Text style={ styles.radarLabel }>超值</Text>
          </View>
        </View>
        <TouchableOpacity style={ styles.statusButton }>
          <Text style={ styles.statusButtonText }>高估</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeatureButton = (button) => (
    <TouchableOpacity
      key={ button.id }
      style={ [styles.featureButton, { borderColor: button.color }]}
      onPress={ () => navigation.navigate(button.route) }
    >
      <Icon name={ button.icon } size={ 24 } color={ button.color } />
      <Text style={ [styles.featureButtonText, { color: button.color }]}>
        { button.title }
      </Text>
    </TouchableOpacity>
  );

  const handleReduxTest = () => {
    // 測試 Redux 功能
    console.log('🧪 開始 Redux 測試...');

    // 運行完整狀態檢查
    ReduxDebugger.runFullCheck();

    // 測試認證
    dispatch(login({
      email: 'test@example.com',
      password: 'password123',
    }));

    // 測試收藏
    const testCard = {
      id: Date.now().toString(),
      name: '測試卡牌',
      set: '測試系列',
      rarity: '稀有',
      price: 100,
      condition: 'NM',
    };
    dispatch(addToCollection(testCard));

    // 測試通知
    dispatch(setNotification({
      type: 'success',
      message: 'Redux 測試成功！',
      duration: 3000,
    }));

    // 延遲檢查狀態變化
    setTimeout(() => {
      console.log('🔄 檢查狀態變化...');
      ReduxDebugger.runFullCheck();
    }, 1000);

    console.log('✅ Redux 測試完成');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1F71" />
      { /* 頂部標題 */ }
      <View style={ styles.header }>
        <Text style={ styles.headerTitle }>TCG助手</Text>
        <TouchableOpacity
          style={ styles.profileButton }
          onPress={ () => navigation.navigate(ROUTES.PROFILE) }
        >
          <Icon name="account" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
      </View>
      { /* 搜索欄 */ }
      <View style={ styles.searchContainer }>
        <View style={ styles.searchBar }>
          <Icon name="magnify" size={ 20 } color="#666" style={ styles.searchIcon } />
          <TextInput
            style={ styles.searchInput }
            placeholder="搜索"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={ styles.scanButton }>
            <Icon name="qrcode-scan" size={ 20 } color="#00ffff" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>
        { /* 最近記錄 */ }
        <View style={ styles.section }>
          <Text style={ styles.sectionTitle }>最近记录</Text>
          {
            isLoadingRecent ? (
              <View style={styles.loadingContainer
              }>
                <Text style={ styles.loadingText }>載入中...</Text>
              </View>
            ) : recentRecords.length > 0 ? (
              recentRecords.map(renderRecentCard)
            ) : (
              <View style={ styles.emptyContainer }>
                <Icon name="cards-outline" size={ 48 } color="#666" />
                <Text style={ styles.emptyText }>暫無最近記錄</Text>
                <Text style={ styles.emptySubtext }>開始使用卡牌辨識功能來查看記錄</Text>
              </View>
            )}
        </View>
        { /* 功能按鈕 */ }
        <View style={ styles.section }>
          <View style={ styles.featureGrid }>
            { featureButtons.map(renderFeatureButton) }
          </View>
        </View>
        { /* 特殊功能按鈕 */ }
        <View style={ styles.section }>
          <View style={ styles.specialButtons }>
            <TouchableOpacity style={ styles.specialButton }>
              <Icon name="qrcode" size={ 24 } color="#fff" />
              <Text style={ styles.specialButtonText }>剀市</Text>
              <View style={ styles.vipBadge }>
                <Text style={ styles.vipText }>VIP</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.specialButton }>
              <Icon name="robot" size={ 24 } color="#00ffff" />
              <Text style={ styles.specialButtonText }>Copilot</Text>
            </TouchableOpacity>
          </View>
        </View>
        { /* Redux 測試按鈕 */ }
        <TouchableOpacity style={styles.reduxTestButton} onPress={handleReduxTest}>
          <Text style={styles.reduxTestButtonText}>🧪 Redux 測試</Text>
        </TouchableOpacity>

        {/* Redux 狀態顯示 */}
        <View style={styles.reduxStatusContainer}>
          <Text style={styles.reduxStatusText}>
            認證: {auth.isAuthenticated ? '✅' : '❌'}
          </Text>
          <Text style={styles.reduxStatusText}>
            收藏: {collection.cards?.length || 0} 張
          </Text>
          <Text style={styles.reduxStatusText}>
            通知: {notification.notifications?.length || 0} 個
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardImage: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    padding: 5,
    width: 80,
  },
  cardImageContainer: { marginRight: 15 },
  cardImageNumber: {
    color: '#000',
    fontSize: 8,
    marginTop: 5,
  },
  cardImageSubtext: {
    color: '#000',
    fontSize: 10,
    marginTop: 5,
  },
  cardImageText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPrice: {
    color: '#ffeb3b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  featureButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    marginBottom: 15,
    width: (width - 60) / 2,
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
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
  profileButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  radarChart: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    marginBottom: 10,
    width: 60,
  },
  radarChartInner: {
    alignItems: 'center',
    backgroundColor: '#00ffff',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  radarLabel: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  recentCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 15,
  },
  reduxStatusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reduxStatusText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  reduxTestButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reduxTestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  scrollView: { flex: 1 },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  specialButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    height: 60,
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
  specialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  specialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: { marginRight: 20 },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f44336',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vipBadge: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    right: -5,
    top: -5,
  },
  vipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
