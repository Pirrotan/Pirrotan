// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: 'Александр',
    avatar: null, // Для будущего использования, если добавим выбор аватарок
    theme: 'dark',
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  // Загрузка данных пользователя при запуске
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
          console.log('Данные пользователя загружены');
        } else {
          // Демо-данные для первого запуска
          const defaultUserData = {
            name: 'Александр',
            avatar: null,
            theme: 'dark',
            notificationsEnabled: true,
          };
          
          setUserData(defaultUserData);
          await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
          console.log('Установлены данные пользователя по умолчанию');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Сохранение данных пользователя при изменении
  useEffect(() => {
    const saveUserData = async () => {
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('Данные пользователя сохранены');
      } catch (error) {
        console.error('Ошибка сохранения данных пользователя:', error);
      }
    };

    if (!loading) {
      saveUserData();
    }
  }, [userData, loading]);

  // Обновление имени пользователя
  const updateUserName = (name) => {
    if (name.trim()) {
      setUserData(prevData => ({
        ...prevData,
        name
      }));
      return true;
    }
    return false;
  };

  // Обновление настроек уведомлений
  const updateNotificationSettings = (enabled) => {
    setUserData(prevData => ({
      ...prevData,
      notificationsEnabled: enabled
    }));
    return true;
  };

  // Обновление темы
  const updateTheme = (theme) => {
    setUserData(prevData => ({
      ...prevData,
      theme
    }));
    return true;
  };

  // Сброс настроек пользователя
  const resetUserSettings = async () => {
    const defaultUserData = {
      name: 'Александр',
      avatar: null,
      theme: 'dark',
      notificationsEnabled: true,
    };
    
    setUserData(defaultUserData);
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
      return true;
    } catch (error) {
      console.error('Ошибка сброса настроек пользователя:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        updateUserName,
        updateNotificationSettings,
        updateTheme,
        resetUserSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};