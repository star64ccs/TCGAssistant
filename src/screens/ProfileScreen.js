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
  const { t,
  } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { membershipType } = useSelector((state) => state.membership);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(      '確認登出',      '確定要登出嗎？',      [        { text: '取消', style: 'cancel',
        },        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {            setIsLoading(true);            try {              await dispatch(logout()).unwrap();
            } catch (error) {} finally {
              setIsLoading(false);
            }          },        },      ],
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
    <TouchableOpacity      key={ item.id }      style={ styles.menuItem }      onPress={ item.onPress }
    >      <View style={ styles.menuItemLeft }>        <View style={ styles.menuIcon }>          <Icon name={ item.icon } size={ 24 } color="#00ffff" />        </View>        <Text style={ styles.menuTitle }>{ item.title }</Text>      </View>      <View style={ styles.menuItemRight }>        {
          item.badge ? <View style={styles.badge
            }>              <Text style={ styles.badgeText }>{ item.badge }</Text>            </View> : null}        <Icon name="chevron-right" size={ 24 } color="#00ffff" />      </View>
    </TouchableOpacity>
  );

  return (
    <View style={ styles.container }>      { /* Header */ }      <View style={ styles.header }>        <Text style={ styles.headerTitle }>個人資料</Text>        <TouchableOpacity style={ styles.settingsButton } onPress={ handleSettings }>          <Icon name="cog" size={ 24 } color="#00ffff" />        </TouchableOpacity>      </View>      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>        { /* Profile Info */ }        <View style={ styles.profileSection }>          <View style={ styles.avatarContainer }>            {
              user?.avatar ? (                <Image source={{ uri: user.avatar,
                }} style={ styles.avatar } />              ) : (                <View style={ styles.avatarPlaceholder }>                  <Icon name="account" size={ 60 } color="#666" />                </View>              )}            <TouchableOpacity style={ styles.editAvatarButton } onPress={ handleEditProfile }>              <Icon name="camera" size={ 16 } color="#00ffff" />            </TouchableOpacity>          </View>          <View style={ styles.profileInfo }>            <Text style={ styles.userName }>{ user?.name || '用戶名稱' }</Text>            <Text style={ styles.userEmail }>{ user?.email || 'user@example.com' }</Text>            <View style={ styles.membershipBadge }>              <Icon name="crown" size={ 16 } color="#ffeb3b" />              <Text style={ styles.membershipText }>                { membershipType === 'premium' ? '高級會員' : '免費會員' }              </Text>            </View>          </View>        </View>        { /* Stats */ }        <View style={ styles.statsSection }>          <View style={ styles.statCard }>            <Icon name="cards" size={ 24 } color="#00ffff" />            <Text style={ styles.statNumber }>156</Text>            <Text style={ styles.statLabel }>收藏卡牌</Text>          </View>          <View style={ styles.statCard }>            <Icon name="trending-up" size={ 24 } color="#ffeb3b" />            <Text style={ styles.statNumber }>$2,450</Text>            <Text style={ styles.statLabel }>總價值</Text>          </View>          <View style={ styles.statCard }>            <Icon name="chart-line" size={ 24 } color="#4caf50" />            <Text style={ styles.statNumber }>+12.5%</Text>            <Text style={ styles.statLabel }>收益</Text>          </View>        </View>        { /* Menu Items */ }        <View style={ styles.menuSection }>          { menuItems.map(renderMenuItem) }        </View>        { /* Logout Button */ }        <TouchableOpacity          style={ [styles.logoutButton, isLoading && styles.logoutButtonDisabled] }          onPress={ handleLogout }          disabled={ isLoading }        >          <Icon name="logout" size={ 20 } color="#f44336" />          <Text style={ styles.logoutButtonText }>            { isLoading ? '登出中...' : '登出' }          </Text>        </TouchableOpacity>      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderColor: '#00ffff',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    width: 120,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  badge: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  editAvatarButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 16,
    borderWidth: 2,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
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
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#f44336',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  logoutButtonDisabled: { opacity: 0.6 },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  membershipBadge: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  membershipText: {
    color: '#ffeb3b',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 15,
    width: 40,
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  menuItemRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuSection: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
  },
  profileInfo: { alignItems: 'center' },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  scrollView: { flex: 1 },
  settingsButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  userEmail: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default ProfileScreen;
