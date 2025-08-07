import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions, TextInput, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  loadTradingHistory, 
  addTradingRecord, 
  updateTradingRecord, 
  deleteTradingRecord,
  analyzeTradingPerformance,
  getTradingTrends,
  selectTradingHistory,
  selectPerformanceAnalysis,
  selectTradingTrends,
  selectIsLoading,
  selectError,
  selectFilteredTradingHistory,
  setFilters,
  clearFilters,
  calculatePerformance
} from '../store/slices/tradingHistorySlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../constants';

const { width, height } = Dimensions.get('window');

const TradingHistoryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const tradingHistory = useSelector(selectTradingHistory);
  const performanceAnalysis = useSelector(selectPerformanceAnalysis);
  const tradingTrends = useSelector(selectTradingTrends);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const filteredHistory = useSelector(selectFilteredTradingHistory);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [recordData, setRecordData] = useState({
    cardName: '',
    tradeType: 'buy', // buy, sell, trade
    amount: 0,
    profit: 0,
    date: new Date().toISOString(),
    notes: '',
    cardType: 'pokemon', // pokemon, yugioh, magic, etc.
  });

  useEffect(() => {
    dispatch(loadTradingHistory());
  }, [dispatch]);

  useEffect(() => {
    if (tradingHistory.length > 0) {
      dispatch(calculatePerformance());
    }
  }, [tradingHistory, dispatch]);

  const handleSaveRecord = () => {
    if (!recordData.cardName || recordData.amount <= 0) {
      Alert.alert(t('error'), t('please_fill_required_fields'));
      return;
    }
    
    if (selectedRecord) {
      dispatch(updateTradingRecord({
        id: selectedRecord.id,
        updates: recordData,
      })).then((result) => {
        if (!result.error) {
          setRecordModalVisible(false);
          setSelectedRecord(null);
          resetRecordData();
          Alert.alert(t('success'), t('record_updated'));
        }
      });
    } else {
      dispatch(addTradingRecord(recordData)).then((result) => {
        if (!result.error) {
          setRecordModalVisible(false);
          resetRecordData();
          Alert.alert(t('success'), t('record_added'));
        }
      });
    }
  };

  const handleDeleteRecord = (id) => {
    Alert.alert(
      t('confirm_delete'),
      t('delete_record_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTradingRecord(id));
          },
        },
      ]
    );
  };

  const resetRecordData = () => {
    setRecordData({
      cardName: '',
      tradeType: 'buy',
      amount: 0,
      profit: 0,
      date: new Date().toISOString(),
      notes: '',
      cardType: 'pokemon',
    });
  };

  const renderTradeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tradeItem}
      onPress={() => {
        setSelectedRecord(item);
        setRecordData({
          cardName: item.cardName || '',
          tradeType: item.tradeType || 'buy',
          amount: item.amount || 0,
          profit: item.profit || 0,
          date: item.createdAt || new Date().toISOString(),
          notes: item.notes || '',
          cardType: item.cardType || 'pokemon',
        });
        setRecordModalVisible(true);
      }}
    >
      <View style={styles.tradeItemHeader}>
        <Text style={styles.cardName}>{item.cardName || 'Unknown Card'}</Text>
        <View style={[
          styles.tradeTypeBadge,
          { backgroundColor: item.tradeType === 'buy' ? COLORS.SUCCESS : COLORS.ERROR }
        ]}>
          <Text style={styles.tradeTypeText}>{t(item.tradeType)}</Text>
        </View>
      </View>
      
      <View style={styles.tradeDetails}>
        <View style={styles.tradeRow}>
          <Text style={styles.tradeLabel}>{t('amount')}:</Text>
          <Text style={styles.tradeValue}>${item.amount || 0}</Text>
        </View>
        <View style={styles.tradeRow}>
          <Text style={styles.tradeLabel}>{t('profit')}:</Text>
          <Text style={[
            styles.tradeValue,
            { color: (item.profit || 0) >= 0 ? COLORS.SUCCESS : COLORS.ERROR }
          ]}>
            ${item.profit || 0}
          </Text>
        </View>
        <View style={styles.tradeRow}>
          <Text style={styles.tradeLabel}>{t('date')}:</Text>
          <Text style={styles.tradeValue}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.tradeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteRecord(item.id)}
        >
          <Icon name="delete" size={16} color={COLORS.WHITE} />
          <Text style={styles.actionText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPerformanceStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>{t('performance_summary')}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{performanceAnalysis.totalTrades}</Text>
          <Text style={styles.statLabel}>{t('total_trades')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${performanceAnalysis.netProfit?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>{t('net_profit')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{performanceAnalysis.winRate?.toFixed(1) || 0}%</Text>
          <Text style={styles.statLabel}>{t('win_rate')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{performanceAnalysis.profitFactor?.toFixed(2) || 0}</Text>
          <Text style={styles.statLabel}>{t('profit_factor')}</Text>
        </View>
      </View>
    </View>
  );

  const renderRecordModal = () => (
    <Modal
      visible={recordModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setRecordModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedRecord ? t('edit_record') : t('add_record')}
            </Text>
            <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>{t('card_name')} *</Text>
            <TextInput
              style={styles.input}
              value={recordData.cardName}
              onChangeText={(text) => setRecordData({...recordData, cardName: text})}
              placeholder={t('enter_card_name')}
              placeholderTextColor={COLORS.GRAY}
            />
            
            <Text style={styles.sectionTitle}>{t('trade_type')}</Text>
            <View style={styles.tradeTypeContainer}>
              {['buy', 'sell', 'trade'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.tradeTypeButton,
                    recordData.tradeType === type && styles.tradeTypeButtonActive
                  ]}
                  onPress={() => setRecordData({...recordData, tradeType: type})}
                >
                  <Text style={[
                    styles.tradeTypeButtonText,
                    recordData.tradeType === type && styles.tradeTypeButtonTextActive
                  ]}>
                    {t(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>{t('amount')} *</Text>
            <TextInput
              style={styles.input}
              value={recordData.amount.toString()}
              onChangeText={(text) => setRecordData({...recordData, amount: parseFloat(text) || 0})}
              keyboardType="numeric"
              placeholder={t('enter_amount')}
              placeholderTextColor={COLORS.GRAY}
            />
            
            <Text style={styles.sectionTitle}>{t('profit_loss')}</Text>
            <TextInput
              style={styles.input}
              value={recordData.profit.toString()}
              onChangeText={(text) => setRecordData({...recordData, profit: parseFloat(text) || 0})}
              keyboardType="numeric"
              placeholder={t('enter_profit_loss')}
              placeholderTextColor={COLORS.GRAY}
            />
            
            <Text style={styles.sectionTitle}>{t('notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recordData.notes}
              onChangeText={(text) => setRecordData({...recordData, notes: text})}
              placeholder={t('add_notes')}
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRecordModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecord}
            >
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={GRADIENT_PRIMARY} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trading_history')}</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Icon name="filter-variant" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderPerformanceStats()}
        
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('trade_records')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedRecord(null);
              resetRecordData();
              setRecordModalVisible(true);
            }}
          >
            <Icon name="plus" size={20} color={COLORS.WHITE} />
            <Text style={styles.addButtonText}>{t('add_record')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredHistory}
          renderItem={renderTradeItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      
      {renderRecordModal()}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.WHITE,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.TEXT,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },
  statLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.TEXT,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    ...TEXT_STYLES.body2,
    color: COLORS.WHITE,
    marginLeft: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tradeItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tradeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardName: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    flex: 1,
  },
  tradeTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tradeTypeText: {
    ...TEXT_STYLES.body2,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  tradeDetails: {
    marginBottom: 15,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tradeLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.GRAY,
  },
  tradeValue: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  tradeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  actionText: {
    ...TEXT_STYLES.body3,
    color: COLORS.WHITE,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.TEXT,
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 10,
  },
  tradeTypeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  tradeTypeButtonText: {
    ...TEXT_STYLES.body2,
    color: COLORS.GRAY,
  },
  tradeTypeButtonTextActive: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    ...TEXT_STYLES.body2,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});

export default TradingHistoryScreen;
