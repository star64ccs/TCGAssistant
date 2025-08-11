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
  const { t,
  } = useTranslation();
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
    '#2196F3', '#FF5722', '#795548', '#607D8B', '#E91E63',
  ];

  const handleCreateFolder = () => {
    if (!editingFolder.name.trim()) {      Alert.alert(t('collection.error'), t('collection.folder_name_required'));      return;
    }    const newFolder = {
      id: Date.now().toString(),
      name: editingFolder.name.trim(),
      description: editingFolder.description.trim(),
      color: editingFolder.color,
      cardCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false,
    };    setFolders([...folders, newFolder]);
    setShowCreateModal(false);
    setEditingFolder({ name: '', description: '', color: '#1A1F71' });
    Alert.alert(t('collection.success'), t('collection.folder_created'));
  };

  const handleEditFolder = () => {
    if (!editingFolder.name.trim()) {      Alert.alert(t('collection.error'), t('collection.folder_name_required'));      return;
    }    const updatedFolders = folders.map(folder =>      folder.id === selectedFolder.id        ? { ...folder, name: editingFolder.name.trim(), description: editingFolder.description.trim(), color: editingFolder.color }        : folder,
    );    setFolders(updatedFolders);
    setShowEditModal(false);
    setSelectedFolder(null);
    setEditingFolder({ name: '', description: '', color: '#1A1F71' });
    Alert.alert(t('collection.success'), t('collection.folder_updated'));
  };

  const handleDeleteFolder = () => {
    if (selectedFolder.isDefault) {      Alert.alert(t('collection.error'), t('collection.cannot_delete_default_folder'));      return;
    }    const updatedFolders = folders.filter(folder => folder.id !== selectedFolder.id);
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
    setEditingFolder({      name: folder.name,
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
    <TouchableOpacity style={ styles.folderItem } onPress={ () => handleFolderPress(item) }>      <View style={ [styles.folderColor, { backgroundColor: item.color }]} />      <View style={ styles.folderContent }>        <View style={ styles.folderHeader }>          <Text style={ styles.folderName }>{ item.name }</Text>          {
            item.isDefault ? <View style={styles.defaultBadge
              }>                <Text style={ styles.defaultBadgeText }>{ t('collection.default') }</Text>              </View> : null}        </View>        <Text style={ styles.folderDescription }>{ item.description }</Text>        <View style={ styles.folderStats }>          <View style={ styles.statItem }>            <Icon name="cards" size={ 16 } color={ COLORS.TEXT_SECONDARY } />            <Text style={ styles.statText }>{ item.cardCount } { t('collection.cards') }</Text>          </View>          <View style={ styles.statItem }>            <Icon name="calendar" size={ 16 } color={ COLORS.TEXT_SECONDARY } />            <Text style={ styles.statText }>{ item.createdAt }</Text>          </View>        </View>      </View>      <View style={ styles.folderActions }>        <TouchableOpacity          style={ styles.actionButton }          onPress={ () => handleEditPress(item) }        >          <Icon name="pencil" size={ 20 } color={ COLORS.PRIMARY } />        </TouchableOpacity>        {
          !item.isDefault && (            <TouchableOpacity              style={styles.actionButton
              }              onPress={ () => handleDeletePress(item) }            >              <Icon name="delete" size={ 20 } color={ COLORS.ERROR } />            </TouchableOpacity>          )}      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal      visible={ showCreateModal }      transparent={ true }      animationType="slide"      onRequestClose={ () => setShowCreateModal(false) }
    >      <View style={ styles.modalOverlay }>        <View style={ styles.modalContent }>          <View style={ styles.modalHeader }>            <Text style={ styles.modalTitle }>{ t('collection.create_folder') }</Text>            <TouchableOpacity onPress={ () => setShowCreateModal(false) }>              <Icon name="close" size={ 24 } color={ COLORS.TEXT_PRIMARY } />            </TouchableOpacity>          </View>          <ScrollView style={ styles.modalBody }>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_name') }</Text>              <TextInput                style={ styles.textInput }                value={ editingFolder.name }                onChangeText={ (value) => setEditingFolder({ ...editingFolder, name: value })}                placeholder={ t('collection.folder_name_placeholder') }                maxLength={ 50 }              />            </View>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_description') }</Text>              <TextInput                style={ [styles.textInput, styles.textArea] }                value={ editingFolder.description }                onChangeText={ (value) => setEditingFolder({ ...editingFolder, description: value })}                placeholder={ t('collection.folder_description_placeholder') }                multiline                numberOfLines={ 3 }                maxLength={ 200 }              />            </View>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_color') }</Text>              <View style={ styles.colorPicker }>                {
                  folderColors.map((color) => (                    <TouchableOpacity                      key={color
                      }                      style={
                        [                          styles.colorOption,                          { backgroundColor: color,
                          },                          editingFolder.color === color && styles.colorOptionSelected,                        ]}                      onPress={ () => setEditingFolder({ ...editingFolder, color })}                    >                      {
                        editingFolder.color === color && (                          <Icon name="check" size={16
                          } color={ COLORS.TEXT_WHITE } />                        )}                    </TouchableOpacity>                  ))}              </View>            </View>            <TouchableOpacity style={ styles.modalButton } onPress={ handleCreateFolder }>              <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.modalButtonGradient }>                <Text style={ styles.modalButtonText }>{ t('collection.create_folder') }</Text>              </LinearGradient>            </TouchableOpacity>          </ScrollView>        </View>      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal      visible={ showEditModal }      transparent={ true }      animationType="slide"      onRequestClose={ () => setShowEditModal(false) }
    >      <View style={ styles.modalOverlay }>        <View style={ styles.modalContent }>          <View style={ styles.modalHeader }>            <Text style={ styles.modalTitle }>{ t('collection.edit_folder') }</Text>            <TouchableOpacity onPress={ () => setShowEditModal(false) }>              <Icon name="close" size={ 24 } color={ COLORS.TEXT_PRIMARY } />            </TouchableOpacity>          </View>          <ScrollView style={ styles.modalBody }>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_name') }</Text>              <TextInput                style={ styles.textInput }                value={ editingFolder.name }                onChangeText={ (value) => setEditingFolder({ ...editingFolder, name: value })}                placeholder={ t('collection.folder_name_placeholder') }                maxLength={ 50 }              />            </View>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_description') }</Text>              <TextInput                style={ [styles.textInput, styles.textArea] }                value={ editingFolder.description }                onChangeText={ (value) => setEditingFolder({ ...editingFolder, description: value })}                placeholder={ t('collection.folder_description_placeholder') }                multiline                numberOfLines={ 3 }                maxLength={ 200 }              />            </View>            <View style={ styles.inputGroup }>              <Text style={ styles.inputLabel }>{ t('collection.folder_color') }</Text>              <View style={ styles.colorPicker }>                {
                  folderColors.map((color) => (                    <TouchableOpacity                      key={color
                      }                      style={
                        [                          styles.colorOption,                          { backgroundColor: color,
                          },                          editingFolder.color === color && styles.colorOptionSelected,                        ]}                      onPress={ () => setEditingFolder({ ...editingFolder, color })}                    >                      {
                        editingFolder.color === color && (                          <Icon name="check" size={16
                          } color={ COLORS.TEXT_WHITE } />                        )}                    </TouchableOpacity>                  ))}              </View>            </View>            <TouchableOpacity style={ styles.modalButton } onPress={ handleEditFolder }>              <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.modalButtonGradient }>                <Text style={ styles.modalButtonText }>{ t('collection.update_folder') }</Text>              </LinearGradient>            </TouchableOpacity>          </ScrollView>        </View>      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal      visible={ showDeleteModal }      transparent={ true }      animationType="fade"      onRequestClose={ () => setShowDeleteModal(false) }
    >      <View style={ styles.modalOverlay }>        <View style={ styles.confirmModal }>          <Icon name="delete" size={ 48 } color={ COLORS.ERROR } style={ styles.deleteIcon } />          <Text style={ styles.confirmTitle }>{ t('collection.delete_folder_title') }</Text>          <Text style={ styles.confirmMessage }>            { t('collection.delete_folder_message', { name: selectedFolder?.name })}          </Text>          <View style={ styles.confirmButtons }>            <TouchableOpacity              style={ styles.confirmButton }              onPress={ () => setShowDeleteModal(false) }            >              <Text style={ styles.confirmButtonText }>{ t('common.cancel') }</Text>            </TouchableOpacity>            <TouchableOpacity              style={ [styles.confirmButton, styles.confirmButtonDanger] }              onPress={ handleDeleteFolder }            >              <Text style={ [styles.confirmButtonText, styles.confirmButtonTextDanger] }>                { t('common.delete') }              </Text>            </TouchableOpacity>          </View>        </View>      </View>
    </Modal>
  );

  return (
    <View style={ styles.container }>      <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.header }>        <View style={ styles.headerContent }>          <TouchableOpacity style={ styles.backButton } onPress={ () => navigation.goBack() }>            <Icon name="arrow-left" size={ 24 } color={ COLORS.TEXT_WHITE } />          </TouchableOpacity>          <Text style={ styles.headerTitle }>{ t('collection.folders') }</Text>          <TouchableOpacity style={ styles.createButton } onPress={ () => setShowCreateModal(true) }>            <Icon name="plus" size={ 24 } color={ COLORS.TEXT_WHITE } />          </TouchableOpacity>        </View>        <Text style={ styles.headerSubtitle }>{ t('collection.folders_description') }</Text>      </LinearGradient>      <View style={ styles.content }>        <View style={ styles.statsSection }>          <View style={ styles.statCard }>            <Icon name="folder" size={ 24 } color={ COLORS.PRIMARY } />            <Text style={ styles.statValue }>{ folders.length }</Text>            <Text style={ styles.statLabel }>{ t('collection.total_folders') }</Text>          </View>          <View style={ styles.statCard }>            <Icon name="cards" size={ 24 } color={ COLORS.PRIMARY } />            <Text style={ styles.statValue }>              { folders.reduce((sum, folder) => sum + folder.cardCount, 0) }            </Text>            <Text style={ styles.statLabel }>{ t('collection.total_cards') }</Text>          </View>        </View>        <FlatList          data={ folders }          renderItem={ renderFolderItem }          keyExtractor={ (item) => item.id }          showsVerticalScrollIndicator={ false }          ListEmptyComponent={ <View style={styles.emptyState }>            <Icon name="folder-outline" size={ 60 } color={ COLORS.TEXT_SECONDARY } />            <Text style={ styles.emptyStateText }>{ t('collection.no_folders') }</Text>            <TouchableOpacity              style={ styles.emptyStateButton }              onPress={ () => setShowCreateModal(true) }            >              <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.emptyStateButtonGradient }>                <Text style={ styles.emptyStateButtonText }>{ t('collection.create_first_folder') }</Text>              </LinearGradient>            </TouchableOpacity>          </View>          }        />      </View>      { renderCreateModal() }      { renderEditModal() }      { renderDeleteModal() }
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: 8,
    padding: 8,
  },
  backButton: { padding: 8 },
  colorOption: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  colorOptionSelected: {
    borderColor: COLORS.TEXT_WHITE,
    borderWidth: 3,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  confirmButtonDanger: { backgroundColor: COLORS.ERROR },
  confirmButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  confirmButtonTextDanger: { color: COLORS.TEXT_WHITE },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmModal: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    margin: 20,
    padding: 24,
  },
  confirmTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createButton: { padding: 8 },
  defaultBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  deleteIcon: { marginBottom: 16 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  emptyStateText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    marginTop: 16,
  },
  folderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  folderColor: {
    height: 4,
    width: '100%',
  },
  folderContent: { padding: 16 },
  folderDescription: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  folderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  folderItem: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  folderName: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontWeight: 'bold',
  },
  folderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_WHITE,
    opacity: 0.9,
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  modalBody: { padding: 20 },
  modalButton: {
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: COLORS.TEXT_WHITE,
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.INPUT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  statValue: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textInput: {
    ...TEXT_STYLES.BODY_MEDIUM,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default CollectionFolderScreen;
