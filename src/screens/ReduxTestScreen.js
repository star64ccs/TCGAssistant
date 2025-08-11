import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ReduxTestComponent from '../components/ReduxTestComponent';

const ReduxTestScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ReduxTestComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
});

export default ReduxTestScreen;
