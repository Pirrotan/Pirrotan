// src/screens/Onboarding.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/colors';

const Onboarding = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Icon name="shield-check" size={40} color={Colors.textPrimary} />
          </View>
          <Text style={styles.appName}>MindEase</Text>
          <Text style={styles.appDescription}>
            Спокойный планировщик для управления задачами и снижения тревожности
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Icon name="checkbox-marked-outline" size={24} color={Colors.textSecondary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Управление задачами</Text>
              <Text style={styles.featureDescription}>
                Гибкие приоритеты и разбивка на шаги
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Icon name="heart-pulse" size={24} color={Colors.textSecondary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Инструменты для снижения тревоги</Text>
              <Text style={styles.featureDescription}>
                Дыхательные упражнения и техники релаксации
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Icon name="wallet-outline" size={24} color={Colors.textSecondary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Финансовый учет</Text>
              <Text style={styles.featureDescription}>
                Отслеживание расходов и доходов и напоминания
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.startButtonText}>Начать</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Нажимая "Начать", вы соглашаетесь с нашими Условиями использования
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  featuresContainer: {
    marginTop: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default Onboarding;
