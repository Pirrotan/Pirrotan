// src/components/PaymentEditModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const PaymentEditModal = ({ visible, onClose, payment, onUpdate }) => {
  // Состояния для редактирования полей платежа
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  
  const categories = ['Коммунальные услуги', 'Подписки', 'Кредит', 'Аренда', 'Другое'];
  const dueDates = ['Через 1 день', 'Через 3 дня', 'Через 5 дней', 'Через неделю', 'Через 2 недели'];
  
  // При открытии модального окна загружаем данные платежа
  useEffect(() => {
    if (payment) {
      setTitle(payment.title || '');
      setAmount(payment.amount ? payment.amount.toString() : '');
      setCategory(payment.category || '');
      setDueDate(payment.dueDate || '');
      setIsRecurring(payment.isRecurring || false);
      setFrequency(payment.frequency || 'monthly');
    }
  }, [payment, visible]);
  
  const handleUpdate = () => {
    // Проверка заполнения обязательных полей
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название платежа');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    
    if (!category) {
      Alert.alert('Ошибка', 'Выберите категорию');
      return;
    }
    
    if (!dueDate) {
      Alert.alert('Ошибка', 'Выберите срок платежа');
      return;
    }
    
    setIsLoading(true);
    
    // Определяем иконку и цвет на основе категории
    let icon = payment.icon || 'cash';
    let color = payment.color || Colors.primary;
    
    switch (category) {
      case 'Коммунальные услуги':
        icon = 'flash';
        color = Colors.warning;
        break;
      case 'Подписки':
        icon = 'television-play';
        color = Colors.error;
        break;
      case 'Кредит':
        icon = 'bank';
        color = Colors.critical;
        break;
      case 'Аренда':
        icon = 'home';
        color = Colors.housing;
        break;
    }
    
    // Создаем обновленный объект платежа
    const updatedPayment = {
      ...payment,
      title,
      amount: parseFloat(amount),
      category,
      dueDate,
      isRecurring,
      frequency: isRecurring ? frequency : null,
      icon,
      color
    };
    
    // Вызываем функцию обновления с таймаутом для визуального эффекта загрузки
    setTimeout(() => {
      onUpdate(updatedPayment);
      setIsLoading(false);
      onClose();
    }, 500);
  };
  
  if (!payment) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактирование платежа</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Сохранение изменений...</Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Название</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Введите название"
                    placeholderTextColor={Colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Сумма (₽)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Категория</Text>
                  <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Срок оплаты</Text>
                  <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
                    {dueDates.map((date) => (
                      <TouchableOpacity
                        key={date}
                        style={[styles.categoryButton, dueDate === date && styles.categoryButtonActive]}
                        onPress={() => setDueDate(date)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.categoryButtonText, dueDate === date && styles.categoryButtonTextActive]}>
                          {date}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.formGroup}>
                  <View style={styles.switchRow}>
                    <Text style={styles.formLabel}>Повторяющийся платеж</Text>
                    <Switch
                      value={isRecurring}
                      onValueChange={setIsRecurring}
                      trackColor={{ false: '#767577', true: Colors.primary }}
                      thumbColor={Colors.textPrimary}
                    />
                  </View>
                  
                  {isRecurring && (
                    <View style={styles.frequencyContainer}>
                      <TouchableOpacity
                        style={[styles.frequencyButton, frequency === 'weekly' && styles.frequencyButtonActive]}
                        onPress={() => setFrequency('weekly')}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.frequencyButtonText, frequency === 'weekly' && styles.frequencyButtonTextActive]}>Еженедельно</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.frequencyButton, frequency === 'monthly' && styles.frequencyButtonActive]}
                        onPress={() => setFrequency('monthly')}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.frequencyButtonText, frequency === 'monthly' && styles.frequencyButtonTextActive]}>Ежемесячно</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.frequencyButton, frequency === 'yearly' && styles.frequencyButtonActive]}
                        onPress={() => setFrequency('yearly')}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.frequencyButtonText, frequency === 'yearly' && styles.frequencyButtonTextActive]}>Ежегодно</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdate}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoryButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoryButtonTextActive: {
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary,
  },
  frequencyButtonText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  frequencyButtonTextActive: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
});

export default PaymentEditModal;