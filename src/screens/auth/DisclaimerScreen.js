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
  const { t, i18n } = useTranslation();
  const [hasRead, setHasRead] = useState(false);

  const currentLanguage = i18n.language;
  const disclaimerText = DISCLAIMER_TEXT[currentLanguage] || DISCLAIMER_TEXT['zh-TW'];

  const handleAccept = async () => {
    if (!hasRead) {
      Alert.alert(
        t('disclaimer.attention'),
        t('disclaimer.must_read_first'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    try {
      await dispatch(acceptDisclaimer()).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.unknown_error'));
    }
  };

  const handleDecline = () => {
    Alert.alert(
      t('disclaimer.decline_title'),
      t('disclaimer.decline_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => {} }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENT_PRIMARY} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="shield-alert" size={40} color={COLORS.TEXT_WHITE} />
          </View>
          <Text style={styles.title}>{t('disclaimer.title')}</Text>
          <Text style={styles.subtitle}>{t('disclaimer.subtitle')}</Text>
        </View>

        {/* Disclaimer Content */}
        <View style={styles.contentContainer}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <Icon name="information" size={24} color={COLORS.WARNING} />
              <Text style={styles.disclaimerHeaderText}>{t('disclaimer.important_notice')}</Text>
            </View>

            <ScrollView
              style={styles.disclaimerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.disclaimerContent}
            >
              <Text style={styles.disclaimerText}>{disclaimerText}</Text>
            </ScrollView>

            {/* Read Confirmation */}
            <View style={styles.readConfirmation}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setHasRead(!hasRead)}
              >
                <Icon
                  name={hasRead ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={24}
                  color={hasRead ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.checkboxText}>{t('disclaimer.i_have_read')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>{t('disclaimer.decline')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, !hasRead && styles.acceptButtonDisabled]}
              onPress={handleAccept}
              disabled={!hasRead}
            >
              <LinearGradient
                colors={!hasRead ? [COLORS.BUTTON_DISABLED, COLORS.BUTTON_DISABLED] : GRADIENT_PRIMARY}
                style={styles.acceptButtonGradient}
              >
                <Icon name="check-circle" size={20} color={COLORS.TEXT_WHITE} />
                <Text style={styles.acceptButtonText}>{t('disclaimer.accept')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Icon name="lightbulb-outline" size={16} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.additionalInfoText}>{t('disclaimer.additional_info')}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  disclaimerCard: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
  },
  disclaimerHeaderText: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  disclaimerScroll: {
    maxHeight: height * 0.3,
  },
  disclaimerContent: {
    paddingBottom: 16,
  },
  disclaimerText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
  },
  readConfirmation: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.CARD_BORDER,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLORS.CARD_BACKGROUND,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    alignItems: 'center',
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  declineButtonText: {
    ...TEXT_STYLES.BUTTON_SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 12,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  acceptButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
    marginLeft: 8,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  additionalInfoText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_LIGHT,
    marginLeft: 8,
    textAlign: 'center',
  },
});

export default DisclaimerScreen;
