'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProjectsList from '@/components/dashboard/ProjectsList';
import { Project } from '@/components/dashboard/ProjectsList';
import styles from './page.module.css';
import { auth, projects as projectsApi } from '@/api/api';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ефект для завантаження проектів та перевірки авторизації
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Перевіряємо наявність токену в localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // Якщо користувач не авторизований, перенаправляємо на сторінку входу
          router.push('/auth/login');
          return;
        }
        
        // Отримуємо дані користувача
        const userResponse = await auth.me();
        setUser(userResponse.data);
        
        // Отримуємо проекти користувача
        const projectsResponse = await projectsApi.getAll();
        setProjects(projectsResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        
        // Якщо токен невалідний, видаляємо його і перенаправляємо на сторінку входу
        localStorage.removeItem('authToken');
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Функція виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };
  
  // Функція створення нового проекту
  const handleCreateProject = async (name: string, description: string) => {
    try {
      // Запит до API для створення проекту
      const response = await projectsApi.create({ name, description });
      
      // Додаємо новий проект до списку
      setProjects([response.data, ...projects]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };
  
  // Функція видалення проекту
  const handleDeleteProject = async (projectId: string) => {
    try {
      // Запит до API для видалення проекту
      await projectsApi.delete(projectId);
      
      // Видаляємо проект зі списку
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  
  // Функція оновлення проекту
  const handleUpdateProject = async (projectId: string, name: string, description: string) => {
    try {
      // Запит до API для оновлення проекту
      await projectsApi.update(projectId, { name, description });
      
      // Оновлюємо проект у списку
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              name, 
              description, 
              updatedAt: new Date().toISOString() 
            } 
          : project
      ));
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };
  
  // Відображаємо лоадер під час перевірки авторизації та завантаження даних
  if (isLoading) {
    return (
      <MainLayout user={null} onLogout={handleLogout}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Завантаження проектів...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      user={user} 
      recentProjects={projects.slice(0, 3)} 
      onLogout={handleLogout}
    >
      <div className={styles.dashboardContainer}>
        <ProjectsList
          projects={projects}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProject={handleUpdateProject}
        />
      </div>
    </MainLayout>
  );
}