// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './page.module.css';

// Приклад користувача (в реальному додатку буде отримано з API)
const MOCK_USER = {
  id: 'user1',
  fullName: 'Андрій Коваленко',
  email: 'andrii.kovalenko@example.com',
  avatarUrl: '',
  createdAt: '2023-08-15T10:30:00.000Z',
  lastLogin: '2023-11-05T09:15:00.000Z',
};

// Приклад недавніх проектів (в реальному додатку буде отримано з API)
const MOCK_RECENT_PROJECTS = [
  { id: '1', name: 'Розробка веб-сайту' },
  { id: '2', name: 'Мобільний додаток' },
  { id: '3', name: 'Маркетингова кампанія' },
];

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Стан форми профілю
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
  });
  
  // Стан форми зміни пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Помилки форми
  const [profileErrors, setProfileErrors] = useState<{
    fullName?: string;
    email?: string;
    general?: string;
  }>({});
  
  // Помилки форми пароля
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  // Посилання на елемент вибору файлу
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Завантаження даних користувача
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Перевіряємо авторизацію
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // В реальному додатку тут буде запит до API
        // Імітуємо затримку запиту
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Отримуємо дані користувача (в реальному додатку з API)
        setUser(MOCK_USER);
        setProfileForm({
          fullName: MOCK_USER.fullName,
          email: MOCK_USER.email,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  // Функція для отримання ініціалів користувача
  const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  // Функція для форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Обробник змін полів форми профілю
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
    
    // Очищаємо помилки при зміні поля
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors({
        ...profileErrors,
        [name]: undefined,
      });
    }
  };
  
  // Обробник змін полів форми пароля
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
    
    // Очищаємо помилки при зміні поля
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: undefined,
      });
    }
  };
  
  // Валідація форми профілю
  const validateProfileForm = () => {
    const errors: { fullName?: string; email?: string } = {};
    
    if (!profileForm.fullName.trim()) {
      errors.fullName = 'Ім\'я обов\'язкове';
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = 'Введіть коректний email';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Валідація форми пароля
  const validatePasswordForm = () => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Введіть поточний пароль';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Введіть новий пароль';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Пароль має бути не менше 8 символів';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Підтвердіть новий пароль';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Паролі не співпадають';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Обробник збереження змін профілю
  const handleSaveProfile = async () => {
    if (!validateProfileForm() || isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // В реальному додатку тут буде запит до API для оновлення профілю
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Оновлюємо стан користувача
      if (user) {
        const updatedUser = {
          ...user,
          fullName: profileForm.fullName,
          email: profileForm.email,
        };
        
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileErrors({
        general: 'Помилка при оновленні профілю. Спробуйте пізніше.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Обробник зміни пароля
  const handleChangePassword = async () => {
    if (!validatePasswordForm() || isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // В реальному додатку тут буде запит до API для зміни пароля
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Успішно змінили пароль
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setShowPasswordForm(false);
      
      alert('Пароль успішно змінено!');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({
        general: 'Помилка при зміні пароля. Перевірте правильність поточного пароля.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Обробник відкриття діалогу вибору файлу
  const handleSelectAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Обробник завантаження нового аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // В реальному додатку тут буде завантаження файлу на сервер
    // Для прикладу просто імітуємо зміну аватара
    const reader = new FileReader();
    reader.onload = (event) => {
      if (user && event.target?.result) {
        setUser({
          ...user,
          avatarUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Функція для виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };
  
  // Відображення заглушки під час завантаження
  if (isLoading) {
    return (
      <MainLayout 
        user={null} 
        recentProjects={[]}
        onLogout={handleLogout}
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Завантаження профілю...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Якщо користувача не знайдено
  if (!user) {
    return (
      <MainLayout 
        user={null} 
        recentProjects={[]}
        onLogout={handleLogout}
      >
        <div className={styles.errorContainer}>
          <h2>Помилка завантаження профілю</h2>
          <p>Не вдалося завантажити дані користувача. Спробуйте оновити сторінку або увійти знову.</p>
          <div className={styles.errorActions}>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Оновити сторінку
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Вийти
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      user={user} 
      recentProjects={MOCK_RECENT_PROJECTS}
      onLogout={handleLogout}
    >
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1>Мій профіль</h1>
        </div>
        
        <div className={styles.profileContent}>
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName} 
                  className={styles.avatar} 
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {getUserInitials(user.fullName)}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAvatar}
              >
                Змінити фото
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            
            <div className={styles.profileDetails}>
              {isEditing ? (
                <div className={styles.editForm}>
                  {profileErrors.general && (
                    <div className={styles.errorMessage}>
                      {profileErrors.general}
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <Input 
                      label="Повне ім'я"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      error={profileErrors.fullName}
                      isRequired
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <Input 
                      label="Email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      error={profileErrors.email}
                      isRequired
                    />
                  </div>
                  
                  <div className={styles.formActions}>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileForm({
                          fullName: user.fullName,
                          email: user.email,
                        });
                        setProfileErrors({});
                      }}
                    >
                      Скасувати
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={handleSaveProfile}
                      isLoading={isSaving}
                    >
                      Зберегти зміни
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.viewMode}>
                  <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>{user.fullName}</h2>
                    <p className={styles.profileEmail}>{user.email}</p>
                  </div>
                  
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Дата реєстрації</div>
                      <div className={styles.infoValue}>{formatDate(user.createdAt)}</div>
                    </div>
                    
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Останній вхід</div>
                      <div className={styles.infoValue}>{formatDate(user.lastLogin)}</div>
                    </div>
                  </div>
                  
                  <div className={styles.profileActions}>
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      leftIcon={
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      }
                    >
                      Редагувати профіль
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.securityCard}>
            <h2 className={styles.cardTitle}>Безпека</h2>
            
            {showPasswordForm ? (
              <div className={styles.passwordForm}>
                {passwordErrors.general && (
                  <div className={styles.errorMessage}>
                    {passwordErrors.general}
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <Input 
                    label="Поточний пароль"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                    isRequired
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <Input 
                    label="Новий пароль"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                    isRequired
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <Input 
                    label="Підтвердження пароля"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                    isRequired
                  />
                </div>
                
                <div className={styles.formActions}>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setPasswordErrors({});
                    }}
                  >
                    Скасувати
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleChangePassword}
                    isLoading={isSaving}
                  >
                    Змінити пароль
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.securityActions}>
                <Button 
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  leftIcon={
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  }
                >
                  Змінити пароль
                </Button>
              </div>
            )}
          </div>
          
          <div className={styles.dangerZoneCard}>
            <h2 className={styles.cardTitle}>Небезпечна зона</h2>
            <div className={styles.dangerZoneContent}>
              <p className={styles.dangerText}>
                Видалення облікового запису призведе до втрати всіх ваших проектів, задач та даних.
                Ця дія незворотна.
              </p>
              <Button 
                variant="danger"
                onClick={() => {
                  const isConfirmed = window.confirm('Ви впевнені, що хочете видалити свій обліковий запис? Ця дія незворотна.');
                  if (isConfirmed) {
                    // В реальному додатку тут буде запит до API для видалення облікового запису
                    localStorage.removeItem('authToken');
                    router.push('/auth/login');
                  }
                }}
              >
                Видалити обліковий запис
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}