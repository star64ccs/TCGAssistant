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
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../constants';

const { width, height } = Dimensions.get('window');

const CollectionFolderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const collection = useSelector(state => state.collection);

  const [folders, setFolders] = useState([
    {
      id: '1',
      name: '競技卡組',
      description: '用於比賽的卡組',
      color: '#FF6B35',
      cardCount: 12,
      createdAt: '2024-01-15',
      isDefault: true,
    },
    {
      id: '2',
      name: '收藏卡牌',
      description: '珍貴的收藏品',
      color: '#FFD700',
      cardCount: 8,
      createdAt: '2024-02-20',
      isDefault: false,
    },
    {
      id: '3',
      name: '投資卡牌',
      description: '等待增值的卡牌',
      color: '#4CAF50',
      cardCount: 15,
      createdAt: '2024-03-10',
      isDefault: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState({
    name: '',
    description: '',
    color: '#1A1F71',
  });

  const folderColors = [
    '#1A1F71', '#FF6B35', '#FFD700', '#4CAF50', '#9C27B0',
    '#2196F3', '#FF5722', '#795548', '#607D8B', '#E91E63'
  ];

  const handleCreateFolder = () => {
    if (!editingFolder.name.trim()) {
      Alert.alert(t('collection.error'), t('collection.folder_name_required'));
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: editingFolder.name.trim(),
      description: editingFolder.description.trim(),
      color: editingFolder.color,
      cardCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false,
    };

    setFolders([...folders, newFolder]);
    setShowCreateModal(false);
    setEditingFolder({ name: '', description: '', color: '#1A1F71' });
    Alert.alert(t('collection.success'), t('collection.folder_created'));
  };

  const handleEditFolder = () => {
    if (!editingFolder.name.trim()) {
      Alert.alert(t('collection.error'), t('collection.folder_name_required'));
      return;
    }

    const updatedFolders = folders.map(folder =>
      folder.id === selectedFolder.id
        ? { ...folder, name: editingFolder.name.trim(), description: editingFolder.description.trim(), color: editingFolder.color }
        : folder
    );

    setFolders(updatedFolders);
    setShowEditModal(false);
    setSelectedFolder(null);
    setEditingFolder({ name: '', description: '', color: '#1A1F71' });
    Alert.alert(t('collection.success'), t('collection.folder_updated'));
  };

  const handleDeleteFolder = () => {
    if (selectedFolder.isDefault) {
      Alert.alert(t('collection.error'), t('collection.cannot_delete_default_folder'));
      return;
    }

    const updatedFolders = folders.filter(folder => folder.id !== selectedFolder.id);
    setFolders(updatedFolders);
    setShowDeleteModal(false);
    setSelectedFolder(null);
    Alert.alert(t('collection.success'), t('collection.folder_deleted'));
  };

  const handleFolderPress = (folder) => {
    navigation.navigate('CollectionDetail', { folderId: folder.id, folderName: folder.name });
  };

  const handleEditPress = (folder) => {
    setSelectedFolder(folder);
    setEditingFolder({
      name: folder.name,
      description: folder.description,
      color: folder.color,
    });
    setShowEditModal(true);
  };

  const handleDeletePress = (folder) => {
    setSelectedFolder(folder);
    setShowDeleteModal(true);
  };

  const renderFolderItem = ({ item }) => (
    <TouchableOpacity style={styles.folderItem} onPress={() => handleFolderPress(item)}>
      <View style={[styles.folderColor, { backgroundColor: item.color }]} />
      <View style={styles.folderContent}>
        <View style={styles.folderHeader}>
          <Text style={styles.folderName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>{t('collection.default')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.folderDescription}>{item.description}</Text>
        <View style={styles.folderStats}>
          <View style={styles.statItem}>
            <Icon name="cards" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.statText}>{item.cardCount} {t('collection.cards')}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.statText}>{item.createdAt}</Text>
          </View>
        </View>
      </View>
      <View style={styles.folderActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPress(item)}
        >
          <Icon name="pencil" size={20} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePress(item)}
          >
            <Icon name="delete" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('collection.create_folder')}</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_name')}</Text>
              <TextInput
                style={styles.textInput}
                value={editingFolder.name}
                onChangeText={(value) => setEditingFolder({ ...editingFolder, name: value })}
                placeholder={t('collection.folder_name_placeholder')}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_description')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editingFolder.description}
                onChangeText={(value) => setEditingFolder({ ...editingFolder, description: value })}
                placeholder={t('collection.folder_description_placeholder')}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_color')}</Text>
              <View style={styles.colorPicker}>
                {folderColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editingFolder.color === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setEditingFolder({ ...editingFolder, color })}
                  >
                    {editingFolder.color === color && (
                      <Icon name="check" size={16} color={COLORS.TEXT_WHITE} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleCreateFolder}>
              <LinearGradient colors={GRADIENT_PRIMARY} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>{t('collection.create_folder')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('collection.edit_folder')}</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_name')}</Text>
              <TextInput
                style={styles.textInput}
                value={editingFolder.name}
                onChangeText={(value) => setEditingFolder({ ...editingFolder, name: value })}
                placeholder={t('collection.folder_name_placeholder')}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_description')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editingFolder.description}
                onChangeText={(value) => setEditingFolder({ ...editingFolder, description: value })}
                placeholder={t('collection.folder_description_placeholder')}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('collection.folder_color')}</Text>
              <View style={styles.colorPicker}>
                {folderColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editingFolder.color === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setEditingFolder({ ...editingFolder, color })}
                  >
                    {editingFolder.color === color && (
                      <Icon name="check" size={16} color={COLORS.TEXT_WHITE} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleEditFolder}>
              <LinearGradient colors={GRADIENT_PRIMARY} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>{t('collection.update_folder')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <Icon name="delete" size={48} color={COLORS.ERROR} style={styles.deleteIcon} />
          <Text style={styles.confirmTitle}>{t('collection.delete_folder_title')}</Text>
          <Text style={styles.confirmMessage}>
            {t('collection.delete_folder_message', { name: selectedFolder?.name })}
          </Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.confirmButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmButtonDanger]}
              onPress={handleDeleteFolder}
            >
              <Text style={[styles.confirmButtonText, styles.confirmButtonTextDanger]}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENT_PRIMARY} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.TEXT_WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('collection.folders')}</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
            <Icon name="plus" size={24} color={COLORS.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>{t('collection.folders_description')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Icon name="folder" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{folders.length}</Text>
            <Text style={styles.statLabel}>{t('collection.total_folders')}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cards" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>
              {folders.reduce((sum, folder) => sum + folder.cardCount, 0)}
            </Text>
            <Text style={styles.statLabel}>{t('collection.total_cards')}</Text>
          </View>
        </View>

        <FlatList
          data={folders}
          renderItem={renderFolderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="folder-outline" size={60} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyStateText}>{t('collection.no_folders')}</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowCreateModal(true)}
              >
                <LinearGradient colors={GRADIENT_PRIMARY} style={styles.emptyStateButtonGradient}>
                  <Text style={styles.emptyStateButtonText}>{t('collection.create_first_folder')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {renderCreateModal()}
      {renderEditModal()}
      {renderDeleteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  createButton: {
    padding: 8,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_WHITE,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  folderItem: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderColor: {
    height: 4,
    width: '100%',
  },
  folderContent: {
    padding: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  folderName: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  folderDescription: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  folderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  folderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.INPUT_BORDER,
  },
  modalTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  textInput: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.TEXT_WHITE,
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  confirmModal: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  deleteIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  confirmMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: COLORS.ERROR,
  },
  confirmButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  confirmButtonTextDanger: {
    color: COLORS.TEXT_WHITE,
  },
});

export default CollectionFolderScreen;
