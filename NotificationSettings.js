// src/components/NotificationSettings.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import { useTask } from '../context/TaskContext';

const NotificationSettings = ({ visible, onClose }) => {
  const { 
    notificationsEnabled, 
    calendarIntegrationEnabled, 
    setNotifications, 
    setCalendarIntegration 
  } = useTask();
  
  // Локальные состояния для отслеживания изменений
  const [notificationsOn, setNotificationsOn] = useState(notificationsEnabled);
  const [calendarOn, setCalendarOn] = useState(calendarIntegrationEnabled);
  const [loading, setLoading] = useState(false);
  
  // Синхронизация с контекстными данными
  useEffect(() => {
    setNotificationsOn(notificationsEnabled);
    setCalendarOn(calendarIntegrationEnabled);
  }, [notificationsEnabled, calendarIntegrationEnabled]);
  
  // Обработчик переключения уведомлений
  const handleToggleNotifications = async (value) => {
    setLoading(true);
    try {
      const success = await setNotifications(value);
      if (success) {
        setNotificationsOn(value);
      } else {
        // Если операция не удалась, возвращаем переключатель в исходное положение
        setNotificationsOn(!value);
        Alert.alert(
          "Ошибка настройки уведомлений", 
          "Не удалось изменить настройки уведомлений. Пожалуйста, проверьте разрешения."
        );
      }
    } catch (error) {
      console.error('Ошибка при изменении настроек уведомлений:', error);
      setNotificationsOn(!value);
      Alert.alert("Ошибка", "Произошла ошибка при настройке уведомлений");
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик переключения интеграции с календарем
  const handleToggleCalendar = async (value) => {
    setLoading(true);
    try {
      const success = await setCalendarIntegration(value);
      if (success) {
        setCalendarOn(value);
      } else {
        // Если операция не удалась, возвращаем переключатель в исходное положение
        setCalendarOn(!value);
        Alert.alert(
          "Ошибка интеграции с календарем", 
          "Не удалось изменить настройки интеграции с календарем. Пожалуйста, проверьте разрешения."
        );
      }
    } catch (error) {
      console.error('Ошибка при изменении настроек интеграции с календарем:', error);
      setCalendarOn(!value);
      Alert.alert("Ошибка", "Произошла ошибка при настройке интеграции с календарем");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Настройки уведомлений</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Применение настроек...</Text>
            </View>
          ) : (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="bell-outline" size={24} color={Colors.primary} style={styles.settingIcon} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Push-уведомления</Text>
                    <Text style={styles.settingDescription}>
                      Получайте уведомления о предстоящих задачах
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsOn}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={Colors.textPrimary}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="calendar" size={24} color={Colors.important} style={styles.settingIcon} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Интеграция с календарем</Text>
                    <Text style={styles.settingDescription}>
                      Добавляйте задачи в календарь устройства
                    </Text>
                  </View>
                </View>
                <Switch
                  value={calendarOn}
                  onValueChange={handleToggleCalendar}
                  trackColor={{ false: '#767577', true: Colors.important }}
                  thumbColor={Colors.textPrimary}
                />
              </View>
              
              <View style={styles.infoSection}>
                <Icon name="information-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  Push-уведомления позволят вам не пропустить важные задачи. Интеграция с календарем добавит ваши задачи в календарь устройства.
                </Text>
              </View>
            </>
          )}
          
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default NotificationSettings;