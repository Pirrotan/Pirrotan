// src/components/BudgetAlerts.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const BudgetAlert = ({ budget, onPress, onDismiss }) => {
  // Анимация для привлечения внимания к важным оповещениям
  const [bounceAnim] = useState(new Animated.Value(1));
  const isHighAlert = budget.percentage >= 90;
  
  useEffect(() => {
    // Анимация пульсации для критических оповещений
    if (isHighAlert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
    
    return () => {
      bounceAnim.stopAnimation();
    };
  }, [isHighAlert]);
  
  // Определяем иконку в зависимости от серьезности превышения бюджета
  const getAlertIcon = () => {
    if (budget.percentage >= 100) {
      return 'alert-octagon';
    } else if (budget.percentage >= 90) {
      return 'alert-circle';
    } else {
      return 'alert';
    }
  };
  
  // Определяем цвет в зависимости от серьезности превышения бюджета
  const getAlertColor = () => {
    if (budget.percentage >= 100) {
      return Colors.error;
    } else if (budget.percentage >= 80) {
      return Colors.warning;
    } else {
      return Colors.info;
    }
  };
  
  // Получаем текст оповещения
  const getAlertText = () => {
    if (budget.percentage >= 100) {
      return `Превышен бюджет на ${budget.title}`;
    } else if (budget.percentage >= 90) {
      return `Критически близко к лимиту бюджета на ${budget.title}`;
    } else if (budget.percentage >= 80) {
      return `Приближается к лимиту бюджета на ${budget.title}`;
    } else {
      return `Обратите внимание на расходы по ${budget.title}`;
    }
  };
  
  // Получаем текст подсказки
  const getHintText = () => {
    if (budget.percentage >= 100) {
      return `Превышение на ${(budget.current - budget.total).toLocaleString()} ₽`;
    } else {
      return `Осталось ${(budget.total - budget.current).toLocaleString()} ₽`;
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.alertContainer,
        { borderLeftColor: getAlertColor() },
        isHighAlert && { transform: [{ scale: bounceAnim }] }
      ]}
    >
      <View style={styles.alertContent}>
        <View style={[styles.alertIconContainer, { backgroundColor: getAlertColor() }]}>
          <Icon name={getAlertIcon()} size={20} color={Colors.textPrimary} />
        </View>
        
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertText}>{getAlertText()}</Text>
          <Text style={styles.alertSubtext}>{getHintText()}</Text>
        </View>
        
        <View style={styles.alertActions}>
          <TouchableOpacity 
            style={styles.alertActionButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Icon name="eye" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.alertActionButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.alertProgressContainer}>
        <View 
          style={[
            styles.alertProgressBar, 
            { 
              width: `${Math.min(budget.percentage, 100)}%`,
              backgroundColor: getAlertColor()
            }
          ]} 
        />
      </View>
    </Animated.View>
  );
};

const BudgetAlerts = ({ budgets, onViewBudget }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  
  // Эффект для фильтрации алертов и удаления скрытых
  useEffect(() => {
    if (!budgets || !Array.isArray(budgets)) return;
    
    // Фильтруем бюджеты, у которых превышение более 70%
    const alertsToShow = budgets
      .filter(budget => budget.percentage >= 70 && !dismissedAlerts.includes(budget.id))
      .sort((a, b) => b.percentage - a.percentage);
    
    setVisibleAlerts(alertsToShow);
  }, [budgets, dismissedAlerts]);
  
  // Обработчик нажатия на кнопку просмотра бюджета
  const handleViewBudget = (budget) => {
    if (onViewBudget) {
      onViewBudget(budget);
    }
  };
  
  // Обработчик скрытия оповещения
  const handleDismissAlert = (budgetId) => {
    setDismissedAlerts(prev => [...prev, budgetId]);
  };
  
  // Очистка всех скрытых оповещений
  const handleResetDismissed = () => {
    setDismissedAlerts([]);
    setShowAllAlertsModal(false);
  };
  
  // Если нет бюджетов с превышением, не показываем компонент
  if (!visibleAlerts || visibleAlerts.length === 0) {
    return null;
  }
  
  // Количество оповещений для отображения в основном списке
  const alertsToShowCount = Math.min(visibleAlerts.length, 2);
  const hasMoreAlerts = visibleAlerts.length > alertsToShowCount;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          Предупреждения о бюджете
        </Text>
        
        {hasMoreAlerts && (
          <TouchableOpacity 
            onPress={() => setShowAllAlertsModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              Все ({visibleAlerts.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Показываем только первые 2 оповещения */}
      {visibleAlerts.slice(0, alertsToShowCount).map(budget => (
        <BudgetAlert
          key={budget.id}
          budget={budget}
          onPress={() => handleViewBudget(budget)}
          onDismiss={() => handleDismissAlert(budget.id)}
        />
      ))}
      
      {/* Модальное окно для просмотра всех оповещений */}
      <Modal
        visible={showAllAlertsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllAlertsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Все предупреждения о бюджете</Text>
              <TouchableOpacity 
                onPress={() => setShowAllAlertsModal(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {visibleAlerts.map(budget => (
                <BudgetAlert
                  key={budget.id}
                  budget={budget}
                  onPress={() => {
                    handleViewBudget(budget);
                    setShowAllAlertsModal(false);
                  }}
                  onDismiss={() => handleDismissAlert(budget.id)}
                />
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetDismissed}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>Сбросить скрытые оповещения</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAllAlertsModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Закрыть</Text>
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
    marginBottom: 16,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  alertContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertContent: {
    flexDirection: 'row',
    padding: 12,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  alertProgressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  alertProgressBar: {
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: Colors.warning,
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

export default BudgetAlerts;