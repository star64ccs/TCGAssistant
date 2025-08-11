import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { completeOnboarding, acceptDisclaimer } from '../store/slices/authSlice';

// 常數
import { COLORS, ROUTES, DISCLAIMER_TEXT } from '../constants';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.settings);
  const [currentStep, setCurrentStep] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const onboardingSteps = [
    {      title: '歡迎使用 TCG 助手',      description: '您的專業卡牌辨識與分析工具',      icon: 'card-outline',      image: require('../assets/tcg-logo.svg'),
    },
    {      title: 'AI 卡牌辨識',      description: '使用先進的機器學習技術，快速識別您的卡牌',      icon: 'camera-outline',      image: require('../assets/icon.png'),
    },
    {      title: '價格分析與預測',      description: '獲取即時價格資訊和 AI 驅動的價格預測',      icon: 'trending-up-outline',      image: require('../assets/icon.png'),
    },
    {      title: '真偽判斷',      description: '專業的真偽檢測技術，保護您的投資',      icon: 'shield-checkmark-outline',      image: require('../assets/icon.png'),
    },
    {      title: '收藏管理',      description: '輕鬆管理您的卡牌收藏，追蹤價值變化',      icon: 'folder-outline',      image: require('../assets/icon.png'),
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {      setCurrentStep(currentStep + 1);
    } else {      // 顯示免責聲明      showDisclaimer();
    }
  };

  const handleSkip = () => {
    showDisclaimer();
  };

  const showDisclaimer = () => {
    Alert.alert(      '免責聲明',      DISCLAIMER_TEXT[language] || DISCLAIMER_TEXT['zh-TW'],      [        {          text: '不同意',          style: 'cancel',          onPress: () => {            // 用戶不同意，可以選擇退出應用            Alert.alert(              '退出應用',              '您需要同意免責聲明才能使用本應用程式',              [                { text: '重新考慮', style: 'cancel' },                { text: '退出', style: 'destructive', onPress: () => {} },              ],            );          },        },        {          text: '同意並繼續',          onPress: () => {            setDisclaimerAccepted(true);            completeOnboardingProcess();          },        },      ],      { cancelable: false },
    );
  };

  const completeOnboardingProcess = () => {
    dispatch(acceptDisclaimer());
    dispatch(completeOnboarding());
  };

  const renderStep = (step, index) => {
    const isActive = index === currentStep;    return (      <View key={index} style={[styles.stepContainer, isActive && styles.activeStep]}>        <View style={styles.stepContent}>          <View style={styles.iconContainer}>            <Ionicons              name={step.icon}              size={60}              color={isActive ? COLORS.PRIMARY : COLORS.TEXT_LIGHT}            />          </View>          <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>            {step.title}          </Text>          <Text style={[styles.stepDescription, isActive && styles.activeStepDescription]}>            {step.description}          </Text>        </View>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <Text style={styles.headerTitle}>TCG 助手</Text>        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>          <Text style={styles.skipText}>跳過</Text>        </TouchableOpacity>      </View>      <ScrollView        style={styles.content}        showsVerticalScrollIndicator={false}        pagingEnabled        horizontal        onMomentumScrollEnd={(event) => {          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);          setCurrentStep(newIndex);        }}      >        {onboardingSteps.map((step, index) => (          <View key={index} style={styles.slide}>            {renderStep(step, index)}          </View>        ))}      </ScrollView>      <View style={styles.footer}>        <View style={styles.pagination}>          {onboardingSteps.map((_, index) => (            <View              key={index}              style={[                styles.paginationDot,                index === currentStep && styles.paginationDotActive,              ]}            />          ))}        </View>        <TouchableOpacity          style={[styles.nextButton, currentStep === onboardingSteps.length - 1 && styles.finishButton]}          onPress={handleNext}        >          <Text style={styles.nextButtonText}>            {currentStep === onboardingSteps.length - 1 ? '開始使用' : '下一步'}          </Text>          <Ionicons            name={currentStep === onboardingSteps.length - 1 ? 'checkmark' : 'arrow-forward'}            size={20}            color={COLORS.TEXT_WHITE}          />        </TouchableOpacity>      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeStep: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  activeStepDescription: {
    color: COLORS.TEXT_SECONDARY,
  },
  activeStepTitle: {
    color: COLORS.TEXT_PRIMARY,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  finishButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  footer: {
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 60,
    elevation: 5,
    height: 120,
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 120,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    backgroundColor: COLORS.TEXT_LIGHT,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  paginationDotActive: {
    backgroundColor: COLORS.PRIMARY,
    width: 24,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
  },
  slide: {
    alignItems: 'center',
    height: height * 0.7,
    justifyContent: 'center',
    paddingHorizontal: 30,
    width,
  },
  stepContainer: {
    alignItems: 'center',
    opacity: 0.5,
    transform: [{ scale: 0.9 }],
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  stepDescription: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  stepTitle: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
