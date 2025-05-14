// src/components/BudgetDetailModal.js - полная реализация модального окна для просмотра деталей бюджета
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

// Получаем размеры экрана для адаптивного дизайна
const { width } = Dimensions.get('window');

const TransactionItem = ({ transaction }) => {
  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={styles.transactionAmount}>
        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ₽
      </Text>
    </View>
  );
};

const BudgetDetailModal = ({ 
  visible, 
  onClose, 
  category, 
  transactions = [],
  loading = false
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [period, setPeriod] = useState('all'); // 'all', 'month', 'week'
  
  // Фильтрация транзакций при изменении категории или периода
  useEffect(() => {
    if (!category || !transactions.length) {
      setFilteredTransactions([]);
      return;
    }
    
    // Фильтруем по категории (все транзакции по данной категории)
    let filtered = transactions.filter(
      transaction => transaction.category === category.title && transaction.type === 'expense'
    );
    
    // Дополнительная фильтрация по периоду
    if (period !== 'all') {
      const today = new Date();
      let dateLimit;
      
      if (period === 'month') {
        // Первый день текущего месяца
        dateLimit = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (period === 'week') {
        // Текущая дата минус 7 дней
        dateLimit = new Date();
        dateLimit.setDate(today.getDate() - 7);
      }
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dateLimit;
      });
    }
    
    // Сортируем по дате (сначала новые)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredTransactions(filtered);
  }, [category, transactions, period]);
  
  // Расчет статистики для выбранных транзакций
  const calculateStats = () => {
    if (!filteredTransactions.length) return { total: 0, average: 0, count: 0 };
    
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const average = total / filteredTransactions.length;
    
    return {
      total,
      average: Math.round(average),
      count: filteredTransactions.length
    };
  };
  
  const stats = calculateStats();
  
  if (!category) return null;
  
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
            <Text style={styles.modalTitle}>Детализация: {category.title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Загрузка данных...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.budgetDetailHeader}>
                <View style={styles.budgetProgressContainer}>
                  <View style={styles.budgetProgressBar}>
                    <View 
                      style={[
                        styles.budgetProgress, 
                        { 
                          width: `${Math.min(category.percentage, 100)}%`,
                          backgroundColor: category.percentage > 90 ? Colors.error : 
                                         category.percentage > 70 ? Colors.warning : 
                                         Colors.success
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.budgetPercentageText}>{category.percentage}% использовано</Text>
                </View>
                
                <View style={styles.budgetAmountContainer}>
                  <Text style={styles.budgetAmountText}>
                    {category.current.toLocaleString()} ₽ / {category.total.toLocaleString()} ₽
                  </Text>
                  <Text style={styles.budgetRemainingText}>
                    Осталось: {(category.total - category.current).toLocaleString()} ₽
                  </Text>
                </View>
                
                {/* Статистика по расходам */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.count}</Text>
                    <Text style={styles.statLabel}>Транзакций</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.total.toLocaleString()} ₽</Text>
                    <Text style={styles.statLabel}>Общая сумма</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.average.toLocaleString()} ₽</Text>
                    <Text style={styles.statLabel}>В среднем</Text>
                  </View>
                </View>
              </View>
              
              {/* Фильтры периода */}
              <View style={styles.periodFilters}>
                <TouchableOpacity 
                  style={[styles.periodButton, period === 'all' && styles.periodButtonActive]}
                  onPress={() => setPeriod('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, period === 'all' && styles.periodButtonTextActive]}>
                    Все время
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
                  onPress={() => setPeriod('month')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
                    Этот месяц
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
                  onPress={() => setPeriod('week')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
                    Последние 7 дней
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.transactionsTitle}>Транзакции</Text>
              
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <TransactionItem key={transaction.id || index} transaction={transaction} />
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Icon name="cash-remove" size={48} color={Colors.textSecondary} />
                  <Text style={styles.noTransactionsText}>
                    {period === 'all' 
                      ? 'Нет транзакций для отображения' 
                      : `Нет транзакций за выбранный период`}
                  </Text>
                </View>
              )}
              
              {/* Дополнительное пространство внизу для удобства прокрутки */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '85%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  budgetDetailHeader: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  budgetProgressContainer: {
    marginBottom: 12,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  budgetAmountContainer: {
    marginBottom: 16,
  },
  budgetAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  budgetRemainingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  periodFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  periodButtonTextActive: {
    fontWeight: 'bold',
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.expense,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 200,
  },
  noTransactionsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
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
});

export default BudgetDetailModal;