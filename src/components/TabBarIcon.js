import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';

const TabBarIcon = ({ route, focused, color, size }) => {
  let iconName;

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'CardRecognition':
      iconName = focused ? 'camera' : 'camera-outline';
      break;
    case 'Collection':
      iconName = focused ? 'cards' : 'cards-outline';
      break;
    case 'AIChatbot':
      iconName = focused ? 'robot' : 'robot-outline';
      break;
    default:
      iconName = 'circle';
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon 
        name={iconName} 
        size={size} 
        color={focused ? COLORS.PRIMARY : color} 
      />
    </View>
  );
};

export default TabBarIcon;
