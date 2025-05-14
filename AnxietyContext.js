// src/context/AnxietyContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnxietyContext = createContext();

export const useAnxiety = () => useContext(AnxietyContext);

export const AnxietyProvider = ({ children }) => {
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [loading, setLoading] = useState(true);

  // Загрузка уровня тревожности при запуске
  useEffect(() => {
    const loadAnxietyLevel = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem('anxietyLevel');
        if (storedLevel) {
          setAnxietyLevel(parseInt(storedLevel));
        }
      } catch (error) {
        console.error('Ошибка загрузки уровня тревожности:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnxietyLevel();
  }, []);

  // Сохранение уровня тревожности при изменении
  useEffect(() => {
    const saveAnxietyLevel = async () => {
      try {
        await AsyncStorage.setItem('anxietyLevel', anxietyLevel.toString());
        console.log('Уровень тревожности сохранен:', anxietyLevel);
      } catch (error) {
        console.error('Ошибка сохранения уровня тревожности:', error);
      }
    };

    if (!loading) {
      saveAnxietyLevel();
    }
  }, [anxietyLevel, loading]);

  // Обновление уровня тревожности
  const updateAnxietyLevel = (level) => {
    setAnxietyLevel(level);
  };

  return (
    <AnxietyContext.Provider
      value={{
        anxietyLevel,
        updateAnxietyLevel,
        loading,
      }}
    >
      {children}
    </AnxietyContext.Provider>
  );
};