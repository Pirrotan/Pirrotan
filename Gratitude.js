// src/screens/Gratitude.js - исправленная версия с улучшенным скроллингом
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Keyboard,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GratitudeScreen = ({ navigation }) => {
  const [entry, setEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // Анимированные значения
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  // Загрузка сохраненных записей при запуске
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await AsyncStorage.getItem('gratitudeEntries');
        if (data) {
          setSavedEntries(JSON.parse(data));
        } else {
          // Демо-данные при первом запуске
          const demoEntries = [
            { 
              id: '1', 
              date: formatDate(new Date()), 
              text: 'Благодарен за хорошую погоду и приятную прогулку в парке'
            },
            { 
              id: '2', 
              date: formatDate(new Date(new Date().setDate(new Date().getDate() - 2))), 
              text: 'Благодарен родителям за поддержку и понимание'
            }
          ];
          setSavedEntries(demoEntries);
          await AsyncStorage.setItem('gratitudeEntries', JSON.stringify(demoEntries));
        }
      } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить записи благодарности');
      } finally {
        setLoading(false);
        // Запускаем анимацию появления
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    
    loadEntries();
    
    // Очистка анимаций при размонтировании
    return () => {
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);
  
  // Сохранение записей
  const saveEntries = async (entries) => {
    try {
      await AsyncStorage.setItem('gratitudeEntries', JSON.stringify(entries));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения записей:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
      return false;
    }
  };
  
  // Форматирование даты
  const formatDate = (date) => {
    const day = date.getDate();
    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };
  
  // Добавление новой записи
  const handleSave = async () => {
    if (entry.trim()) {
      Keyboard.dismiss();
      setIsSaving(true);
      
      try {
        const now = new Date();
        const formattedDate = formatDate(now);
        
        if (selectedEntryId) {
          // Обновляем существующую запись
          const updatedEntries = savedEntries.map(item => 
            item.id === selectedEntryId ? { ...item, text: entry, date: formattedDate } : item
          );
          
          const success = await saveEntries(updatedEntries);
          if (success) {
            setSavedEntries(updatedEntries);
            setSelectedEntryId(null);
            Alert.alert('Успешно', 'Запись обновлена');
          }
        } else {
          // Создаем новую запись
          const newEntry = {
            id: Date.now().toString(),
            date: formattedDate,
            text: entry
          };
          
          const newEntries = [newEntry, ...savedEntries];
          const success = await saveEntries(newEntries);
          
          if (success) {
            setSavedEntries(newEntries);
            Alert.alert('Успешно', 'Ваша запись сохранена');
          }
        }
        
        setEntry('');
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        Alert.alert('Ошибка', 'Не удалось сохранить запись');
      } finally {
        setIsSaving(false);
      }
    } else {
      Alert.alert('Ошибка', 'Пожалуйста, напишите что-нибудь перед сохранением');
    }
  };
  
  // Редактирование записи
  const handleEdit = (id) => {
    const entryToEdit = savedEntries.find(item => item.id === id);
    if (entryToEdit) {
      setEntry(entryToEdit.text);
      setSelectedEntryId(id);
      // Прокручиваем страницу наверх к полю ввода
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  };
  
  // Удаление записи
  const handleDelete = async (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить эту запись?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              const updatedEntries = savedEntries.filter(item => item.id !== id);
              const success = await saveEntries(updatedEntries);
              
              if (success) {
                setSavedEntries(updatedEntries);
                
                // Если удаляем запись, которую сейчас редактируем, сбрасываем форму
                if (id === selectedEntryId) {
                  setEntry('');
                  setSelectedEntryId(null);
                }
                
                Alert.alert('Успешно', 'Запись удалена');
              }
            } catch (error) {
              console.error('Ошибка удаления:', error);
              Alert.alert('Ошибка', 'Не удалось удалить запись');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Отмена редактирования
  const handleCancel = () => {
    setEntry('');
    setSelectedEntryId(null);
  };
  
  // Ссылка на ScrollView для программной прокрутки
  const scrollViewRef = React.useRef(null);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Загрузка записей...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Дневник благодарности</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <Animated.ScrollView 
          ref={scrollViewRef}
          style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Запись благодарностей помогает снизить тревожность и улучшить настроение. Регулярно отмечайте то, за что вы благодарны сегодня.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {selectedEntryId ? 'Редактирование записи' : 'За что вы благодарны сегодня?'}
            </Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Напишите здесь..."
              placeholderTextColor={Colors.textSecondary}
              value={entry}
              onChangeText={setEntry}
            />
            
            <View style={styles.buttonContainer}>
              {selectedEntryId ? (
                <>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { marginRight: 10 }]}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.7}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={Colors.textPrimary} />
                    ) : (
                      <Text style={styles.saveButtonText}>Обновить</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={Colors.textPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Сохранить</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {savedEntries.length > 0 ? (
            <>
              <Text style={styles.pastEntriesTitle}>Мои благодарности</Text>
              
              {savedEntries.map(item => (
                <View key={item.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{item.date}</Text>
                    <View style={styles.entryActions}>
                      <TouchableOpacity 
                        onPress={() => handleEdit(item.id)}
                        style={styles.entryAction}
                        activeOpacity={0.7}
                      >
                        <Icon name="pencil" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDelete(item.id)}
                        style={styles.entryAction}
                        activeOpacity={0.7}
                      >
                        <Icon name="trash-can-outline" size={20} color={Colors.critical} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.entryText}>{item.text}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="heart-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>У вас пока нет записей благодарности</Text>
              <Text style={styles.emptySubtext}>
                Записывайте свои благодарности каждый день, чтобы улучшить настроение и снизить тревожность
              </Text>
            </View>
          )}
          
          {/* Добавляем пространство внизу для лучшей прокрутки */}
          <View style={styles.footerSpacer} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>
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
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    paddingTop: 20,
    paddingBottom: 40, // Увеличенный отступ снизу для лучшей прокрутки
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    color: Colors.textPrimary,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  pastEntriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  entryActions: {
    flexDirection: 'row',
  },
  entryAction: {
    padding: 6,
    marginLeft: 12,
  },
  entryText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSpacer: {
    height: 50, // Дополнительное пространство внизу для лучшей прокрутки
  },
});

export default GratitudeScreen;