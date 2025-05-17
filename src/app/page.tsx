// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Перевірка, чи користувач авторизований
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Це потрібно замінити на справжню перевірку авторизації з вашого API
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Якщо є токен, перевіряємо його валідність на сервері
          // const response = await authService.checkToken();
          // if (response.isValid) {
          //   setIsLoggedIn(true);
          //   router.push('/dashboard');
          //   return;
          // }
          
          // Для прикладу просто перенаправляємо на dashboard
          setIsLoggedIn(true);
          router.push('/dashboard');
        } else {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Функція виходу з системи (для тестування)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  // Відображаємо лоадер під час перевірки
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Хедер */}
      <Header user={null} onLogout={handleLogout} />

      {/* Головний банер */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Управляйте проектами <span className={styles.highlight}>ефективно</span>
          </h1>
          <p className={styles.heroSubtitle}>
            KanbanFlow допомагає командам та індивідуальним користувачам 
            організувати роботу, відстежувати прогрес та дотримуватися дедлайнів.
          </p>
          <div className={styles.heroCta}>
            <Link href="/auth/register">
              <Button variant="primary" size="lg">
                Почати безкоштовно
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg">
                Дізнатись більше
              </Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img 
            src="/hero.png" 
            alt="KanbanFlow демонстрація" 
            width={600} 
            height={400} 
          />
        </div>
      </section>

      {/* Секція можливостей */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Основні можливості</h2>
          <p className={styles.sectionSubtitle}>
            Все, що необхідно для ефективної організації та відстеження задач
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Kanban-дошки</h3>
            <p className={styles.featureDescription}>
              Створюйте необмежену кількість дошок для різних проектів з можливістю
              налаштування колонок під ваш робочий процес.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Управління задачами</h3>
            <p className={styles.featureDescription}>
              Деталізуйте задачі, встановлюйте дедлайни, пріоритети та перетягуйте
              їх між колонками в залежності від статусу виконання.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Google Calendar</h3>
            <p className={styles.featureDescription}>
              Синхронізуйте всі ваші задачі з Google Calendar для зручного
              перегляду розкладу та отримання нагадувань.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Сповіщення</h3>
            <p className={styles.featureDescription}>
              Отримуйте нагадування про наближення дедлайнів та пропущені
              терміни через email та в інтерфейсі додатку.
            </p>
          </div>
        </div>
      </section>

      {/* Секція відгуків (приклад) */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Наші користувачі говорять</h2>
          <p className={styles.sectionSubtitle}>
            KanbanFlow допомагає сотням компаній та індивідуальних користувачів покращити їх продуктивність
          </p>
        </div>

        <div className={styles.testimonialsList}>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialText}>
              "KanbanFlow повністю змінив те, як наша команда організовує роботу. 
              Інтуїтивний інтерфейс та інтеграція з Google Calendar зробили нашу роботу набагато ефективнішою."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>ОП</div>
              <div className={styles.testimonialInfo}>
                <span className={styles.testimonialName}>Олександр Петренко</span>
                <span className={styles.testimonialPosition}>Менеджер проектів, IT Solutions</span>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <p className={styles.testimonialText}>
              "Як фрілансер, я користуюсь KanbanFlow для відстеження всіх своїх проектів. 
              Сповіщення про дедлайни допомагають мені не пропускати важливі терміни."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>ІК</div>
              <div className={styles.testimonialInfo}>
                <span className={styles.testimonialName}>Ірина Ковальчук</span>
                <span className={styles.testimonialPosition}>Фрілансер, Графічний дизайнер</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Заклик до дії */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Готові підвищити вашу продуктивність?</h2>
          <p className={styles.ctaSubtitle}>
            Приєднуйтесь до тисяч користувачів, які вже використовують KanbanFlow
            для ефективного управління своїми проектами.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/auth/register">
              <Button variant="primary" size="lg">
                Зареєструватися безкоштовно
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Link href="/" className={styles.logoLink}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className={styles.logoText}>KanbanFlow</span>
            </Link>
            <p className={styles.footerTagline}>
              Ефективне управління проектами та задачами
            </p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Продукт</h4>
              <ul className={styles.footerLinkList}>
                <li><Link href="/features">Можливості</Link></li>
                <li><Link href="/pricing">Ціни</Link></li>
                <li><Link href="/updates">Оновлення</Link></li>
              </ul>
            </div>

            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Компанія</h4>
              <ul className={styles.footerLinkList}>
                <li><Link href="/about">Про нас</Link></li>
                <li><Link href="/contact">Контакти</Link></li>
                <li><Link href="/careers">Кар'єра</Link></li>
              </ul>
            </div>

            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Ресурси</h4>
              <ul className={styles.footerLinkList}>
                <li><Link href="/blog">Блог</Link></li>
                <li><Link href="/help">Допомога</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>

            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Правові документи</h4>
              <ul className={styles.footerLinkList}>
                <li><Link href="/terms">Умови використання</Link></li>
                <li><Link href="/privacy">Політика конфіденційності</Link></li>
                <li><Link href="/gdpr">GDPR</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} KanbanFlow. Всі права захищені.</p>
        </div>
      </footer>
    </div>
  );
}