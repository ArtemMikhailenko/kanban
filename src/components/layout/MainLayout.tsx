"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface Project {
  id: string;
  name: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  recentProjects?: Project[];
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  recentProjects = [],
  onLogout,
}) => {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const pathname = usePathname();

  // Ефект для перевірки скролінгу сторінки
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsHeaderScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Ефект для зчитування налаштування згортання сайдбару із localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setIsSidebarCollapsed(savedCollapsedState === 'true');
    }
  }, []);
  
  // Обробка перемикання стану згортання сайдбару
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };
  
  // Перевірка авторизованості користувача
  const isAuth = !!user;
  
  // Перевірка, чи не є поточна сторінка сторінкою авторизації
  const isAuthPage = pathname.startsWith('/auth/');
  
  // Якщо це сторінка авторизації, не відображаємо головний макет
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <Header 
        user={user} 
        onLogout={onLogout} 
        //@ts-ignore
        className={isHeaderScrolled ? styles.scrolled : ''}
      />
      
      {isAuth && (
        <Sidebar
          recentProjects={recentProjects}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      )}
      
      <main 
        className={`${styles.main} ${isAuth ? styles.withSidebar : ''} ${
          isAuth && isSidebarCollapsed ? styles.withCollapsedSidebar : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;