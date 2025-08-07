import { Platform } from 'react-native';

// 字體家族定義
export const FONTS = {
  // 標題字體
  TITLE_PRIMARY: Platform.select({
    ios: 'Orbitron-Bold',
    android: 'Orbitron-Bold',
  }),
  TITLE_SECONDARY: Platform.select({
    ios: 'Montserrat-Bold',
    android: 'Montserrat-Bold',
  }),
  
  // 內文字體
  BODY_PRIMARY: Platform.select({
    ios: 'Roboto-Regular',
    android: 'Roboto-Regular',
  }),
  BODY_SECONDARY: Platform.select({
    ios: 'NotoSans-Regular',
    android: 'NotoSans-Regular',
  }),
  
  // 特殊字體
  MONOSPACE: Platform.select({
    ios: 'SFMono-Regular',
    android: 'RobotoMono-Regular',
  }),
};

// 字體大小定義
export const FONT_SIZES = {
  // 標題大小
  TITLE_LARGE: 32,
  TITLE_MEDIUM: 24,
  TITLE_SMALL: 20,
  
  // 副標題
  SUBTITLE_LARGE: 18,
  SUBTITLE_MEDIUM: 16,
  SUBTITLE_SMALL: 14,
  
  // 內文大小
  BODY_LARGE: 16,
  BODY_MEDIUM: 14,
  BODY_SMALL: 12,
  BODY_XSMALL: 10,
  
  // 按鈕文字
  BUTTON_LARGE: 18,
  BUTTON_MEDIUM: 16,
  BUTTON_SMALL: 14,
  
  // 標籤文字
  LABEL_LARGE: 14,
  LABEL_MEDIUM: 12,
  LABEL_SMALL: 10,
  
  // 特殊用途
  CAPTION: 12,
  OVERLINE: 10,
};

// 行高定義
export const LINE_HEIGHTS = {
  TITLE_LARGE: 40,
  TITLE_MEDIUM: 32,
  TITLE_SMALL: 28,
  
  SUBTITLE_LARGE: 24,
  SUBTITLE_MEDIUM: 20,
  SUBTITLE_SMALL: 18,
  
  BODY_LARGE: 24,
  BODY_MEDIUM: 20,
  BODY_SMALL: 16,
  BODY_XSMALL: 14,
  
  BUTTON_LARGE: 24,
  BUTTON_MEDIUM: 20,
  BUTTON_SMALL: 18,
  
  LABEL_LARGE: 20,
  LABEL_MEDIUM: 16,
  LABEL_SMALL: 14,
  
  CAPTION: 16,
  OVERLINE: 14,
};

// 字重定義
export const FONT_WEIGHTS = {
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
  EXTRABOLD: '800',
  BLACK: '900',
};

// 字體樣式定義
export const TEXT_STYLES = {
  // 標題樣式
  TITLE_LARGE: {
    fontFamily: FONTS.TITLE_PRIMARY,
    fontSize: FONT_SIZES.TITLE_LARGE,
    lineHeight: LINE_HEIGHTS.TITLE_LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  TITLE_MEDIUM: {
    fontFamily: FONTS.TITLE_PRIMARY,
    fontSize: FONT_SIZES.TITLE_MEDIUM,
    lineHeight: LINE_HEIGHTS.TITLE_MEDIUM,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  TITLE_SMALL: {
    fontFamily: FONTS.TITLE_PRIMARY,
    fontSize: FONT_SIZES.TITLE_SMALL,
    lineHeight: LINE_HEIGHTS.TITLE_SMALL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  
  // 副標題樣式
  SUBTITLE_LARGE: {
    fontFamily: FONTS.TITLE_SECONDARY,
    fontSize: FONT_SIZES.SUBTITLE_LARGE,
    lineHeight: LINE_HEIGHTS.SUBTITLE_LARGE,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  SUBTITLE_MEDIUM: {
    fontFamily: FONTS.TITLE_SECONDARY,
    fontSize: FONT_SIZES.SUBTITLE_MEDIUM,
    lineHeight: LINE_HEIGHTS.SUBTITLE_MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  SUBTITLE_SMALL: {
    fontFamily: FONTS.TITLE_SECONDARY,
    fontSize: FONT_SIZES.SUBTITLE_SMALL,
    lineHeight: LINE_HEIGHTS.SUBTITLE_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  
  // 內文樣式
  BODY_LARGE: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_LARGE,
    lineHeight: LINE_HEIGHTS.BODY_LARGE,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_MEDIUM: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_MEDIUM,
    lineHeight: LINE_HEIGHTS.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_SMALL: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_SMALL,
    lineHeight: LINE_HEIGHTS.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_XSMALL: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_XSMALL,
    lineHeight: LINE_HEIGHTS.BODY_XSMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  
  // 按鈕樣式
  BUTTON_LARGE: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BUTTON_LARGE,
    lineHeight: LINE_HEIGHTS.BUTTON_LARGE,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  BUTTON_MEDIUM: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BUTTON_MEDIUM,
    lineHeight: LINE_HEIGHTS.BUTTON_MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  BUTTON_SMALL: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BUTTON_SMALL,
    lineHeight: LINE_HEIGHTS.BUTTON_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  
  // 標籤樣式
  LABEL_LARGE: {
    fontFamily: FONTS.BODY_SECONDARY,
    fontSize: FONT_SIZES.LABEL_LARGE,
    lineHeight: LINE_HEIGHTS.LABEL_LARGE,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  LABEL_MEDIUM: {
    fontFamily: FONTS.BODY_SECONDARY,
    fontSize: FONT_SIZES.LABEL_MEDIUM,
    lineHeight: LINE_HEIGHTS.LABEL_MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  LABEL_SMALL: {
    fontFamily: FONTS.BODY_SECONDARY,
    fontSize: FONT_SIZES.LABEL_SMALL,
    lineHeight: LINE_HEIGHTS.LABEL_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  
  // 特殊樣式
  CAPTION: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.CAPTION,
    lineHeight: LINE_HEIGHTS.CAPTION,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  OVERLINE: {
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.OVERLINE,
    lineHeight: LINE_HEIGHTS.OVERLINE,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    letterSpacing: 1.5,
  },
  MONOSPACE: {
    fontFamily: FONTS.MONOSPACE,
    fontSize: FONT_SIZES.BODY_SMALL,
    lineHeight: LINE_HEIGHTS.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
};

export default {
  FONTS,
  FONT_SIZES,
  LINE_HEIGHTS,
  FONT_WEIGHTS,
  TEXT_STYLES,
};
