// src/screens/Focus.js - исправленная версия с улучшенной анимацией и таймером
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  Animated,
  Easing,
  Vibration,
  ScrollView,
  Dimensions
} from 'react-native';
import Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Получаем размеры экрана для более адаптивной верстки
const { width, height } = Dimensions.get('window');

const Focus = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [selectedMode, setSelectedMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Анимация для кругового таймера и прогресса
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Анимация появления компонента
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    return () => {
      // Очистка всех анимаций при размонтировании компонента
      fadeAnim.stopAnimation();
      rotationAnim.stopAnimation();
      animatedValue.stopAnimation();
    };
  }, []);
  
  // Получаем общее количество секунд для выбранного режима
  const getTotalSeconds = () => {
    switch (selectedMode) {
      case 'pomodoro':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
      default:
        return 25 * 60;
    }
  };
  
  // Расчет оставшегося времени в секундах
  const getRemainingSeconds = () => {
    return minutes * 60 + seconds;
  };
  
  // Анимация прогресс-бара при каждой секунде
  useEffect(() => {
    if (isRunning) {
      const totalSeconds = getTotalSeconds();
      const remainingSeconds = getRemainingSeconds();
      const progress = 1 - (remainingSeconds / totalSeconds);
      
      // Анимация для плавного обновления прогресса
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 250, // Плавное обновление за 0.25 секунды
        easing: Easing.linear,
        useNativeDriver: true, // Изменено на true для лучшей производительности
      }).start();
    }
  }, [minutes, seconds, isRunning]);
  
  // Сброс анимации при смене режима
  useEffect(() => {
    animatedValue.setValue(0);
    
    // Остановка вращения таймера при смене режима
    rotationAnim.stopAnimation();
    rotationAnim.setValue(0);
  }, [selectedMode]);
  
  // Управление таймером
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsRunning(false);
          
          // Вибрация при завершении
          Vibration.vibrate([500, 300, 500]);
          
          // Обработка завершения таймера
          if (selectedMode === 'pomodoro') {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);
            
            // Каждые 4 помидора предлагаем длинный перерыв
            if (newCount % 4 === 0) {
              Alert.alert(
                "Помидор завершен!",
                "Вы завершили 4 периода фокусировки. Пора сделать длинный перерыв!",
                [
                  {
                    text: "Продолжить работу",
                    onPress: () => resetTimer(),
                  },
                  {
                    text: "Длинный перерыв",
                    onPress: () => selectMode('longBreak'),
                  },
                ]
              );
            } else {
              Alert.alert(
                "Помидор завершен!",
                "Пора сделать короткий перерыв.",
                [
                  {
                    text: "Продолжить работу",
                    onPress: () => resetTimer(),
                  },
                  {
                    text: "Короткий перерыв",
                    onPress: () => selectMode('shortBreak'),
                  },
                ]
              );
            }
          } else {
            Alert.alert(
              "Перерыв завершен!",
              "Пора вернуться к работе!",
              [
                {
                  text: "OK",
                  onPress: () => selectMode('pomodoro'),
                },
              ]
            );
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, minutes, seconds, selectedMode, completedPomodoros]);
  
  // Переключение таймера
  const toggleTimer = () => {
    if (!isRunning) {
      // Запуск вращения полосы прогресса при старте таймера
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 6000, // Полный круг за 6 секунд
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Остановка вращения при паузе
      rotationAnim.stopAnimation();
    }
    
    setIsRunning(!isRunning);
  };
  
  // Сброс таймера
  const resetTimer = () => {
    setIsRunning(false);
    
    // Остановка анимации вращения
    rotationAnim.stopAnimation();
    rotationAnim.setValue(0);
    
    if (selectedMode === 'pomodoro') {
      setMinutes(25);
    } else if (selectedMode === 'shortBreak') {
      setMinutes(5);
    } else if (selectedMode === 'longBreak') {
      setMinutes(15);
    }
    
    setSeconds(0);
    animatedValue.setValue(0); // Сброс прогресса
  };
  
  // Выбор режима
  const selectMode = (mode) => {
    setSelectedMode(mode);
    setIsRunning(false);
    
    // Остановка анимации вращения
    rotationAnim.stopAnimation();
    rotationAnim.setValue(0);
    
    if (mode === 'pomodoro') {
      setMinutes(25);
    } else if (mode === 'shortBreak') {
      setMinutes(5);
    } else if (mode === 'longBreak') {
      setMinutes(15);
    }
    
    setSeconds(0);
    animatedValue.setValue(0); // Сброс прогресса
  };
  
  // Получение цвета в зависимости от режима
  const getModeColor = () => {
    switch (selectedMode) {
      case 'pomodoro':
        return Colors.normal;
      case 'shortBreak':
        return Colors.secondary;
      case 'longBreak':
        return Colors.calm;
      default:
        return Colors.normal;
    }
  };
  
  // Интерполяция вращения для полосы прогресса
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Интерполяция для кругового прогресса (0 - 1)
  const progressInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  // Преобразование процента в размер круга
  const circleCircumference = 2 * Math.PI * 110;
  const strokeDashoffset = progressInterpolation.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, 0],
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Фокусировка</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <View style={styles.modesContainer}>
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                selectedMode === 'pomodoro' && styles.modeButtonActive,
                selectedMode === 'pomodoro' && { backgroundColor: Colors.normal }
              ]}
              onPress={() => selectMode('pomodoro')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'pomodoro' && styles.modeButtonTextActive
              ]}>Фокус</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                selectedMode === 'shortBreak' && styles.modeButtonActive,
                selectedMode === 'shortBreak' && { backgroundColor: Colors.secondary }
              ]}
              onPress={() => selectMode('shortBreak')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'shortBreak' && styles.modeButtonTextActive
              ]}>Короткий перерыв</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                selectedMode === 'longBreak' && styles.modeButtonActive,
                selectedMode === 'longBreak' && { backgroundColor: Colors.calm }
              ]}
              onPress={() => selectMode('longBreak')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'longBreak' && styles.modeButtonTextActive
              ]}>Длинный перерыв</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timerContainer}>
            {/* SVG для кругового прогресса */}
            <View style={styles.timerProgress}>
              <View style={styles.progressTrack} />
              
              {/* Круговая полоса прогресса */}
              <Animated.View
                style={[
                  styles.progressCircleContainer,
                  {
                    transform: [
                      { rotate: progressInterpolation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['-90deg', '270deg']
                        })
                      }
                    ]
                  }
                ]}
              >
                <View style={[styles.progressFill, { backgroundColor: getModeColor() }]} />
              </Animated.View>
              
              {/* Индикатор прогресса с анимацией вращения */}
              <Animated.View
                style={[
                  styles.progressIndicator,
                  {
                    backgroundColor: getModeColor(),
                    transform: [{ rotate: rotation }]
                  }
                ]}
              />
              
              {/* Внутренний круг с таймером */}
              <View style={styles.timerInnerCircle}>
                <Text style={styles.timerText}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                <Text style={styles.pomodoroCounter}>
                  {completedPomodoros} {
                    completedPomodoros === 1 ? 'помидор' : 
                    completedPomodoros >= 2 && completedPomodoros <= 4 ? 'помидора' : 
                    'помидоров'
                  }
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={resetTimer}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mainButton, isRunning ? styles.stopButton : styles.startButton]}
              onPress={toggleTimer}
              activeOpacity={0.7}
            >
              <Icon 
                name={isRunning ? "pause" : "play"} 
                size={32} 
                color={Colors.textPrimary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}
            >
              <Icon name="home" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Что такое техника Помодоро?</Text>
            <Text style={styles.infoText}>
              Техника Помодоро - это метод управления временем, который помогает повысить концентрацию и продуктивность. Работайте 25 минут (помидор), затем отдыхайте 5 минут. После 4 помидоров сделайте длинный перерыв 15-30 минут.
            </Text>
            <Text style={styles.infoText}>
              Завершено помидоров сегодня: {completedPomodoros}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modesContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 4,
    width: '100%',
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  timerProgress: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressCircleContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    width: 5,
    height: 140,
    top: 0,
    right: 140 - 2.5, // Центрирование полосы (половина ширины)
    borderRadius: 5,
  },
  progressIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    top: 5, // Отступ от края
    left: '50%',
    marginLeft: -4, // Половина ширины для центрирования
  },
  timerInnerCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  pomodoroCounter: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  mainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.normal,
  },
  stopButton: {
    backgroundColor: Colors.critical,
  },
  infoContainer: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default Focus;