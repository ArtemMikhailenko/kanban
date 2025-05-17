// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import styles from './LoginForm.module.css';
import { auth } from '@/api/api'; // Імпортуємо API-клієнт

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Функція оновлення текстових полів форми
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищення помилок при зміні значення
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Функція оновлення чекбоксу
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Валідація форми
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    // Валідація email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введіть коректний email';
    }
    
    // Валідація пароля
    if (!formData.password.trim()) {
      newErrors.password = 'Пароль обов\'язковий';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Відправка форми
  // src/components/auth/LoginForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log('🔹 LoginForm: handleSubmit, formData=', formData);

  // Якщо валідація не пройшла або йде вже submit — нічого не робимо
  if (!validateForm() || isSubmitting || isLoading) {
    console.log('🔹 Validation failed or loading, skip');
    return;
  }

  setIsSubmitting(true);
  try {
    console.log('🔹 Calling onSubmit from LoginPage');
    // Переданий з LoginPage onSubmit саме робить запит — тут ми його лише чекаємо
    await onSubmit(
      formData.email,
      formData.password,
      formData.rememberMe
    );
    console.log('🔹 onSubmit resolved successfully');
  } catch (err: any) {
    console.log('🔹 onSubmit threw error:', err);
    setErrors(prev => ({
      ...prev,
      general: err.message || 'Помилка входу'
    }));
  } finally {
    setIsSubmitting(false);
  }
};

  
  
  
  // Іконки для полів вводу
  const emailIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
  
  const passwordIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
  
  const eyeIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  
  const eyeOffIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Вхід до системи</h2>
          <p className={styles.formSubtitle}>
            Увійдіть у ваш обліковий запис Kanban
          </p>
        </div>
        
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={emailIcon}
              isRequired
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              label="Пароль"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введіть ваш пароль"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={passwordIcon}
              rightIcon={showPassword ? eyeOffIcon : eyeIcon}
              onRightIconClick={() => setShowPassword(!showPassword)}
              isRequired
            />
          </div>
          
          <div className={styles.formOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkmark}></span>
              <span>Запам'ятати мене</span>
            </label>
            
            <Link href="/auth/forgot-password" className={styles.link}>
              Забули пароль?
            </Link>
          </div>
          
          <div className={styles.formActions}>
            <Button 
              type="submit" 
              variant="primary" 
              isFullWidth 
              isLoading={isSubmitting || isLoading}
            >
              Увійти
            </Button>
          </div>
          
          <div className={styles.formFooter}>
            <p>
              Не маєте облікового запису?{' '}
              <Link href="/auth/register" className={styles.link}>
                Зареєструватися
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;