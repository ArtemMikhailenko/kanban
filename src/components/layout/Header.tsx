// src/components/layout/Header.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Button } from '../ui/Button/Button';
import styles from './Header.module.css';
import { usePathname } from 'next/navigation';
interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user?: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Отримуємо ініціали користувача для аватара
  const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  // Закриваємо випадаюче меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Перемикання стану мобільного меню
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Обробляємо клік на кнопці виходу
  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    onLogout();
  };
  
  // Логотип додатку
  const Logo = () => (
    <Link href={user ? '/dashboard' : '/'} className={styles.logo}>
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
      <span className={styles.logoText}>KanbanFlow</span>
    </Link>
  );
  
  // Навігаційне меню
  const Navigation = () => (
    <nav className={styles.nav}>
      {user ? (
        <>
          <Link 
            href="/dashboard" 
            className={`${styles.navLink} ${pathname.startsWith('/dashboard') ? styles.active : ''}`}
          >
            Дошки
          </Link>
          <Link 
            href="/calendar" 
            className={`${styles.navLink} ${pathname.startsWith('/calendar') ? styles.active : ''}`}
            >
            Календар
          </Link>
        </>
      ) : (
        <>
          <Link 
            href="/features" 
            className={`${styles.navLink} ${pathname === '/features' ? styles.active : ''}`}
          >
            Можливості
          </Link>
          <Link 
            href="/pricing" 
            className={`${styles.navLink} ${pathname === '/pricing' ? styles.active : ''}`}
          >
            Ціни
          </Link>
          <Link 
            href="/about" 
            className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}
          >
            Про нас
          </Link>
        </>
      )}
    </nav>
  );
  
  // Кнопки авторизації
  const AuthButtons = () => (
    <div className={styles.authButtons}>
      <Link href="/auth/login">
        <Button variant="ghost">Увійти</Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="primary">Реєстрація</Button>
      </Link>
    </div>
  );
  
  // Профіль користувача
  const UserProfile = () => (
    <div className={styles.userProfile} ref={profileMenuRef}>
      <button 
        className={styles.profileButton}
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        aria-expanded={isProfileMenuOpen}
        aria-label="Меню користувача"
      >
        {user?.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.fullName} 
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {getUserInitials(user?.fullName || 'User')}
          </div>
        )}
        <span className={styles.userName}>{user?.fullName}</span>
        <svg 
          viewBox="0 0 24 24" 
          width="16" 
          height="16" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          className={isProfileMenuOpen ? styles.chevronUp : styles.chevronDown}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      
      {isProfileMenuOpen && (
        <div className={styles.profileMenu}>
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.fullName}</span>
              <span className={styles.profileEmail}>{user?.email}</span>
            </div>
          </div>
          <div className={styles.menuItems}>
            <Link href="/profile" className={styles.menuItem}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Мій профіль
            </Link>
            <Link href="/settings" className={styles.menuItem}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Налаштування
            </Link>
            <hr className={styles.menuDivider} />
            <button className={styles.menuItem} onClick={handleLogout}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Вийти
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Іконка гамбургера для мобільного меню
  const HamburgerIcon = () => (
    <button 
      className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      onClick={toggleMobileMenu}
      aria-expanded={isMobileMenuOpen}
      aria-label="Меню"
    >
      <span className={styles.hamburgerLine}></span>
      <span className={styles.hamburgerLine}></span>
      <span className={styles.hamburgerLine}></span>
    </button>
  );

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Logo />
        
        <div className={styles.desktopNav}>
          <Navigation />
          {user ? <UserProfile /> : <AuthButtons />}
        </div>
        
        <div className={styles.mobileNav}>
          <HamburgerIcon />
        </div>
        
        {/* Мобільне меню */}
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.visible : ''}`}>
          <div className={styles.mobileMenuContent}>
            <Navigation />
            {user ? (
              <>
                <div className={styles.mobileUserProfile}>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName} 
                      className={styles.mobileAvatar}
                    />
                  ) : (
                    <div className={styles.mobileAvatarPlaceholder}>
                      {getUserInitials(user.fullName)}
                    </div>
                  )}
                  <div className={styles.mobileUserInfo}>
                    <span className={styles.mobileUserName}>{user.fullName}</span>
                    <span className={styles.mobileUserEmail}>{user.email}</span>
                  </div>
                </div>
                <div className={styles.mobileMenuItems}>
                  <Link href="/profile" className={styles.mobileMenuItem}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Мій профіль
                  </Link>
                  <Link href="/settings" className={styles.mobileMenuItem}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Налаштування
                  </Link>
                  <hr className={styles.mobileMenuDivider} />
                  <button className={styles.mobileMenuItem} onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Вийти
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <Link href="/auth/login" className={styles.mobileAuthButton}>
                  <Button variant="ghost" isFullWidth>Увійти</Button>
                </Link>
                <Link href="/auth/register" className={styles.mobileAuthButton}>
                  <Button variant="primary" isFullWidth>Реєстрація</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;