// src/app/auth/verify/[token]/ClientVerify.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/api/api';
import styles from './page.module.css';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';

interface ClientVerifyProps {
  token: string;
}

export default function ClientVerify({ token }: ClientVerifyProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await auth.verifyEmail(token);
        localStorage.setItem('authToken', data.token ?? data.accessToken);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message ?? 'Недійсний токен');
      }
    })();
  }, [token]);

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => router.push('/dashboard'), 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className={styles.verifyCard}>Перевіряємо токен…</div>;
  }
  if (status === 'error') {
    return (
      <div className={styles.verifyCard}>
        <p>{errorMessage}</p>
        <Link href="/auth/verify"><Button>Спробувати знову</Button></Link>
      </div>
    );
  }
  return (
    <div className={styles.verifyCard}>
      <p>Email підтверджено! Зараз переходимо на Dashboard…</p>
      <Link href="/dashboard"><Button>Перейти зараз</Button></Link>
    </div>
  );
}
