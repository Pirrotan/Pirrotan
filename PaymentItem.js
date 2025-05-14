// src/components/PaymentItem.js - расширенная версия с обработкой нажатий
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const PaymentItem = ({ 
  title, 
  amount, 
  dueDate, 
  category, 
  icon, 
  color,
  onPress,
  isRecurring = false
}) => {
  const getIconName = () => {
    switch (category?.toLowerCase()) {
      case 'коммунальные услуги':
        return icon || 'flash';
      case 'подписки':
        return icon || 'television-play';
      case 'кредит':
        return icon || 'bank';
      case 'аренда':
        return icon || 'home';
      default:
        return icon || 'cash';
    }
  };

  const getIconColor = () => {
    if (color) return color;
    
    switch (category?.toLowerCase()) {
      case 'коммунальные услуги':
        return Colors.utilities || Colors.warning;
      case 'подписки':
        return Colors.entertainment;
      case 'кредит':
        return Colors.error;
      case 'аренда':
        return Colors.housing;
      default:
        return Colors.primary;
    }
  };

  // Определяем цвет текста в зависимости от срочности
  const getDateTextColor = () => {
    if (dueDate?.includes('1 день')) {
      return Colors.error;
    } else if (dueDate?.includes('3 дня')) {
      return Colors.warning;
    }
    return Colors.textSecondary;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
        <Icon name={getIconName()} size={22} color={getIconColor()} />
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaContainer}>
          <Text style={[styles.dueDate, { color: getDateTextColor() }]}>
            {dueDate}
          </Text>
          {isRecurring && (
            <View style={styles.recurringBadge}>
              <Icon name="sync" size={12} color={Colors.textPrimary} />
              <Text style={styles.recurringText}>Повторяющийся</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>{amount.toLocaleString()} ₽</Text>
        <Icon name="chevron-right" size={16} color={Colors.textSecondary} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recurringText: {
    fontSize: 10,
    color: Colors.primary,
    marginLeft: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  chevron: {
    opacity: 0.7,
  }
});

export default PaymentItem;