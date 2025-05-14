// src/components/RecurrenceSettings.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Switch,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const RecurrenceSettings = ({ 
  visible, 
  onClose, 
  isRecurring = false, 
  pattern = 'weekly', 
  onSave 
}) => {
  const [localIsRecurring, setLocalIsRecurring] = useState(isRecurring);
  const [localPattern, setLocalPattern] = useState(pattern);
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Понедельник, среда, пятница по умолчанию
  const [monthlyOption, setMonthlyOption] = useState('day'); // 'day' - число, 'weekday' - день недели (напр. "первый понедельник")
  
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  // Обработчик переключения выбранных дней недели
  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(day => day !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };
  
  // Обработчик сохранения настроек
  const handleSave = () => {
    // Собираем детали повторения для сохранения
    const recurrenceDetails = {
      isRecurring: localIsRecurring,
      pattern: localPattern,
      details: {},
    };
    
    // Добавляем детали в зависимости от шаблона повторения
    if (localPattern === 'weekly' && selectedDays.length > 0) {
      recurrenceDetails.details.days = selectedDays;
    } else if (localPattern === 'monthly') {
      recurrenceDetails.details.monthlyOption = monthlyOption;
    }
    
    onSave(recurrenceDetails);
    onClose();
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
            <Text style={styles.modalTitle}>Настройки повторения</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.settingTitle}>Повторяющаяся задача</Text>
              <Switch
                value={localIsRecurring}
                onValueChange={setLocalIsRecurring}
                trackColor={{ false: '#767577', true: Colors.primary }}
                thumbColor={Colors.textPrimary}
              />
            </View>
            
            {localIsRecurring && (
              <>
                <Text style={styles.sectionTitle}>Частота повторения</Text>
                <View style={styles.patternOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.patternButton, 
                      localPattern === 'daily' && styles.patternButtonActive
                    ]}
                    onPress={() => setLocalPattern('daily')}
                    activeOpacity={0.7}
                  >
                    <Icon name="calendar-today" size={20} color={localPattern === 'daily' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[
                      styles.patternButtonText,
                      localPattern === 'daily' && styles.patternButtonTextActive
                    ]}>
                      Ежедневно
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.patternButton, 
                      localPattern === 'weekly' && styles.patternButtonActive
                    ]}
                    onPress={() => setLocalPattern('weekly')}
                    activeOpacity={0.7}
                  >
                    <Icon name="calendar-week" size={20} color={localPattern === 'weekly' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[
                      styles.patternButtonText,
                      localPattern === 'weekly' && styles.patternButtonTextActive
                    ]}>
                      Еженедельно
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.patternButton, 
                      localPattern === 'monthly' && styles.patternButtonActive
                    ]}
                    onPress={() => setLocalPattern('monthly')}
                    activeOpacity={0.7}
                  >
                    <Icon name="calendar-month" size={20} color={localPattern === 'monthly' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[
                      styles.patternButtonText,
                      localPattern === 'monthly' && styles.patternButtonTextActive
                    ]}>
                      Ежемесячно
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.patternButton, 
                      localPattern === 'yearly' && styles.patternButtonActive
                    ]}
                    onPress={() => setLocalPattern('yearly')}
                    activeOpacity={0.7}
                  >
                    <Icon name="calendar" size={20} color={localPattern === 'yearly' ? Colors.textPrimary : Colors.textSecondary} />
                    <Text style={[
                      styles.patternButtonText,
                      localPattern === 'yearly' && styles.patternButtonTextActive
                    ]}>
                      Ежегодно
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Дополнительные опции для еженедельного повторения */}
                {localPattern === 'weekly' && (
                  <View style={styles.weekdaysContainer}>
                    <Text style={styles.settingTitle}>Дни недели</Text>
                    <View style={styles.weekdaysSelection}>
                      {weekdays.map((day, index) => (
                        <TouchableOpacity 
                          key={index}
                          style={[
                            styles.dayButton,
                            selectedDays.includes(index) && styles.dayButtonSelected
                          ]}
                          onPress={() => toggleDay(index)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.dayButtonText,
                            selectedDays.includes(index) && styles.dayButtonTextSelected
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Дополнительные опции для ежемесячного повторения */}
                {localPattern === 'monthly' && (
                  <View style={styles.monthlyContainer}>
                    <Text style={styles.settingTitle}>Опции повторения</Text>
                    <View style={styles.monthlyOptions}>
                      <TouchableOpacity 
                        style={[
                          styles.monthlyOption,
                          monthlyOption === 'day' && styles.monthlyOptionSelected
                        ]}
                        onPress={() => setMonthlyOption('day')}
                        activeOpacity={0.7}
                      >
                        <Icon 
                          name={monthlyOption === 'day' ? 'radiobox-marked' : 'radiobox-blank'} 
                          size={20} 
                          color={monthlyOption === 'day' ? Colors.primary : Colors.textSecondary} 
                          style={styles.radioIcon}
                        />
                        <Text style={styles.monthlyOptionText}>
                          В тот же день месяца
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.monthlyOption,
                          monthlyOption === 'weekday' && styles.monthlyOptionSelected
                        ]}
                        onPress={() => setMonthlyOption('weekday')}
                        activeOpacity={0.7}
                      >
                        <Icon 
                          name={monthlyOption === 'weekday' ? 'radiobox-marked' : 'radiobox-blank'} 
                          size={20} 
                          color={monthlyOption === 'weekday' ? Colors.primary : Colors.textSecondary} 
                          style={styles.radioIcon}
                        />
                        <Text style={styles.monthlyOptionText}>
                          В тот же день недели
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {/* Информационное сообщение */}
                <View style={styles.infoSection}>
                  <Icon name="information-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>
                    При завершении повторяющейся задачи автоматически создается новая с учетом выбранного шаблона повторения.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  patternOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  patternButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  patternButtonActive: {
    backgroundColor: Colors.primary,
  },
  patternButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  patternButtonTextActive: {
    fontWeight: 'bold',
  },
  weekdaysContainer: {
    marginBottom: 20,
  },
  weekdaysSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayButtonTextSelected: {
    fontWeight: 'bold',
  },
  monthlyContainer: {
    marginBottom: 20,
  },
  monthlyOptions: {
    marginTop: 12,
  },
  monthlyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  monthlyOptionSelected: {
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  radioIcon: {
    marginRight: 12,
  },
  monthlyOptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default RecurrenceSettings;