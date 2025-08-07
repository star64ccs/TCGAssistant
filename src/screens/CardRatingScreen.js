import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions, TextInput, Modal, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  rateCard, 
  analyzeCardValue, 
  getCardQualityScore, 
  loadCardRatings, 
  saveCardRating,
  selectCardRatings,
  selectQualityScores,
  selectValueAnalysis,
  selectIsLoading,
  selectError,
  selectFilteredRatings,
  setFilters,
  clearFilters
} from '../store/slices/cardRatingSlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../constants';

const { width, height } = Dimensions.get('window');

const CardRatingScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const cardRatings = useSelector(selectCardRatings);
  const qualityScores = useSelector(selectQualityScores);
  const valueAnalysis = useSelector(selectValueAnalysis);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const filteredRatings = useSelector(selectFilteredRatings);
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [ratingData, setRatingData] = useState({
    overallRating: 0,
    condition: 0,
    centering: 0,
    corners: 0,
    edges: 0,
    surface: 0,
    estimatedValue: 0,
    notes: '',
  });

  useEffect(() => {
    dispatch(loadCardRatings());
  }, [dispatch]);

  const handleRateCard = () => {
    if (!selectedCard) return;
    
    dispatch(saveCardRating({
      cardId: selectedCard.id,
      rating: ratingData,
    })).then((result) => {
      if (!result.error) {
        setRatingModalVisible(false);
        setSelectedCard(null);
        setRatingData({
          overallRating: 0,
          condition: 0,
          centering: 0,
          corners: 0,
          edges: 0,
          surface: 0,
          estimatedValue: 0,
          notes: '',
        });
        Alert.alert(t('success'), t('card_rating_saved'));
      }
    });
  };

  const handleAnalyzeValue = (cardId) => {
    dispatch(analyzeCardValue({ cardId, analysisType: 'comprehensive' }));
  };

  const handleQualityScore = (cardId, images) => {
    dispatch(getCardQualityScore({ cardId, images }));
  };

  const renderRatingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ratingItem}
      onPress={() => {
        setSelectedCard(item);
        setRatingData({
          overallRating: item.overallRating || 0,
          condition: item.condition || 0,
          centering: item.centering || 0,
          corners: item.corners || 0,
          edges: item.edges || 0,
          surface: item.surface || 0,
          estimatedValue: item.estimatedValue || 0,
          notes: item.notes || '',
        });
        setRatingModalVisible(true);
      }}
    >
      <View style={styles.ratingItemHeader}>
        <Text style={styles.cardName}>{item.cardName || 'Unknown Card'}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.overallRating || 0}/10</Text>
        </View>
      </View>
      
      <View style={styles.ratingDetails}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>{t('condition')}:</Text>
          <Text style={styles.ratingValue}>{item.condition || 0}/10</Text>
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>{t('estimated_value')}:</Text>
          <Text style={styles.ratingValue}>${item.estimatedValue || 0}</Text>
        </View>
      </View>
      
      <View style={styles.ratingActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAnalyzeValue(item.cardId)}
        >
          <Icon name="chart-line" size={16} color={COLORS.WHITE} />
          <Text style={styles.actionText}>{t('analyze_value')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleQualityScore(item.cardId, item.images)}
        >
          <Icon name="magnify" size={16} color={COLORS.WHITE} />
          <Text style={styles.actionText}>{t('quality_score')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderRatingModal = () => (
    <Modal
      visible={ratingModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setRatingModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('rate_card')}</Text>
            <TouchableOpacity onPress={() => setRatingModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>{t('overall_rating')}</Text>
            <View style={styles.ratingSlider}>
              <Text style={styles.ratingValue}>{ratingData.overallRating}/10</Text>
              <View style={styles.sliderContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.ratingDot,
                      ratingData.overallRating >= value && styles.ratingDotActive
                    ]}
                    onPress={() => setRatingData({...ratingData, overallRating: value})}
                  />
                ))}
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>{t('condition_rating')}</Text>
            <View style={styles.ratingSlider}>
              <Text style={styles.ratingValue}>{ratingData.condition}/10</Text>
              <View style={styles.sliderContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.ratingDot,
                      ratingData.condition >= value && styles.ratingDotActive
                    ]}
                    onPress={() => setRatingData({...ratingData, condition: value})}
                  />
                ))}
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>{t('estimated_value')}</Text>
            <TextInput
              style={styles.input}
              value={ratingData.estimatedValue.toString()}
              onChangeText={(text) => setRatingData({...ratingData, estimatedValue: parseFloat(text) || 0})}
              keyboardType="numeric"
              placeholder={t('enter_value')}
              placeholderTextColor={COLORS.GRAY}
            />
            
            <Text style={styles.sectionTitle}>{t('notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={ratingData.notes}
              onChangeText={(text) => setRatingData({...ratingData, notes: text})}
              placeholder={t('add_notes')}
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRatingModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleRateCard}
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
        <Text style={styles.headerTitle}>{t('card_rating')}</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Icon name="filter-variant" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{cardRatings.length}</Text>
            <Text style={styles.statLabel}>{t('total_ratings')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {cardRatings.length > 0 
                ? (cardRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / cardRatings.length).toFixed(1)
                : 0
              }
            </Text>
            <Text style={styles.statLabel}>{t('average_rating')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              ${cardRatings.reduce((sum, r) => sum + (r.estimatedValue || 0), 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{t('total_value')}</Text>
          </View>
        </View>
        
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('card_ratings')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedCard({ id: Date.now().toString() });
              setRatingData({
                overallRating: 0,
                condition: 0,
                centering: 0,
                corners: 0,
                edges: 0,
                surface: 0,
                estimatedValue: 0,
                notes: '',
              });
              setRatingModalVisible(true);
            }}
          >
            <Icon name="plus" size={20} color={COLORS.WHITE} />
            <Text style={styles.addButtonText}>{t('add_rating')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredRatings}
          renderItem={renderRatingItem}
          keyExtractor={(item) => item.cardId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      
      {renderRatingModal()}
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
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
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
  ratingItem: {
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
  ratingItemHeader: {
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
  ratingBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    ...TEXT_STYLES.body2,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  ratingDetails: {
    marginBottom: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ratingLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.GRAY,
  },
  ratingValue: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  ratingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
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
  ratingSlider: {
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ratingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  ratingDotActive: {
    backgroundColor: COLORS.PRIMARY,
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

export default CardRatingScreen;
