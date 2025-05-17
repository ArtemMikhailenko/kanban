// src/components/auth/RegisterForm.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName: string) => Promise<void>;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    general?: string;
  }>({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Функція оновлення полів форми
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищення помилок при зміні значення
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Валідація форми
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      fullName?: string;
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль має містити мінімум 8 символів';
    }
    
    // Валідація підтвердження пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }
    
    // Валідація імені
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ім\'я обов\'язкове';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Відправка форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting || isLoading) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData.email, formData.password, formData.fullName);
      // Перенаправлення на сторінку підтвердження email
      router.push('/auth/verify');
    } catch (error: any) {
      // Обробка помилок від сервера
      if (error.message === 'EMAIL_EXISTS') {
        setErrors(prev => ({ ...prev, email: 'Цей email вже використовується' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: error.message || 'Помилка реєстрації. Спробуйте пізніше.' 
        }));
      }
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
  
  const userIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
          <h2 className={styles.formTitle}>Створення облікового запису</h2>
          <p className={styles.formSubtitle}>
            Введіть ваші дані для реєстрації в системі Kanban
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
              label="Повне ім'я"
              name="fullName"
              placeholder="Введіть ваше ім'я та прізвище"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              leftIcon={userIcon}
              isRequired
              autoFocus
            />
          </div>
          
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
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              label="Пароль"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Мінімум 8 символів"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={passwordIcon}
              rightIcon={showPassword ? eyeOffIcon : eyeIcon}
              onRightIconClick={() => setShowPassword(!showPassword)}
              isRequired
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              label="Підтвердження пароля"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Повторіть пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={passwordIcon}
              rightIcon={showConfirmPassword ? eyeOffIcon : eyeIcon}
              onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              isRequired
            />
          </div>
          
          <div className={styles.formActions}>
            <Button 
              type="submit" 
              variant="primary" 
              isFullWidth 
              isLoading={isSubmitting || isLoading}
            >
              Зареєструватися
            </Button>
          </div>
          
          <div className={styles.formFooter}>
            <p>
              Вже маєте обліковий запис?{' '}
              <Link href="/auth/login" className={styles.link}>
                Увійти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;