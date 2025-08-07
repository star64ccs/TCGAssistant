import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { membershipType } = useSelector((state) => state.membership);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      '確認登出',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await dispatch(logout()).unwrap();
            } catch (error) {
              console.error('登出失敗:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleMembership = () => {
    navigation.navigate('Membership');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const handleAbout = () => {
    navigation.navigate('About');
  };

  const menuItems = [
    {
      id: 'profile',
      title: '編輯個人資料',
      icon: 'account-edit',
      onPress: handleEditProfile,
    },
    {
      id: 'password',
      title: '更改密碼',
      icon: 'lock-reset',
      onPress: handleChangePassword,
    },
    {
      id: 'membership',
      title: '會員資格',
      icon: 'crown',
      onPress: handleMembership,
      badge: membershipType === 'free' ? '升級' : null,
    },
    {
      id: 'settings',
      title: '設置',
      icon: 'cog',
      onPress: handleSettings,
    },
    {
      id: 'help',
      title: '幫助與支持',
      icon: 'help-circle',
      onPress: handleHelp,
    },
    {
      id: 'about',
      title: '關於我們',
      icon: 'information',
      onPress: handleAbout,
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Icon name={item.icon} size={24} color="#00ffff" />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Icon name="chevron-right" size={24} color="#00ffff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>個人資料</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Icon name="cog" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={60} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Icon name="camera" size={16} color="#00ffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || '用戶名稱'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            
            <View style={styles.membershipBadge}>
              <Icon name="crown" size={16} color="#ffeb3b" />
              <Text style={styles.membershipText}>
                {membershipType === 'premium' ? '高級會員' : '免費會員'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Icon name="cards" size={24} color="#00ffff" />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>收藏卡牌</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#ffeb3b" />
            <Text style={styles.statNumber}>$2,450</Text>
            <Text style={styles.statLabel}>總價值</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="chart-line" size={24} color="#4caf50" />
            <Text style={styles.statNumber}>+12.5%</Text>
            <Text style={styles.statLabel}>收益</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Icon name="logout" size={20} color="#f44336" />
          <Text style={styles.logoutButtonText}>
            {isLoading ? '登出中...' : '登出'}
          </Text>
        </TouchableOpacity>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ffff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ffff',
    backgroundColor: '#2A2F81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2F81',
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  membershipText: {
    color: '#ffeb3b',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: '#2A2F81',
    marginHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: '#fff',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2F81',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f44336',
    marginBottom: 30,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;
