'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import styles from './page.module.css';
import { auth } from '@/api/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Перевіряємо, чи користувач вже авторизований
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);
  
  // Функція для обробки реєстрації користувача
  const handleRegister = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    try {
      // Запит до API для реєстрації
      await auth.register({ email, password, fullName });
      
      // Зберігаємо email для сторінки підтвердження
      localStorage.setItem('verificationEmail', email);
      
      // Перенаправляємо на сторінку підтвердження
      router.push('/auth/verify');
    } catch (error: any) {
      // Обробка помилок від сервера
      const errorMessage = error.response?.data?.message || 'EMAIL_EXISTS';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </div>
  );
}
