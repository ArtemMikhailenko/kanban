// src/app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import styles from './page.module.css';
import { auth } from '@/api/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      router.push('/dashboard');
    }
  }, [router]);

  // Ось сюди приходять дані з LoginForm
  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    try {
      const { data } = await auth.login({ email, password, rememberMe });
  
      // Успішно залогінились — зберігаємо токен
      const token = data.token ?? data.accessToken;
      if (!token) throw new Error('NO_TOKEN');
      localStorage.setItem('authToken', token);
      router.push('/dashboard');
  
    }catch (err: any) {
        const msg = err.response?.data?.message || '';
      
        // якщо в повідомленні є "Email не підтверджено" — редіректимо
        if (msg.includes('Email не підтверджено')) {
          localStorage.setItem('verificationEmail', email);
          router.push('/auth/verify');
          return;
        }
      
        // в інших випадках кидаємо далі, щоб LoginForm показав помилку
        throw new Error(
          msg ||
          err.response?.data?.error ||
          err.message ||
          'INVALID_CREDENTIALS'
        );
      
  
      
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className={styles.pageContainer}>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
