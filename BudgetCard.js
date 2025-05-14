// src/components/BudgetCard.js - расширенная версия с обработкой нажатий
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const BudgetCard = ({ 
  icon, 
  title,
  current,
  total,
  color,
  percentage,
  onPress
}) => {
  const getIconName = () => {
    switch (title.toLowerCase()) {
      case 'жильё':
        return 'home';
      case 'продукты':
        return 'food-apple';
      case 'развлечения':
        return 'movie-open';
      case 'транспорт':
        return 'car';
      case 'коммунальные услуги':
        return 'flash';
      default:
        return icon || 'chart-bar';
    }
  };

  const getIconColor = () => {
    switch (title.toLowerCase()) {
      case 'жильё':
        return Colors.housing;
      case 'продукты':
        return Colors.food;
      case 'развлечения':
        return Colors.entertainment;
      case 'транспорт':
        return Colors.info;
      case 'коммунальные услуги':
        return Colors.utilities || Colors.warning;
      default:
        return color || Colors.primary;
    }
  };

  const getProgressColor = () => {
    // Выбираем цвет прогресс-бара в зависимости от процента заполнения
    if (percentage >= 100) {
      return Colors.error;
    } else if (percentage >= 80) {
      return Colors.warning;
    } else {
      return getIconColor();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
            <Icon name={getIconName()} size={22} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${Math.min(percentage, 100)}%`, 
              backgroundColor: getProgressColor() 
            }
          ]} 
        />
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{current.toLocaleString()} ₽ / {total.toLocaleString()} ₽</Text>
        
        <View style={styles.detailsButton}>
          <Icon name="chevron-right" size={16} color={Colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailsButton: {
    padding: 4,
  },
});

export default BudgetCard;