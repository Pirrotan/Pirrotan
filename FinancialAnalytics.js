// src/screens/FinancialAnalytics.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';
import FinancialAnalytics from '../components/FinancialAnalytics';
import BudgetAlerts from '../components/BudgetAlerts';
import BudgetDetailModal from '../components/BudgetDetailModal';
import { useFinance } from '../context/FinanceContext';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

const FinancialAnalyticsScreen = ({ navigation }) => {
  const { financialData, loading, error } = useFinance();
  const [period, setPeriod] = useState('monthly'); // monthly, quarterly, yearly
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState(null);
  const [showBudgetDetailModal, setShowBudgetDetailModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Имитация обновления данных
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Имитация задержки для визуального отображения процесса обновления
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  // Обработчик нажатия на категорию бюджета
  const handleBudgetPress = (budget) => {
    setSelectedBudgetCategory(budget);
    setShowBudgetDetailModal(true);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Загрузка финансовой аналитики...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
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
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Финансовая аналитика</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Селектор периода */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'monthly' && styles.activePeriodButton]}
            onPress={() => setPeriod('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodButtonText, period === 'monthly' && styles.activePeriodButtonText]}>
              Месяц
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, period === 'quarterly' && styles.activePeriodButton]}
            onPress={() => setPeriod('quarterly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodButtonText, period === 'quarterly' && styles.activePeriodButtonText]}>
              Квартал
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, period === 'yearly' && styles.activePeriodButton]}
            onPress={() => setPeriod('yearly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodButtonText, period === 'yearly' && styles.activePeriodButtonText]}>
              Год
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Показываем предупреждения о бюджете */}
        <BudgetAlerts 
          budgets={financialData.budgets} 
          onViewBudget={handleBudgetPress}
        />
        
        {/* Подключаем компонент финансовой аналитики */}
        <FinancialAnalytics 
          financialData={financialData}
          period={period}
        />
        
        {/* Дополнительные подсказки для пользователя */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Советы по финансам</Text>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: `${Colors.success}20` }]}>
              <Icon name="lightbulb-on" size={20} color={Colors.success} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>
                Откладывайте минимум 10% от ежемесячного дохода для создания подушки безопасности
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: `${Colors.warning}20` }]}>
              <Icon name="cash-lock" size={20} color={Colors.warning} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>
                Распределите бюджет по категориям и старайтесь не превышать установленные лимиты
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: `${Colors.error}20` }]}>
              <Icon name="credit-card-off" size={20} color={Colors.error} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>
                Избегайте импульсивных покупок. Используйте правило "24 часов" перед крупной покупкой
              </Text>
            </View>
          </View>
        </View>
        
        {/* Добавляем пространство внизу для прокрутки */}
        <View style={styles.footerSpacer} />
      </ScrollView>
      
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
          onPress={() => navigation.navigate('Finance')}
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Обеспечивает пространство для скролла под футером
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activePeriodButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  footerSpacer: {
    height: 60,
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
});

export default FinancialAnalyticsScreen;