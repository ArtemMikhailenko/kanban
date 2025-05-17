'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  recentProjects?: Project[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  recentProjects = [],
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const pathname = usePathname();

  // Закриваємо мобільний сайдбар при зміні маршруту
  
useEffect(() => {
  setIsMobileExpanded(false);
}, [pathname]);
  
  // Перемикання видимості мобільного сайдбару
  const toggleMobileSidebar = () => {
    setIsMobileExpanded(!isMobileExpanded);
  };
  
  // Перевірка, чи активний поточний маршрут
  const isRouteActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  // Компонент посилання навігації
  const NavLink = ({ path, icon, label }: { path: string, icon: React.ReactNode, label: string }) => (
    <Link 
      href={path} 
      className={`${styles.navLink} ${isRouteActive(path) ? styles.active : ''}`}
      title={isCollapsed ? label : undefined}
    >
      <span className={styles.navIcon}>
        {icon}
      </span>
      {!isCollapsed && <span className={styles.navLabel}>{label}</span>}
    </Link>
  );
  
  // Іконки для навігації
  const dashboardIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
  
  const calendarIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
  
  const analyticsIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
  
  const settingsIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
  
  const profileIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
  
  const collapseIcon = isCollapsed ? (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M13 17l5-5-5-5" />
      <path d="M6 17l5-5-5-5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M11 17l-5-5 5-5" />
      <path d="M18 17l-5-5 5-5" />
    </svg>
  );

  const sidebarClasses = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : '',
    isMobileExpanded ? styles.mobileExpanded : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Мобільний перемикач сайдбару */}
      <button 
        className={styles.mobileToggle}
        onClick={toggleMobileSidebar}
        aria-label={isMobileExpanded ? 'Згорнути меню' : 'Розгорнути меню'}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      {/* Затемнення для мобільного сайдбару */}
      {isMobileExpanded && (
        <div 
          className={styles.overlay}
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Сайдбар */}
      <aside className={sidebarClasses}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logo}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            {!isCollapsed && <span className={styles.logoText}>KanbanFlow</span>}
          </Link>
          
          <button
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Розгорнути меню' : 'Згорнути меню'}
          >
            {collapseIcon}
          </button>
        </div>
        
        <nav className={styles.nav}>
          <NavLink path="/dashboard" icon={dashboardIcon} label="Дошки" />
          <NavLink path="/calendar" icon={calendarIcon} label="Календар" />
          <NavLink path="/analytics" icon={analyticsIcon} label="Аналітика" />
        </nav>
        
        {/* Недавні проекти */}
        {recentProjects.length > 0 && (
          <div className={styles.recentProjects}>
            {!isCollapsed && <h3 className={styles.sectionTitle}>Недавні проекти</h3>}
            
            <div className={styles.projectsList}>
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/${project.id}`}
                  className={`${styles.projectLink} ${
                    isRouteActive(`/dashboard/${project.id}`) ? styles.active : ''
                  }`}
                  title={isCollapsed ? project.name : undefined}
                >
                  <span className={styles.projectIcon}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </span>
                  {!isCollapsed && <span className={styles.projectName}>{project.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.bottomNav}>
          <NavLink path="/profile" icon={profileIcon} label="Профіль" />
          <NavLink path="/settings" icon={settingsIcon} label="Налаштування" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;