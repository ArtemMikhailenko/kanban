'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';
import { auth } from '@/api/api';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Отримуємо email з localStorage (встановлений під час реєстрації)
  useEffect(() => {
    const savedEmail = localStorage.getItem('verificationEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      // Якщо email не знайдено, перенаправляємо на сторінку реєстрації
      router.push('/auth/register');
    }
  }, [router]);

  // Функція для повторного надсилання листа з підтвердженням
  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    setResendStatus({});

    try {
      // Викликаємо API для повторного надсилання листа
      await auth.resendVerification(email);

      setResendStatus({
        success: true,
        message: 'Лист з підтвердженням надіслано повторно!'
      });
    } catch (error: any) {
      // Обробка помилок
      setResendStatus({
        success: false,
        message: error.response?.data?.message || 'Не вдалося надіслати лист. Спробуйте пізніше.'
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.verifyCard}>
        <div className={styles.iconContainer}>
          <svg 
            className={styles.emailIcon} 
            viewBox="0 0 24 24" 
            width="64" 
            height="64" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className={styles.title}>Підтвердіть ваш email</h1>
        
        <p className={styles.description}>
          Ми надіслали лист з посиланням для підтвердження на адресу:
        </p>
        
        <div className={styles.emailAddress}>{email}</div>
        
        <p className={styles.instruction}>
          Перевірте вашу поштову скриньку та слідуйте інструкціям у листі для завершення
          реєстрації. Якщо ви не бачите листа, перевірте папку "Спам".
        </p>

        {resendStatus.message && (
          <div className={`${styles.statusMessage} ${resendStatus.success ? styles.success : styles.error}`}>
            {resendStatus.message}
          </div>
        )}

        <div className={styles.actions}>
          <Button 
            variant="outline" 
            onClick={handleResendEmail}
            isLoading={isResendingEmail}
            isFullWidth
          >
            Надіслати лист ще раз
          </Button>
          
          <Link href="/auth/login" className={styles.loginLink}>
            <Button variant="ghost" isFullWidth>
              Повернутися до сторінки входу
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}