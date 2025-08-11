import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { acceptDisclaimer } from '../../store/slices/authSlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY, DISCLAIMER_TEXT } from '../../constants';

const { width, height } = Dimensions.get('window');

const DisclaimerScreen = () => {
  const dispatch = useDispatch();
  const { t, i18n,
  } = useTranslation();
  const [hasRead, setHasRead] = useState(false);

  const currentLanguage = i18n.language;
  const disclaimerText = DISCLAIMER_TEXT[currentLanguage] || DISCLAIMER_TEXT['zh-TW'];

  const handleAccept = async () => {
    if (!hasRead) {      Alert.alert(        t('disclaimer.attention'),        t('disclaimer.must_read_first'),        [{ text: t('common.ok'), style: 'default',
        }],      );      return;
    }    try {
      await dispatch(acceptDisclaimer()).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.unknown_error'));
    }
  };

  const handleDecline = () => {
    Alert.alert(      t('disclaimer.decline_title'),      t('disclaimer.decline_message'),      [        { text: t('common.cancel'), style: 'cancel',
        },        { text: t('common.confirm'), style: 'destructive', onPress: () => {} },      ],
    );
  };

  return (
    <View style={ styles.container }>      <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.background }>        { /* Header */ }        <View style={ styles.header }>          <View style={ styles.logoContainer }>            <Icon name="shield-alert" size={ 40 } color={ COLORS.TEXT_WHITE } />          </View>          <Text style={ styles.title }>{ t('disclaimer.title') }</Text>          <Text style={ styles.subtitle }>{ t('disclaimer.subtitle') }</Text>        </View>        { /* Disclaimer Content */ }        <View style={ styles.contentContainer }>          <View style={ styles.disclaimerCard }>            <View style={ styles.disclaimerHeader }>              <Icon name="information" size={ 24 } color={ COLORS.WARNING } />              <Text style={ styles.disclaimerHeaderText }>{ t('disclaimer.important_notice') }</Text>            </View>            <ScrollView              style={ styles.disclaimerScroll }              showsVerticalScrollIndicator={ false }              contentContainerStyle={ styles.disclaimerContent }            >              <Text style={ styles.disclaimerText }>{ disclaimerText }</Text>            </ScrollView>            { /* Read Confirmation */ }            <View style={ styles.readConfirmation }>              <TouchableOpacity                style={ styles.checkboxContainer }                onPress={ () => setHasRead(!hasRead) }              >                <Icon                  name={ hasRead ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline' }                  size={ 24 }                  color={ hasRead ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY }                />                <Text style={ styles.checkboxText }>{ t('disclaimer.i_have_read') }</Text>              </TouchableOpacity>            </View>          </View>          { /* Action Buttons */ }          <View style={ styles.buttonContainer }>            <TouchableOpacity              style={ styles.declineButton }              onPress={ handleDecline }            >              <Text style={ styles.declineButtonText }>{ t('disclaimer.decline') }</Text>            </TouchableOpacity>            <TouchableOpacity              style={ [styles.acceptButton, !hasRead && styles.acceptButtonDisabled] }              onPress={ handleAccept }              disabled={ !hasRead }            >              <LinearGradient                colors={ !hasRead ? [COLORS.BUTTON_DISABLED, COLORS.BUTTON_DISABLED] : GRADIENT_PRIMARY }                style={ styles.acceptButtonGradient }              >                <Icon name="check-circle" size={ 20 } color={ COLORS.TEXT_WHITE } />                <Text style={ styles.acceptButtonText }>{ t('disclaimer.accept') }</Text>              </LinearGradient>            </TouchableOpacity>          </View>          { /* Additional Info */ }          <View style={ styles.additionalInfo }>            <Icon name="lightbulb-outline" size={ 16 } color={ COLORS.TEXT_LIGHT } />            <Text style={ styles.additionalInfoText }>{ t('disclaimer.additional_info') }</Text>          </View>        </View>      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    overflow: 'hidden',
  },
  acceptButtonDisabled: { opacity: 0.6 },
  acceptButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  acceptButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
    marginLeft: 8,
  },
  additionalInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  additionalInfoText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_LIGHT,
    marginLeft: 8,
    textAlign: 'center',
  },
  background: { flex: 1 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkboxText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    flex: 1,
    marginRight: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  declineButtonText: {
    ...TEXT_STYLES.BUTTON_SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  disclaimerCard: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 20,
    elevation: 8,
    marginBottom: 24,
    padding: 24,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disclaimerContent: { paddingBottom: 16 },
  disclaimerHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 16,
  },
  disclaimerHeaderText: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  disclaimerScroll: { maxHeight: height * 0.3 },
  disclaimerText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  readConfirmation: {
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 20,
  },
  subtitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  title: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default DisclaimerScreen;
