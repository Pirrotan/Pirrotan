// src/screens/Finance.js - исправленная версия с рабочими функциями и кнопкой редактирования
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import BudgetCard from '../components/BudgetCard';
import PaymentItem from '../components/PaymentItem';
import BudgetDetailModal from '../components/BudgetDetailModal';
import PaymentEditModal from '../components/PaymentEditModal';
import { useFinance } from '../context/FinanceContext';
import * as Notifications from 'expo-notifications';

// Получаем размеры экрана для адаптивного дизайна
const { width, height } = Dimensions.get('window');

// Компонент для управления подписками и регулярными платежами
const PaymentDetailModal = ({ visible, onClose, payment, onDelete, onPay, onEdit }) => {
  if (!payment) return null;
  
  const handleDelete = () => {
    Alert.alert(
      'Удаление платежа',
      `Вы уверены, что хотите удалить платеж "${payment.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            onDelete(payment.id);
            onClose();
          }
        }
      ]
    );
  };
  
  const handlePay = () => {
    Alert.alert(
      'Подтверждение оплаты',
      `Вы уверены, что хотите оплатить ${payment.title} в размере ${payment.amount.toLocaleString()} ₽?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Оплатить', 
          onPress: () => {
            onPay(payment.id);
            onClose();
          } 
        }
      ]
    );
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
            <Text style={styles.modalTitle}>Детали платежа</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentDetailCard}>
            <View style={styles.paymentDetailHeader}>
              <View style={[styles.paymentIconContainer, { backgroundColor: `${payment.color || Colors.primary}20` }]}>
                <Icon name={payment.icon || "cash"} size={28} color={payment.color || Colors.primary} />
              </View>
              <Text style={styles.paymentDetailTitle}>{payment.title}</Text>
            </View>
            
            <View style={styles.paymentDetailInfo}>
              <View style={styles.paymentDetailRow}>
                <Text style={styles.paymentDetailLabel}>Сумма:</Text>
                <Text style={styles.paymentDetailValue}>{payment.amount.toLocaleString()} ₽</Text>
              </View>
              
              <View style={styles.paymentDetailRow}>
                <Text style={styles.paymentDetailLabel}>Срок оплаты:</Text>
                <Text style={styles.paymentDetailValue}>{payment.dueDate}</Text>
              </View>
              
              <View style={styles.paymentDetailRow}>
                <Text style={styles.paymentDetailLabel}>Категория:</Text>
                <Text style={styles.paymentDetailValue}>{payment.category}</Text>
              </View>
              
              {payment.isRecurring && (
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Повторение:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {payment.frequency === 'monthly' ? 'Ежемесячно' : 
                     payment.frequency === 'weekly' ? 'Еженедельно' : 
                     payment.frequency === 'yearly' ? 'Ежегодно' : 'Регулярно'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.paymentDetailActions}>
              <TouchableOpacity 
                style={[styles.paymentActionButton, { backgroundColor: Colors.primary }]}
                onPress={() => {
                  onClose();
                  onEdit(payment);
                }}
                activeOpacity={0.7}
              >
                <Icon name="pencil" size={20} color={Colors.textPrimary} />
                <Text style={styles.paymentActionButtonText}>Изменить</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.paymentActionButton, { backgroundColor: Colors.error }]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Icon name="trash-can-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.paymentActionButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.payButton}
            onPress={handlePay}
            activeOpacity={0.7}
          >
            <Text style={styles.payButtonText}>Оплатить сейчас</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Модальное окно настроек
const SettingsModal = ({ visible, onClose }) => {
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
            <Text style={styles.modalTitle}>Настройки финансов</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="cog-outline" size={24} color={Colors.textPrimary} style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Общие настройки</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="currency-usd" size={24} color={Colors.textPrimary} style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Валюта</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="tag-outline" size={24} color={Colors.textPrimary} style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Управление категориями</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="bell-outline" size={24} color={Colors.textPrimary} style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Настройки уведомлений</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="export" size={24} color={Colors.textPrimary} style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Экспорт данных</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="delete-outline" size={24} color={Colors.error} style={styles.settingsIcon} />
              <Text style={[styles.settingsText, { color: Colors.error }]}>Сбросить финансовые данные</Text>
            </TouchableOpacity>
          </ScrollView>
          
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

// Модальное окно выбора месяца
const MonthPickerModal = ({ visible, onClose, currentMonth, onSelectMonth }) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const years = [selectedYear - 1, selectedYear, selectedYear + 1];
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.monthPickerContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите месяц</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.yearSelector}>
            {years.map(year => (
              <TouchableOpacity 
                key={year}
                style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.7}
              >
                <Text style={[styles.yearButtonText, selectedYear === year && styles.yearButtonTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.monthsGrid}>
            {months.map((month, index) => {
              const isCurrentMonth = currentMonth.includes(month) && currentMonth.includes(selectedYear.toString());
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.monthButton, 
                    isCurrentMonth && styles.monthButtonActive
                  ]}
                  onPress={() => {
                    onSelectMonth(`${month} ${selectedYear}`);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.monthButtonText, isCurrentMonth && styles.monthButtonTextActive]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Модальное окно для добавления транзакции
const AddTransactionModal = ({ visible, onClose, onAddTransaction }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // expense или income
  const [category, setCategory] = useState('');
  
  const categories = {
    expense: ['Жильё', 'Продукты', 'Развлечения', 'Транспорт', 'Коммунальные услуги', 'Другое'],
    income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Возврат', 'Другое']
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название транзакции');
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
    
    const transaction = {
      title,
      amount: parseFloat(amount),
      type,
      category
    };
    
    onAddTransaction(transaction);
    
    // Сбрасываем форму
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('');
    
    onClose();
  };
  
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
              <Text style={styles.modalTitle}>Новая транзакция</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.formLabel}>Тип</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                    onPress={() => setType('expense')}
                    activeOpacity={0.7}
                  >
                    <Icon name="arrow-up" size={18} color={type === 'expense' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Расход</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                    onPress={() => setType('income')}
                    activeOpacity={0.7}
                  >
                    <Icon name="arrow-down" size={18} color={type === 'income' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Доход</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Категория</Text>
                <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
                  {categories[type].map((cat) => (
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
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>Добавить</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Модальное окно для добавления платежа
const AddPaymentModal = ({ visible, onClose, onAddPayment }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly'); // monthly, weekly, yearly
  
  const categories = ['Коммунальные услуги', 'Подписки', 'Кредит', 'Аренда', 'Другое'];
  const dueDates = ['Через 1 день', 'Через 3 дня', 'Через 5 дней', 'Через неделю', 'Через 2 недели'];
  
  const handleSubmit = () => {
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
    
    // Определяем иконку и цвет на основе категории
    let icon = 'cash';
    let color = Colors.primary;
    
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
    
    const payment = {
      title,
      amount: parseFloat(amount),
      category,
      dueDate,
      isRecurring,
      frequency: isRecurring ? frequency : null,
      icon,
      color
    };
    
    onAddPayment(payment);
    
    // Сбрасываем форму
    setTitle('');
    setAmount('');
    setCategory('');
    setDueDate('');
    setIsRecurring(false);
    setFrequency('monthly');
    
    onClose();
  };
  
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
              <Text style={styles.modalTitle}>Новый платеж</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
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
                  <TouchableOpacity 
                    onPress={() => setIsRecurring(!isRecurring)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.switchTrack, isRecurring && styles.switchTrackActive]}>
                      <Animated.View 
                        style={[
                          styles.switchThumb, 
                          isRecurring && styles.switchThumbActive
                        ]} 
                      />
                    </View>
                  </TouchableOpacity>
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
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>Добавить</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Finance = ({ navigation }) => {
  const { 
    financialData, 
    addTransaction, 
    addUpcomingPayment, 
    deleteUpcomingPayment, 
    payUpcomingPayment, 
    updateUpcomingPayment,
    loading, 
    error 
  } = useFinance();
  
  // Состояния для модальных окон
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMonthPickerModal, setShowMonthPickerModal] = useState(false);
  const [showBudgetDetailModal, setShowBudgetDetailModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showPaymentEditModal, setShowPaymentEditModal] = useState(false);
  
  // Выбранные элементы для детального просмотра
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Состояние для текущего месяца
  const [currentMonth, setCurrentMonth] = useState(financialData.month || 'Май 2025');
  
  // Анимация
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Анимация при монтировании
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => {
      // Очистка анимации при размонтировании
      fadeAnim.stopAnimation();
    };
  }, []);
  
  // Функция для планирования уведомления о платеже
  const schedulePaymentNotification = async (payment) => {
    try {
      // Получаем дату срока платежа
      let daysUntilDue = 1;
      if (payment.dueDate.includes('1 день')) {
        daysUntilDue = 1;
      } else if (payment.dueDate.includes('3 дня')) {
        daysUntilDue = 3;
      } else if (payment.dueDate.includes('5 дней')) {
        daysUntilDue = 5;
      } else if (payment.dueDate.includes('неделю')) {
        daysUntilDue = 7;
      } else if (payment.dueDate.includes('2 недели')) {
        daysUntilDue = 14;
      }
      
      // Создаем дату для уведомления (за день до срока)
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + daysUntilDue - 1);
      notificationDate.setHours(9, 0, 0); // Уведомление в 9:00
      
      // Если дата уведомления уже прошла, не планируем уведомление
      if (notificationDate <= new Date()) {
        console.log('Дата уведомления уже прошла');
        return null;
      }
      
      // Планируем уведомление
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Напоминание о платеже: ${payment.title}`,
          body: `Срок оплаты: ${payment.dueDate}. Сумма: ${payment.amount.toLocaleString()} ₽`,
          data: { type: 'payment', paymentId: payment.id },
        },
        trigger: notificationDate,
      });
      
      console.log(`Запланировано уведомление для платежа ${payment.title}:`, notificationId);
      return notificationId;
    } catch (error) {
      console.error('Ошибка при планировании уведомления:', error);
      return null;
    }
  };
  
  // Обработчик добавления транзакции
  const handleAddTransaction = (transaction) => {
    const result = addTransaction(transaction);
    if (result) {
      Alert.alert('Успешно', 'Транзакция добавлена');
    }
  };
  
  // Обработчик добавления платежа
  const handleAddPayment = async (payment) => {
    const result = addUpcomingPayment(payment);
    if (result) {
      // Планируем уведомление для нового платежа
      await schedulePaymentNotification(result);
      Alert.alert('Успешно', 'Платеж добавлен');
    }
  };
  
  // Обработчик оплаты предстоящего платежа
  const handlePayUpcomingPayment = (paymentId) => {
    const success = payUpcomingPayment(paymentId);
    if (success) {
      Alert.alert('Успешно', 'Платеж оплачен');
    } else {
      Alert.alert('Ошибка', 'Не удалось оплатить платеж. Попробуйте снова.');
    }
  };
  
  // Обработчик удаления платежа
  const handleDeletePayment = (paymentId) => {
    deleteUpcomingPayment(paymentId)
      .then(success => {
        if (success) {
          Alert.alert('Успешно', 'Платеж удален');
        } else {
          Alert.alert('Ошибка', 'Не удалось удалить платеж. Попробуйте снова.');
        }
      })
      .catch(error => {
        console.error('Ошибка при удалении платежа:', error);
        Alert.alert('Ошибка', 'Произошла ошибка при удалении платежа');
      });
  };
  
  // Обработчик редактирования платежа
  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentEditModal(true);
  };
  
  // Обработчик обновления платежа
  const handleUpdatePayment = async (updatedPayment) => {
    const success = updateUpcomingPayment(updatedPayment);
    if (success) {
      // Обновляем уведомление для платежа
      await schedulePaymentNotification(updatedPayment);
      Alert.alert('Успешно', 'Платеж обновлен');
    } else {
      Alert.alert('Ошибка', 'Не удалось обновить платеж. Попробуйте снова.');
    }
  };
  
  // Переход к просмотру всех платежей
  const viewAllPayments = () => {
    Alert.alert('Информация', 'Раздел находится в разработке');
  };
  
  // Обработчик нажатия на карточку бюджета
  const handleBudgetPress = (budget) => {
    setSelectedBudgetCategory(budget);
    setShowBudgetDetailModal(true);
  };
  
  // Обработчик нажатия на платеж
  const handlePaymentPress = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetailModal(true);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Логика для повторной загрузки данных
            }}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Финансы</Text>
          {/* Добавлено нажатие на месяц для выбора периода */}
          <TouchableOpacity onPress={() => setShowMonthPickerModal(true)} activeOpacity={0.7}>
            <View style={styles.monthSelector}>
              <Text style={styles.monthText}>{currentMonth}</Text>
              <Icon name="chevron-down" size={16} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowTransactionModal(true)}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.7}
          >
            <Icon name="dots-vertical" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Основное содержимое с прокруткой */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Текущий баланс</Text>
            <Text style={styles.balanceAmount}>{financialData.balance.toLocaleString()} ₽</Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemTitle}>Доходы</Text>
                <Text style={[styles.balanceItemAmount, styles.incomeAmount]}>
                  +{financialData.income.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemTitle}>Расходы</Text>
                <Text style={[styles.balanceItemAmount, styles.expenseAmount]}>
                  -{financialData.expenses.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemTitle}>Экономия</Text>
                <Text style={[styles.balanceItemAmount, styles.savingsAmount]}>
                  {financialData.savings}%
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Бюджет по категориям</Text>
          
          <View style={styles.budgetsList}>
            {financialData.budgets.map(budget => (
              <TouchableOpacity 
                key={budget.id}
                onPress={() => handleBudgetPress(budget)}
                activeOpacity={0.7}
              >
                <BudgetCard
                  title={budget.title}
                  current={budget.current}
                  total={budget.total}
                  percentage={budget.percentage}
                  icon={budget.icon}
                  onPress={() => handleBudgetPress(budget)}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.paymentsHeader}>
            <Text style={styles.sectionTitle}>Предстоящие платежи</Text>
            <TouchableOpacity onPress={viewAllPayments} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>Все платежи</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentsList}>
            {financialData.upcomingPayments.length === 0 ? (
              <View style={styles.emptyPaymentsContainer}>
                <Icon name="cash-check" size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyPaymentsText}>Нет предстоящих платежей</Text>
                <TouchableOpacity 
                  style={styles.addPaymentButton}
                  onPress={() => setShowPaymentModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addPaymentButtonText}>Добавить платеж</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {financialData.upcomingPayments.map(payment => (
                  <TouchableOpacity 
                    key={payment.id}
                    onPress={() => handlePaymentPress(payment)}
                    activeOpacity={0.7}
                  >
                    <PaymentItem
                      title={payment.title}
                      amount={payment.amount}
                      dueDate={payment.dueDate}
                      category={payment.category}
                      icon={payment.icon}
                      color={payment.color}
                      isRecurring={payment.isRecurring}
                    />
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={styles.addPaymentButtonSmall}
                  onPress={() => setShowPaymentModal(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="plus" size={16} color={Colors.textPrimary} />
                  <Text style={styles.addPaymentButtonSmallText}>Добавить платеж</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Недавние транзакции</Text>
          
          <View style={styles.recentTransactions}>
            {financialData.transactions.slice(0, 5).map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={[
                  styles.transactionIconContainer, 
                  { 
                    backgroundColor: transaction.type === 'income' ? 
                      `${Colors.income}20` : `${Colors.expense}20` 
                  }
                ]}>
                  <Icon 
                    name={transaction.type === 'income' ? "arrow-down" : "arrow-up"} 
                    size={18} 
                    color={transaction.type === 'income' ? Colors.income : Colors.expense} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <Text 
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ₽
                </Text>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.viewAllTransactionsButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllTransactionsText}>Показать все транзакции</Text>
              <Icon name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Добавляем дополнительный отступ снизу для скроллинга */}
          <View style={styles.footerSpacer} />
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Icon name="home" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Главная</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Tasks')}
          activeOpacity={0.7}
        >
          <Icon name="checkbox-marked-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Задачи</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          activeOpacity={0.7}
        >
          <Icon name="wallet-outline" size={24} color={Colors.primary} />
          <Text style={[styles.footerTabText, { color: Colors.primary }]}>Финансы</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate('Calm')}
          activeOpacity={0.7}
        >
          <Icon name="heart-pulse" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerTabText}>Спокойствие</Text>
        </TouchableOpacity>
      </View>
      
      {/* Модальные окна */}
      <AddTransactionModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onAddTransaction={handleAddTransaction}
      />
      
      <AddPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onAddPayment={handleAddPayment}
      />
      
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      
      <MonthPickerModal
        visible={showMonthPickerModal}
        onClose={() => setShowMonthPickerModal(false)}
        currentMonth={currentMonth}
        onSelectMonth={setCurrentMonth}
      />
      
      {/* Модальное окно детализации бюджета */}
      {selectedBudgetCategory && (
        <BudgetDetailModal
          visible={showBudgetDetailModal}
          onClose={() => {
            setShowBudgetDetailModal(false);
            setSelectedBudgetCategory(null);
          }}
          category={selectedBudgetCategory}
          transactions={financialData.transactions}
        />
      )}
      
      {/* Модальное окно детализации платежа */}
      {selectedPayment && (
        <PaymentDetailModal
          visible={showPaymentDetailModal}
          onClose={() => {
            setShowPaymentDetailModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onDelete={handleDeletePayment}
          onPay={handlePayUpcomingPayment}
          onEdit={handleEditPayment}
        />
      )}
      
      {/* Модальное окно редактирования платежа */}
      {selectedPayment && (
        <PaymentEditModal
          visible={showPaymentEditModal}
          onClose={() => setShowPaymentEditModal(false)}
          payment={selectedPayment}
          onUpdate={handleUpdatePayment}
        />
      )}
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
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Увеличенный отступ снизу для прокрутки под футером
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    width: '100%',
  },
  balanceTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  incomeAmount: {
    color: Colors.success,
  },
  expenseAmount: {
    color: Colors.expense,
  },
  savingsAmount: {
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  budgetsList: {
    marginBottom: 10,
    width: '100%',
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  paymentsList: {
    marginBottom: 20,
    width: '100%',
  },
  emptyPaymentsContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 6,
  },
  emptyPaymentsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  addPaymentButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addPaymentButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addPaymentButtonSmall: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPaymentButtonSmallText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  recentTransactions: {
    marginBottom: 20,
    width: '100%',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: Colors.income,
  },
  expenseText: {
    color: Colors.expense,
  },
  viewAllTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginVertical: 8,
  },
  viewAllTransactionsText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  footerSpacer: {
    height: 80, // Дополнительное пространство снизу для прокрутки под футером
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerTabText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // Стили для модальных окон
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end', // Модальное окно снизу
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  monthPickerContent: {
    maxHeight: 'auto',
    paddingBottom: 20,
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
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: Colors.textPrimary,
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
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  
  // Стили для переключателя
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackActive: {
    backgroundColor: Colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textPrimary,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
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
  
  // Стили для выбора месяца
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  yearButtonActive: {
    backgroundColor: Colors.primary,
  },
  yearButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  yearButtonTextActive: {
    fontWeight: 'bold',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  monthButtonActive: {
    backgroundColor: Colors.primary,
  },
  monthButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  monthButtonTextActive: {
    fontWeight: 'bold',
  },
  
  // Стили для настроек
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  // Стили для деталей платежа
  paymentDetailCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  paymentDetailInfo: {
    marginBottom: 16,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentDetailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  paymentDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  paymentActionButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default Finance;