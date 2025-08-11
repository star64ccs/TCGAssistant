import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { COLORS, FONTS, SIZES } from '../constants';
import notificationService, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from '../services/notificationService';

const NotificationCenterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {      const history = await notificationService.getNotificationHistory(100, 0);      setNotifications(history);
    } catch (error) {}
  };

  const loadStats = async () => {
    try {      const notificationStats = await notificationService.getNotificationStats();      setStats(notificationStats);
    } catch (error) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadStats()]);
    setRefreshing(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') {      return true;
    }
    return notification.category === selectedFilter;
  });

  const getNotificationIcon = (category) => {
    switch (category) {
      case NOTIFICATION_TYPES.PRICE_ALERT:        return 'trending-up';
      case NOTIFICATION_TYPES.MARKET_UPDATE:        return 'business';
      case NOTIFICATION_TYPES.TRADING_ALERT:        return 'swap-horiz';
      case NOTIFICATION_TYPES.SECURITY_ALERT:        return 'security';
      case NOTIFICATION_TYPES.NEW_FEATURE:        return 'new-releases';
      default:        return 'notifications';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case NOTIFICATION_PRIORITY.URGENT:        return COLORS.red;
      case NOTIFICATION_PRIORITY.HIGH:        return COLORS.orange;
      case NOTIFICATION_PRIORITY.NORMAL:        return COLORS.blue;
      case NOTIFICATION_PRIORITY.LOW:        return COLORS.gray;
      default:        return COLORS.blue;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;    if (diff < 60000) {      return '剛剛';
    }
    if (diff < 3600000) {      return `${Math.floor(diff / 60000)}分鐘前`;
    }
    if (diff < 86400000) {      return `${Math.floor(diff / 3600000)}小時前`;
    }
    return date.toLocaleDateString();
  };

  const handleNotificationTap = (notification) => {
  // 處理通知點擊
    // 根據通知類型執行相應操作
    switch (notification.category) {
      case NOTIFICATION_TYPES.PRICE_ALERT:        navigation.navigate('PriceTracking');        break;
      case NOTIFICATION_TYPES.MARKET_UPDATE:        navigation.navigate('TradingMarket');        break;
      case NOTIFICATION_TYPES.TRADING_ALERT:        navigation.navigate('TradingHistory');        break;
      default:      // 一般通知，顯示詳情        Alert.alert(notification.title, notification.body);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(      '清除所有通知',      '確定要清除所有通知嗎？此操作無法撤銷。',      [        { text: '取消', style: 'cancel',        },        {          text: '清除',          style: 'destructive',          onPress: async () => {            try {              await notificationService.cancelAllNotifications();              setNotifications([]);            } catch (error) {}          },        },      ],
    );
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity      style={ styles.notificationItem }      onPress={ () => handleNotificationTap(item) }
    >      <View style={ styles.notificationIcon }>        <Icon          name={ getNotificationIcon(item.category) }          size={ 24 }          color={ getNotificationColor(item.priority) }        />      </View>      <View style={ styles.notificationContent }>        <Text style={ styles.notificationTitle } numberOfLines={ 2 }>          { item.title }        </Text>        <Text style={ styles.notificationBody } numberOfLines={ 3 }>          { item.body }        </Text>        <Text style={ styles.notificationTime }>          { formatTime(item.timestamp) }        </Text>      </View>      <View style={ styles.notificationPriority }>        <View          style={            [              styles.priorityIndicator,              { backgroundColor: getNotificationColor(item.priority),              },            ]}        />      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={ styles.statsCard }>      <Text style={ styles.statsTitle }>通知統計</Text>      <View style={ styles.statsGrid }>        <View style={ styles.statItem }>          <Text style={ styles.statNumber }>{ stats?.totalReceived || 0 }</Text>          <Text style={ styles.statLabel }>總接收</Text>        </View>        <View style={ styles.statItem }>          <Text style={ styles.statNumber }>{ stats?.totalTapped || 0 }</Text>          <Text style={ styles.statLabel }>已點擊</Text>        </View>        <View style={ styles.statItem }>          <Text style={ styles.statNumber }>            { stats?.recentActivity || 0 }          </Text>          <Text style={ styles.statLabel }>最近7天</Text>        </View>      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView      horizontal      showsHorizontalScrollIndicator={ false }      style={ styles.filterContainer }
    >      {        [          { key: 'all', label: '全部',          },          { key: NOTIFICATION_TYPES.PRICE_ALERT, label: '價格警報' },          { key: NOTIFICATION_TYPES.MARKET_UPDATE, label: '市場更新' },          { key: NOTIFICATION_TYPES.TRADING_ALERT, label: '交易警報' },          { key: NOTIFICATION_TYPES.SECURITY_ALERT, label: '安全警報' },        ].map((filter) => (          <TouchableOpacity            key={ filter.key }            style={              [                styles.filterTab,                selectedFilter === filter.key && styles.filterTabActive,              ]            }            onPress={ () => setSelectedFilter(filter.key) }          >            <Text              style={                [                  styles.filterTabText,                  selectedFilter === filter.key && styles.filterTabTextActive,                ]              }            >              { filter.label }            </Text>          </TouchableOpacity>        ))}
    </ScrollView>
  );

  return (
    <LinearGradient      colors={ [COLORS.primary, COLORS.secondary] }      style={ styles.container }
    >      <View style={ styles.header }>        <TouchableOpacity          style={ styles.backButton }          onPress={ () => navigation.goBack() }        >          <Icon name="arrow-back" size={ 24 } color={ COLORS.white } />        </TouchableOpacity>        <Text style={ styles.headerTitle }>通知中心</Text>        <TouchableOpacity          style={ styles.clearButton }          onPress={ clearAllNotifications }        >          <Icon name="clear-all" size={ 24 } color={ COLORS.white } />        </TouchableOpacity>      </View>      <ScrollView        style={ styles.content }        refreshControl={ <RefreshControl refreshing={refreshing } onRefresh={ onRefresh } />        }      >        { stats ? renderStatsCard() : null }        { renderFilterTabs() }        <View style={ styles.notificationsContainer }>          <Text style={ styles.sectionTitle }>            通知 ({ filteredNotifications.length })          </Text>          {            filteredNotifications.length === 0 ? (              <View style={styles.emptyState              }>                <Icon name="notifications-off" size={ 64 } color={ COLORS.gray } />                <Text style={ styles.emptyText }>暫無通知</Text>                <Text style={ styles.emptySubtext }>                當有新通知時，它們會顯示在這裡                </Text>              </View>            ) : (              <FlatList                data={ filteredNotifications }                renderItem={ renderNotificationItem }                keyExtractor={ (item) => item.id }                scrollEnabled={ false }                showsVerticalScrollIndicator={ false }              />            )}        </View>      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backButton: { padding: SIZES.base },
  clearButton: { padding: SIZES.base },
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptySubtext: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.gray,
    marginBottom: SIZES.base,
    marginTop: SIZES.padding,
  },
  filterContainer: {
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  filterTab: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  filterTabTextActive: { color: COLORS.white },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  notificationBody: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  notificationContent: { flex: 1 },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: SIZES.padding,
    width: 48,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: SIZES.base,
    padding: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationPriority: {
    justifyContent: 'center',
    paddingLeft: SIZES.base,
  },
  notificationTime: {
    ...FONTS.body5,
    color: COLORS.lightGray,
  },
  notificationTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  priorityIndicator: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  statItem: { alignItems: 'center' },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  statNumber: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    elevation: 3,
    margin: SIZES.padding,
    padding: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
});

export default NotificationCenterScreen;
