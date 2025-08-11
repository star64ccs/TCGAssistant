import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout, updateProfile } from '../../store/slices/authSlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY, MEMBERSHIP_TYPES } from '../../constants';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t,
  } = useTranslation();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    newCards: true,
    marketUpdates: true,
    promotions: false,
  });

  useEffect(() => {
    if (user) {      setProfileData({        name: user.name || '',        email: user.email || '',        phone: user.phone || '',        avatar: user.avatar || null,      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {      Alert.alert(t('auth.error'), t('auth.please_fill_required_fields'));      return;
    }    try {      await dispatch(updateProfile(profileData)).unwrap();      setIsEditing(false);      Alert.alert(t('auth.success'), t('auth.profile_updated'));
    } catch (error) {      Alert.alert(t('auth.error'), t('auth.failed_to_update_profile'));
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;    if (!currentPassword || !newPassword || !confirmPassword) {      Alert.alert(t('auth.error'), t('auth.please_fill_all_fields'));      return;
    }    if (newPassword !== confirmPassword) {      Alert.alert(t('auth.error'), t('auth.passwords_not_match'));      return;
    }    if (newPassword.length < 6) {      Alert.alert(t('auth.error'), t('auth.password_too_short'));      return;
    }    try {      // 模擬API調用      await new Promise(resolve => setTimeout(resolve, 2000));      setShowPasswordModal(false);      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '',      });      Alert.alert(t('auth.success'), t('auth.password_changed'));
    } catch (error) {      Alert.alert(t('auth.error'), t('auth.failed_to_change_password'));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({      index: 0,      routes: [{ name: 'Login',      }],
    });
  };

  const handleUpgradeMembership = (membershipType) => {
  // 模擬升級會員
    Alert.alert(      t('membership.upgrade_title'),      t('membership.upgrade_confirm', { type: t(`membership.${membershipType      }`) }),      [        { text: t('common.cancel'), style: 'cancel' },        {          text: t('common.upgrade'),          onPress: () => {            setShowMembershipModal(false);            Alert.alert(t('membership.success'), t('membership.upgrade_success'));          },        },      ],
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.header }>      <View style={ styles.headerContent }>        <View style={ styles.avatarContainer }>          {            profileData.avatar ? (              <Image source={{ uri: profileData.avatar,              }} style={ styles.avatar } />            ) : (              <View style={ styles.avatarPlaceholder }>                <Icon name="account" size={ 40 } color={ COLORS.TEXT_WHITE } />              </View>            )}          <TouchableOpacity style={ styles.editAvatarButton }>            <Icon name="camera" size={ 16 } color={ COLORS.TEXT_WHITE } />          </TouchableOpacity>        </View>        <Text style={ styles.userName }>{ profileData.name }</Text>        <Text style={ styles.userEmail }>{ profileData.email }</Text>        <View style={ styles.membershipBadge }>          <Icon name="crown" size={ 16 } color={ COLORS.TEXT_WHITE } />          <Text style={ styles.membershipText }>            { t(`membership.${membership.currentType || 'FREE' }`)}          </Text>        </View>      </View>
    </LinearGradient>
  );

  const renderProfileSection = () => (
    <View style={ styles.section }>      <View style={ styles.sectionHeader }>        <Text style={ styles.sectionTitle }>{ t('profile.personal_info') }</Text>        <TouchableOpacity onPress={ () => setIsEditing(!isEditing) }>          <Icon            name={ isEditing ? 'check' : 'pencil' }            size={ 20 }            color={ COLORS.PRIMARY }          />        </TouchableOpacity>      </View>      <View style={ styles.inputGroup }>        <Text style={ styles.inputLabel }>{ t('profile.name') }</Text>        <TextInput          style={ [styles.textInput, !isEditing && styles.textInputDisabled] }          value={ profileData.name }          onChangeText={ (value) => setProfileData({ ...profileData, name: value })}          editable={ isEditing }          placeholder={ t('profile.name_placeholder') }        />      </View>      <View style={ styles.inputGroup }>        <Text style={ styles.inputLabel }>{ t('profile.email') }</Text>        <TextInput          style={ [styles.textInput, !isEditing && styles.textInputDisabled] }          value={ profileData.email }          onChangeText={ (value) => setProfileData({ ...profileData, email: value })}          editable={ isEditing }          placeholder={ t('profile.email_placeholder') }          keyboardType="email-address"          autoCapitalize="none"        />      </View>      <View style={ styles.inputGroup }>        <Text style={ styles.inputLabel }>{ t('profile.phone') }</Text>        <TextInput          style={ [styles.textInput, !isEditing && styles.textInputDisabled] }          value={ profileData.phone }          onChangeText={ (value) => setProfileData({ ...profileData, phone: value })}          editable={ isEditing }          placeholder={ t('profile.phone_placeholder') }          keyboardType="phone-pad"        />      </View>      {        isEditing ? <TouchableOpacity style={styles.saveButton          } onPress={ handleSaveProfile }>            <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.saveButtonGradient }>              <Text style={ styles.saveButtonText }>{ t('common.save') }</Text>            </LinearGradient>          </TouchableOpacity> : null}
    </View>
  );

  const renderSettingsSection = () => (
    <View style={ styles.section }>      <Text style={ styles.sectionTitle }>{ t('profile.settings') }</Text>      <TouchableOpacity style={ styles.settingItem } onPress={ () => setShowPasswordModal(true) }>        <View style={ styles.settingLeft }>          <Icon name="lock-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.change_password') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>      <TouchableOpacity style={ styles.settingItem } onPress={ () => setShowMembershipModal(true) }>        <View style={ styles.settingLeft }>          <Icon name="crown-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.membership') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>      <TouchableOpacity style={ styles.settingItem }>        <View style={ styles.settingLeft }>          <Icon name="bell-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.notifications') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>      <TouchableOpacity style={ styles.settingItem }>        <View style={ styles.settingLeft }>          <Icon name="shield-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.privacy') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>      <TouchableOpacity style={ styles.settingItem }>        <View style={ styles.settingLeft }>          <Icon name="help-circle-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.help_support') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>      <TouchableOpacity style={ styles.settingItem }>        <View style={ styles.settingLeft }>          <Icon name="information-outline" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.settingText }>{ t('profile.about') }</Text>        </View>        <Icon name="chevron-right" size={ 20 } color={ COLORS.TEXT_SECONDARY } />      </TouchableOpacity>
    </View>
  );

  const renderLogoutSection = () => (
    <View style={ styles.section }>      <TouchableOpacity        style={ styles.logoutButton }        onPress={ () => setShowLogoutModal(true) }      >        <Icon name="logout" size={ 24 } color={ COLORS.ERROR } />        <Text style={ styles.logoutText }>{ t('profile.logout') }</Text>      </TouchableOpacity>
    </View>
  );

  return (
    <View style={ styles.container }>      <ScrollView showsVerticalScrollIndicator={ false }>        { renderProfileHeader() }        <View style={ styles.content }>          { renderProfileSection() }          { renderSettingsSection() }          { renderLogoutSection() }        </View>      </ScrollView>      { /* 密碼修改模態框 */ }      <Modal        visible={ showPasswordModal }        transparent={ true }        animationType="slide"        onRequestClose={ () => setShowPasswordModal(false) }      >        <View style={ styles.modalOverlay }>          <View style={ styles.modalContent }>            <View style={ styles.modalHeader }>              <Text style={ styles.modalTitle }>{ t('profile.change_password') }</Text>              <TouchableOpacity onPress={ () => setShowPasswordModal(false) }>                <Icon name="close" size={ 24 } color={ COLORS.TEXT_PRIMARY } />              </TouchableOpacity>            </View>            <ScrollView style={ styles.modalBody }>              <View style={ styles.inputGroup }>                <Text style={ styles.inputLabel }>{ t('profile.current_password') }</Text>                <View style={ styles.passwordInputContainer }>                  <TextInput                    style={ styles.passwordInput }                    value={ passwordData.currentPassword }                    onChangeText={ (value) => setPasswordData({ ...passwordData, currentPassword: value })}                    secureTextEntry={ !showPasswords.current }                    placeholder={ t('profile.current_password_placeholder') }                  />                  <TouchableOpacity                    onPress={ () => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}                  >                    <Icon                      name={ showPasswords.current ? 'eye-off' : 'eye' }                      size={ 20 }                      color={ COLORS.TEXT_SECONDARY }                    />                  </TouchableOpacity>                </View>              </View>              <View style={ styles.inputGroup }>                <Text style={ styles.inputLabel }>{ t('profile.new_password') }</Text>                <View style={ styles.passwordInputContainer }>                  <TextInput                    style={ styles.passwordInput }                    value={ passwordData.newPassword }                    onChangeText={ (value) => setPasswordData({ ...passwordData, newPassword: value })}                    secureTextEntry={ !showPasswords.new }                    placeholder={ t('profile.new_password_placeholder') }                  />                  <TouchableOpacity                    onPress={ () => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}                  >                    <Icon                      name={ showPasswords.new ? 'eye-off' : 'eye' }                      size={ 20 }                      color={ COLORS.TEXT_SECONDARY }                    />                  </TouchableOpacity>                </View>              </View>              <View style={ styles.inputGroup }>                <Text style={ styles.inputLabel }>{ t('profile.confirm_new_password') }</Text>                <View style={ styles.passwordInputContainer }>                  <TextInput                    style={ styles.passwordInput }                    value={ passwordData.confirmPassword }                    onChangeText={ (value) => setPasswordData({ ...passwordData, confirmPassword: value })}                    secureTextEntry={ !showPasswords.confirm }                    placeholder={ t('profile.confirm_new_password_placeholder') }                  />                  <TouchableOpacity                    onPress={ () => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}                  >                    <Icon                      name={ showPasswords.confirm ? 'eye-off' : 'eye' }                      size={ 20 }                      color={ COLORS.TEXT_SECONDARY }                    />                  </TouchableOpacity>                </View>              </View>              <TouchableOpacity style={ styles.modalButton } onPress={ handleChangePassword }>                <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.modalButtonGradient }>                  <Text style={ styles.modalButtonText }>{ t('profile.change_password') }</Text>                </LinearGradient>              </TouchableOpacity>            </ScrollView>          </View>        </View>      </Modal>      { /* 會員升級模態框 */ }      <Modal        visible={ showMembershipModal }        transparent={ true }        animationType="slide"        onRequestClose={ () => setShowMembershipModal(false) }      >        <View style={ styles.modalOverlay }>          <View style={ styles.modalContent }>            <View style={ styles.modalHeader }>              <Text style={ styles.modalTitle }>{ t('profile.membership') }</Text>              <TouchableOpacity onPress={ () => setShowMembershipModal(false) }>                <Icon name="close" size={ 24 } color={ COLORS.TEXT_PRIMARY } />              </TouchableOpacity>            </View>            <ScrollView style={ styles.modalBody }>              <Text style={ styles.modalSubtitle }>{ t('membership.choose_plan') }</Text>              {                Object.values(MEMBERSHIP_TYPES).map((type) => (                  <TouchableOpacity                    key={type                    }                    style={ styles.membershipOption }                    onPress={ () => handleUpgradeMembership(type) }                  >                    <View style={ styles.membershipOptionHeader }>                      <Icon name="crown" size={ 24 } color={ COLORS.PRIMARY } />                      <Text style={ styles.membershipOptionTitle }>                        { t(`membership.${type }`)}                      </Text>                    </View>                    <Text style={ styles.membershipOptionDescription }>                      { t(`membership.${type }_description`)}                    </Text>                    <Text style={ styles.membershipOptionPrice }>                      { t(`membership.${type }_price`)}                    </Text>                  </TouchableOpacity>                ))}            </ScrollView>          </View>        </View>      </Modal>      { /* 登出確認模態框 */ }      <Modal        visible={ showLogoutModal }        transparent={ true }        animationType="fade"        onRequestClose={ () => setShowLogoutModal(false) }      >        <View style={ styles.modalOverlay }>          <View style={ styles.confirmModal }>            <Text style={ styles.confirmTitle }>{ t('profile.logout_confirm_title') }</Text>            <Text style={ styles.confirmMessage }>{ t('profile.logout_confirm_message') }</Text>            <View style={ styles.confirmButtons }>              <TouchableOpacity                style={ styles.confirmButton }                onPress={ () => setShowLogoutModal(false) }              >                <Text style={ styles.confirmButtonText }>{ t('common.cancel') }</Text>              </TouchableOpacity>              <TouchableOpacity                style={ [styles.confirmButton, styles.confirmButtonDanger] }                onPress={ handleLogout }              >                <Text style={ [styles.confirmButtonText, styles.confirmButtonTextDanger] }>                  { t('profile.logout') }                </Text>              </TouchableOpacity>            </View>          </View>        </View>      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  confirmButtonDanger: { backgroundColor: COLORS.ERROR },
  confirmButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  confirmButtonTextDanger: { color: COLORS.TEXT_WHITE },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmModal: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    margin: 20,
    padding: 24,
  },
  confirmTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    flex: 1,
  },
  content: { padding: 20 },
  editAvatarButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContent: { alignItems: 'center' },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  logoutButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.ERROR,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  membershipBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  membershipOption: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  membershipOptionDescription: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  membershipOptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  membershipOptionPrice: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  membershipOptionTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  membershipText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    marginLeft: 4,
  },
  modalBody: { padding: 20 },
  modalButton: {
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.INPUT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSubtitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  passwordInput: {
    flex: 1,
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
  },
  passwordInputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  section: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: COLORS.INPUT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  textInput: {
    ...TEXT_STYLES.BODY_MEDIUM,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInputDisabled: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  userEmail: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_WHITE,
    marginBottom: 12,
    opacity: 0.9,
  },
  userName: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    marginBottom: 4,
  },
});

export default ProfileScreen;
