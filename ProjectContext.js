// src/context/ProjectContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomColor } from '../utils/helpers';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка проектов при запуске
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storedProjects = await AsyncStorage.getItem('projects');
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
          console.log('Проекты загружены успешно');
        } else {
          // Демо-данные при первом запуске
          const initialProjects = [
            {
              id: '1',
              name: 'Работа',
              color: '#4A00E0', // фиолетовый
              icon: 'briefcase',
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Личное',
              color: '#9C27B0', // пурпурный
              icon: 'account',
              createdAt: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Дом',
              color: '#4CAF50', // зеленый
              icon: 'home',
              createdAt: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Здоровье',
              color: '#FF9800', // оранжевый 
              icon: 'heart-pulse',
              createdAt: new Date().toISOString()
            }
          ];
          setProjects(initialProjects);
          
          // Сохраняем демо-данные в AsyncStorage
          await saveProjectsToStorage(initialProjects);
          console.log('Добавлены демо-проекты');
        }
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        setError('Не удалось загрузить проекты. Пожалуйста, перезапустите приложение');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Сохранение проектов в AsyncStorage
  const saveProjectsToStorage = async (projectsToSave) => {
    try {
      const jsonProjects = JSON.stringify(projectsToSave);
      await AsyncStorage.setItem('projects', jsonProjects);
      console.log('Проекты успешно сохранены в хранилище');
      return true;
    } catch (error) {
      console.error('Ошибка сохранения проектов:', error);
      setError('Не удалось сохранить изменения');
      return false;
    }
  };

  // Сохранение проектов при изменении с использованием useCallback
  const saveProjects = useCallback(async (updatedProjects) => {
    setLoading(true);
    
    try {
      const success = await saveProjectsToStorage(updatedProjects);
      if (success) {
        setProjects(updatedProjects);
        setError(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка сохранения проектов:', error);
      setError('Не удалось сохранить изменения');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление нового проекта
  const addProject = useCallback(async (project) => {
    try {
      // Проверка обязательных полей
      if (!project.name || project.name.trim() === '') {
        throw new Error('Название проекта не может быть пустым');
      }
      
      // Генерация случайного цвета, если не указан
      if (!project.color) {
        project.color = generateRandomColor();
      }
      
      // Создание объекта проекта
      const newProject = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        icon: project.icon || 'folder'
      };
      
      const updatedProjects = [...projects, newProject];
      const success = await saveProjects(updatedProjects);
      
      if (success) {
        console.log('Добавлен новый проект:', newProject);
        return newProject;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при добавлении проекта:', error);
      setError(error.message || 'Не удалось добавить проект');
      return null;
    }
  }, [projects, saveProjects]);

  // Обновление существующего проекта
  const updateProject = useCallback(async (updatedProject) => {
    try {
      // Проверяем, существует ли проект с таким id
      if (!projects.find(project => project.id === updatedProject.id)) {
        throw new Error('Проект не найден');
      }
      
      // Проверка обязательных полей
      if (!updatedProject.name || updatedProject.name.trim() === '') {
        throw new Error('Название проекта не может быть пустым');
      }
      
      const updatedProjects = projects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      );
      
      const success = await saveProjects(updatedProjects);
      
      if (success) {
        console.log('Проект обновлен:', updatedProject);
        return updatedProject;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error);
      setError(error.message || 'Не удалось обновить проект');
      return null;
    }
  }, [projects, saveProjects]);

  // Удаление проекта
  const deleteProject = useCallback(async (projectId) => {
    try {
      // Проверяем, существует ли проект с таким id
      if (!projects.find(project => project.id === projectId)) {
        throw new Error('Проект не найден');
      }
      
      const filteredProjects = projects.filter(project => project.id !== projectId);
      const success = await saveProjects(filteredProjects);
      
      if (success) {
        console.log('Проект удален, ID:', projectId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      setError(error.message || 'Не удалось удалить проект');
      return false;
    }
  }, [projects, saveProjects]);

  // Получение информации о проекте по id
  const getProjectById = useCallback((projectId) => {
    return projects.find(project => project.id === projectId) || null;
  }, [projects]);

  // Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Значение контекста с улучшенной обработкой ошибок
  const value = {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};