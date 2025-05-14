// src/components/AnxietyMeter.js - оптимизированная версия компонента
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/colors';

// Оптимизированная версия компонента, использующая useMemo для вычислений и useNativeDriver для анимаций
const AnxietyMeter = ({ level }) => {
  // Уровень тревожности от 0 (спокойно) до 10 (тревожно)
  // Используем useMemo для нормализации и вычисления процента, чтобы избежать ненужных перерасчетов
  const { normalizedLevel, percentage } = useMemo(() => {
    const normalized = Math.min(Math.max(level, 0), 10);
    const percent = (normalized / 10) * 100;
    return { normalizedLevel: normalized, percentage: percent };
  }, [level]);
  
  // Используем useMemo для определения уровня и цвета
  const { levelLabel, levelColor } = useMemo(() => {
    let label, color;
    
    if (normalizedLevel <= 3) {
      label = 'Низкий';
      color = Colors.success; // Зеленый - низкая тревожность
    } else if (normalizedLevel <= 6) {
      label = 'Средний';
      color = Colors.warning; // Оранжевый - средняя тревожность
    } else {
      label = 'Высокий';
      color = Colors.error; // Красный - высокая тревожность
    }
    
    return { levelLabel: label, levelColor: color };
  }, [normalizedLevel]);
  
  // Анимированное значение прогресса для плавной анимации при изменении уровня
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  
  // Анимируем изменение уровня тревожности
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false, // true нельзя использовать для width в %
    }).start();
    
    // Очистка анимации при размонтировании
    return () => {
      progressAnim.stopAnimation();
    };
  }, [percentage]);
  
  // Анимированная ширина прогресс-бара
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Уровень тревожности сегодня</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelText}>{levelLabel}</Text>
        </View>
      </View>
      
      <View style={styles.meterContainer}>
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressWidth, backgroundColor: levelColor }
            ]} 
          />
        </View>
        
        <View style={styles.labelsContainer}>
          <Text style={styles.calmLabel}>Спокойно</Text>
          <Text style={styles.anxiousLabel}>Тревожно</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap', // Позволяет переносить контент, если не хватает места
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1, // Используем flex для лучшего распределения пространства
    marginRight: 12, // Добавляем отступ справа для лучшего разделения
  },
  levelBadge: {
    paddingHorizontal: 14, 
    paddingVertical: 5, 
    borderRadius: 6, 
    minWidth: 80, // Фиксированная минимальная ширина для стабильности размеров
  },
  levelText: {
    fontSize: 14, 
    color: Colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center', // Центрирование текста
  },
  meterContainer: {
    marginTop: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  calmLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  anxiousLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default React.memo(AnxietyMeter); // Используем React.memo для предотвращения ненужных перерендеров