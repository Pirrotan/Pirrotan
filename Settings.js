// src/screens/Settings.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Modal,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import { useUser } from '../context/UserContext';

// Массив аватаров для выбора (просто цвета в этой версии)
const avatarColors = [
  '#6750A4', '#5468FF', '#F44336', '#4CAF50', 
  '#2196F3', '#9C27B0', '#FF9800', '#607D8B'
];

// Компонент выбора аватара
const AvatarSelector = ({ visible, onClose, onSelectAvatar, currentAvatar }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите аватар</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarsContainer}>
            {avatarColors.map((color, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.avatarOption,
                  { backgroundColor: color },
                  currentAvatar === color && styles.selectedAvatarOption
                ]}
                onPress={() => {
                  onSelectAvatar(color);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Icon 
                  name="account" 
                  size={28} 
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { userData, updateUserName, updateNotificationSettings, updateTheme, resetUserSettings } = useUser();
  const [name, setName] = useState(userData.name || 'Александр');
  const [isEditingName, setIsEditingName] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userData.notificationsEnabled);
  const [darkModeEnabled, setDarkModeEnabled] = useState(userData.theme === 'dark');
  const [loading, setLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userData.avatar || avatarColors[0]);
  
  // Анимация
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Анимация появления
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Синхронизируем локальные состояния с userData при изменении
  useEffect(() => {
    setName(userData.name);
    setNotificationsEnabled(userData.notificationsEnabled);
    setDarkModeEnabled(userData.theme === 'dark');
    setSelectedAvatar(userData.avatar || avatarColors[0]);
  }, [userData]);
  
  // Обработчик сохранения имени
  const handleSaveName = async () => {
    if (name.trim()) {
      setLoading(true);
      const success = await updateUserName(name);
      setLoading(false);
      
      if (success) {
        setIsEditingName(false);
        Alert.alert('Успешно', 'Имя сохранено');
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить имя');
      }
    } else {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
    }
  };
  
  // Обработчик изменения уведомлений
  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    const success = await updateNotificationSettings(value);
    
    if (!success) {
      // Если не удалось сохранить, возвращаем предыдущее значение
      setNotificationsEnabled(!value);
      Alert.alert('Ошибка', 'Не удалось обновить настройки уведомлений');
    }
  };
  
  // Обработчик изменения темной темы
  const handleToggleDarkMode = async (value) => {
    setDarkModeEnabled(value);
    const success = await updateTheme(value ? 'dark' : 'light');
    
    if (!success) {
      // Если не удалось сохранить, возвращаем предыдущее значение
      setDarkModeEnabled(!value);
      Alert.alert('Ошибка', 'Не удалось обновить тему оформления');
    }
  };
  
  // Обработчик выбора аватара
  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    // Здесь будет код для сохранения аватара в UserContext
    // updateAvatar(avatar);
  };
  
  // Сброс настроек
  const handleResetSettings = () => {
    Alert.alert(
      'Сбросить настройки',
      'Вы уверены, что хотите сбросить все настройки до значений по умолчанию?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сбросить',
          onPress: async () => {
            setLoading(true);
            const success = await resetUserSettings();
            setLoading(false);
            
            if (success) {
              Alert.alert('Успешно', 'Настройки сброшены до значений по умолчанию');
            } else {
              Alert.alert('Ошибка', 'Не удалось сбросить настройки');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Загрузка настроек...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Профиль</Text>
          
          <View style={styles.profileCard}>
            <TouchableOpacity 
              style={[styles.avatarPlaceholder, { backgroundColor: selectedAvatar }]}
              onPress={() => setShowAvatarSelector(true)}
              activeOpacity={0.7}
            >
              <Icon name="account" size={40} color={Colors.textPrimary} />
              <View style={styles.editAvatarIcon}>
                <Icon name="pencil" size={14} color={Colors.textPrimary} />
              </View>
            </TouchableOpacity>
            
            {isEditingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholder="Введите имя"
                  placeholderTextColor={Colors.textSecondary}
                />
                <View style={styles.nameEditButtons}>
                  <TouchableOpacity 
                    style={[styles.nameEditButton, styles.cancelButton]}
                    onPress={() => {
                      setIsEditingName(false);
                      setName(userData.name); // Возвращаем исходное имя
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.nameEditButton, styles.saveNameButton]}
                    onPress={handleSaveName}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveNameButtonText}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{userData.name}</Text>
                <TouchableOpacity 
                  onPress={() => setIsEditingName(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="pencil" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Приложение</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Icon name="bell-outline" size={24} color={Colors.textPrimary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Уведомления</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#767577', true: Colors.primary }}
              thumbColor={Colors.textPrimary}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Icon name="theme-light-dark" size={24} color={Colors.textPrimary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Темная тема</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#767577', true: Colors.primary }}
              thumbColor={Colors.textPrimary}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          
          <TouchableOpacity 
            style={styles.aboutItem}
            activeOpacity={0.7}
            onPress={() => setShowAboutModal(true)}
          >
            <View style={styles.settingTextContainer}>
              <Icon name="information-outline" size={24} color={Colors.textPrimary} style={styles.settingIcon} />
              <Text style={styles.settingText}>О приложении MindEase</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.aboutItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Политика конфиденциальности', 'Мы заботимся о вашей приватности и не собираем никаких персональных данных. Все данные хранятся только на вашем устройстве.')}
          >
            <View style={styles.settingTextContainer}>
              <Icon name="shield-check" size={24} color={Colors.textPrimary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Политика конфиденциальности</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.aboutItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Версия приложения', 'MindEase версия 1.0.0')}
          >
            <View style={styles.settingTextContainer}>
              <Icon name="cellphone" size={24} color={Colors.textPrimary} style={styles.settingIcon} />
              <Text style={styles.settingText}>Версия 1.0.0</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дополнительно</Text>
          
          <TouchableOpacity 
            style={[styles.aboutItem, styles.dangerItem]}
            activeOpacity={0.7}
            onPress={handleResetSettings}
          >
            <View style={styles.settingTextContainer}>
              <Icon name="refresh" size={24} color={Colors.error} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: Colors.error }]}>Сбросить все настройки</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
      
      {/* Модальное окно о приложении */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>О приложении</Text>
              <TouchableOpacity 
                onPress={() => setShowAboutModal(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.appInfoContainer}>
              <View style={styles.appIconContainer}>
                <Icon name="shield-check" size={64} color={Colors.textPrimary} />
              </View>
              <Text style={styles.appName}>MindEase</Text>
              <Text style={styles.appVersion}>Версия 1.0.0</Text>
            </View>
            
            <Text style={styles.aboutText}>
              MindEase - это приложение для управления задачами и снижения тревожности, которое поможет вам организовать свою жизнь и достичь спокойствия.
            </Text>
            
            <Text style={styles.aboutText}>
              Основные функции:
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="checkbox-marked-outline" size={20} color={Colors.normal} />
                <Text style={styles.featureText}>Управление задачами с приоритетами</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="heart-pulse" size={20} color={Colors.critical} />
                <Text style={styles.featureText}>Отслеживание уровня тревожности</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="meditation" size={20} color={Colors.calm} />
                <Text style={styles.featureText}>Дыхательные упражнения</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="wallet-outline" size={20} color={Colors.important} />
                <Text style={styles.featureText}>Управление финансами</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="heart" size={20} color={Colors.primary} />
                <Text style={styles.featureText}>Дневник благодарности</Text>
              </View>
            </View>
            
            <Text style={styles.copyrightText}>© 2023 MindEase</Text>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAboutModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Модальное окно выбора аватара */}
      <AvatarSelector 
        visible={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        onSelectAvatar={handleSelectAvatar}
        currentAvatar={selectedAvatar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  nameEditContainer: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  nameEditButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameEditButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  saveNameButton: {
    backgroundColor: Colors.primary,
  },
  saveNameButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  settingItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  aboutItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  
  // Стили для модального окна О приложении
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  
  // Стили для выбора аватара
  avatarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  selectedAvatarOption: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default SettingsScreen;