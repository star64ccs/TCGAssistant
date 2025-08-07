import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import feedbackService, { FEEDBACK_TYPES, FEEDBACK_PRIORITY } from '../services/feedbackService';

const FeedbackScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(FEEDBACK_TYPES.GENERAL_FEEDBACK);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(FEEDBACK_PRIORITY.NORMAL);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    loadFeedbackHistory();
    loadFeedbackStats();
  }, []);

  const loadFeedbackHistory = async () => {
    try {
      const history = await feedbackService.getFeedbackHistory(50, 0);
      setFeedbackHistory(history);
    } catch (error) {
      console.error('Failed to load feedback history:', error);
    }
  };

  const loadFeedbackStats = async () => {
    try {
      const feedbackStats = await feedbackService.getFeedbackStats();
      setStats(feedbackStats);
    } catch (error) {
      console.error('Failed to load feedback stats:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      Alert.alert('錯誤', '請填寫標題和描述');
      return;
    }

    try {
      const result = await feedbackService.submitFeedback({
        type: selectedFeedbackType,
        title: feedbackTitle.trim(),
        description: feedbackDescription.trim(),
        priority: selectedPriority,
        category: 'general',
      });

      if (result.success) {
        Alert.alert('成功', '反饋已提交，感謝您的意見！');
        setShowSubmitModal(false);
        resetForm();
        loadFeedbackHistory();
        loadFeedbackStats();
      } else {
        Alert.alert('提示', '反饋已保存，將在網路連線時自動提交');
        setShowSubmitModal(false);
        resetForm();
      }
    } catch (error) {
      Alert.alert('錯誤', '提交失敗，請稍後再試');
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedFeature.trim()) {
      Alert.alert('錯誤', '請選擇要評分的功能');
      return;
    }

    try {
      const result = await feedbackService.submitRating({
        feature: selectedFeature.trim(),
        rating,
        comment: ratingComment.trim(),
      });

      if (result.success) {
        Alert.alert('成功', '評分已提交，感謝您的反饋！');
        setShowRatingModal(false);
        resetRatingForm();
      } else {
        Alert.alert('提示', '評分已保存，將在網路連線時自動提交');
        setShowRatingModal(false);
        resetRatingForm();
      }
    } catch (error) {
      Alert.alert('錯誤', '提交失敗，請稍後再試');
    }
  };

  const resetForm = () => {
    setFeedbackTitle('');
    setFeedbackDescription('');
    setSelectedFeedbackType(FEEDBACK_TYPES.GENERAL_FEEDBACK);
    setSelectedPriority(FEEDBACK_PRIORITY.NORMAL);
  };

  const resetRatingForm = () => {
    setSelectedFeature('');
    setRating(5);
    setRatingComment('');
  };

  const getFeedbackTypeLabel = (type) => {
    switch (type) {
      case FEEDBACK_TYPES.BUG_REPORT:
        return '錯誤報告';
      case FEEDBACK_TYPES.FEATURE_REQUEST:
        return '功能建議';
      case FEEDBACK_TYPES.GENERAL_FEEDBACK:
        return '一般反饋';
      case FEEDBACK_TYPES.USER_EXPERIENCE:
        return '使用體驗';
      default:
        return '其他';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case FEEDBACK_PRIORITY.LOW:
        return '#4caf50';
      case FEEDBACK_PRIORITY.NORMAL:
        return '#ff9800';
      case FEEDBACK_PRIORITY.HIGH:
        return '#f44336';
      case FEEDBACK_PRIORITY.CRITICAL:
        return '#9c27b0';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'in_progress':
        return '#2196f3';
      case 'resolved':
        return '#4caf50';
      case 'closed':
        return '#666';
      default:
        return '#666';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      <Text style={styles.feedbackDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.feedbackMeta}>
        <Text style={styles.feedbackType}>{getFeedbackTypeLabel(item.type)}</Text>
        <Text style={styles.feedbackTime}>{formatTime(item.createdAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>反饋統計</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Icon name="message-text" size={24} color="#00ffff" />
          <Text style={styles.statNumber}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>總反饋</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={24} color="#4caf50" />
          <Text style={styles.statNumber}>{stats?.resolved || 0}</Text>
          <Text style={styles.statLabel}>已解決</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="clock" size={24} color="#ff9800" />
          <Text style={styles.statNumber}>{stats?.pending || 0}</Text>
          <Text style={styles.statLabel}>待處理</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#00ffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>意見反饋</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowSubmitModal(true)}>
          <Icon name="plus" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {renderStatsCard()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSubmitModal(true)}
          >
            <Icon name="message-text" size={20} color="#00ffff" />
            <Text style={styles.actionButtonText}>提交反饋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowRatingModal(true)}
          >
            <Icon name="star" size={20} color="#ffeb3b" />
            <Text style={styles.actionButtonText}>功能評分</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>反饋歷史</Text>
          {feedbackHistory.length > 0 ? (
            <FlatList
              data={feedbackHistory}
              renderItem={renderFeedbackItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="message-text-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>還沒有提交過反饋</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowSubmitModal(true)}
              >
                <Text style={styles.emptyButtonText}>提交第一個反饋</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Feedback Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>提交反饋</Text>
              <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                <Icon name="close" size={24} color="#00ffff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>標題</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="請輸入反饋標題"
                  placeholderTextColor="#666"
                  value={feedbackTitle}
                  onChangeText={setFeedbackTitle}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>描述</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="請詳細描述您的意見或建議"
                  placeholderTextColor="#666"
                  value={feedbackDescription}
                  onChangeText={setFeedbackDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.submitButtonText}>提交</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#2A2F81',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00ffff',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2F81',
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  feedbackItem: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  feedbackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackType: {
    fontSize: 12,
    color: '#666',
  },
  feedbackTime: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1F71',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.2)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2F81',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#00ffff',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;
