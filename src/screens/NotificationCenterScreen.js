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
    try {
      const history = await notificationService.getNotificationHistory(100, 0);
      setNotifications(history);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await notificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadStats()]);
    setRefreshing(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    return notification.category === selectedFilter;
  });

  const getNotificationIcon = (category) => {
    switch (category) {
      case NOTIFICATION_TYPES.PRICE_ALERT:
        return 'trending-up';
      case NOTIFICATION_TYPES.MARKET_UPDATE:
        return 'business';
      case NOTIFICATION_TYPES.TRADING_ALERT:
        return 'swap-horiz';
      case NOTIFICATION_TYPES.SECURITY_ALERT:
        return 'security';
      case NOTIFICATION_TYPES.NEW_FEATURE:
        return 'new-releases';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case NOTIFICATION_PRIORITY.URGENT:
        return COLORS.red;
      case NOTIFICATION_PRIORITY.HIGH:
        return COLORS.orange;
      case NOTIFICATION_PRIORITY.NORMAL:
        return COLORS.blue;
      case NOTIFICATION_PRIORITY.LOW:
        return COLORS.gray;
      default:
        return COLORS.blue;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`;
    return date.toLocaleDateString();
  };

  const handleNotificationTap = (notification) => {
    // 處理通知點擊
    console.log('Notification tapped:', notification);
    
    // 根據通知類型執行相應操作
    switch (notification.category) {
      case NOTIFICATION_TYPES.PRICE_ALERT:
        navigation.navigate('PriceTracking');
        break;
      case NOTIFICATION_TYPES.MARKET_UPDATE:
        navigation.navigate('TradingMarket');
        break;
      case NOTIFICATION_TYPES.TRADING_ALERT:
        navigation.navigate('TradingHistory');
        break;
      default:
        // 一般通知，顯示詳情
        Alert.alert(notification.title, notification.body);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      '清除所有通知',
      '確定要清除所有通知嗎？此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.cancelAllNotifications();
              setNotifications([]);
            } catch (error) {
              console.error('Failed to clear notifications:', error);
            }
          },
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationTap(item)}
    >
      <View style={styles.notificationIcon}>
        <Icon
          name={getNotificationIcon(item.category)}
          size={24}
          color={getNotificationColor(item.priority)}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={3}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      <View style={styles.notificationPriority}>
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getNotificationColor(item.priority) },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>通知統計</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.totalReceived || 0}</Text>
          <Text style={styles.statLabel}>總接收</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.totalTapped || 0}</Text>
          <Text style={styles.statLabel}>已點擊</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stats?.recentActivity || 0}
          </Text>
          <Text style={styles.statLabel}>最近7天</Text>
        </View>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
    >
      {[
        { key: 'all', label: '全部' },
        { key: NOTIFICATION_TYPES.PRICE_ALERT, label: '價格警報' },
        { key: NOTIFICATION_TYPES.MARKET_UPDATE, label: '市場更新' },
        { key: NOTIFICATION_TYPES.TRADING_ALERT, label: '交易警報' },
        { key: NOTIFICATION_TYPES.SECURITY_ALERT, label: '安全警報' },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            selectedFilter === filter.key && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter(filter.key)}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>通知中心</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllNotifications}
        >
          <Icon name="clear-all" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats && renderStatsCard()}
        {renderFilterTabs()}

        <View style={styles.notificationsContainer}>
          <Text style={styles.sectionTitle}>
            通知 ({filteredNotifications.length})
          </Text>
          
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="notifications-off" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>暫無通知</Text>
              <Text style={styles.emptySubtext}>
                當有新通知時，它們會顯示在這裡
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: SIZES.base,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
  },
  statsCard: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  filterTab: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    marginRight: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.base,
    fontWeight: '600',
  },
  notificationBody: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  notificationTime: {
    ...FONTS.body5,
    color: COLORS.lightGray,
  },
  notificationPriority: {
    justifyContent: 'center',
    paddingLeft: SIZES.base,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.gray,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  emptySubtext: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});

export default NotificationCenterScreen;
