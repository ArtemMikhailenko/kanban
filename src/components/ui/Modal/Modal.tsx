// src/components/ui/Modal/Modal.tsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  isScrollable?: boolean;
  isLoading?: boolean;
  modalClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isScrollable = true,
  isLoading = false,
  modalClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusedElement = useRef<HTMLElement | null>(null);

  // Вловлює натискання ESC для закриття модального вікна
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Керування фокусом модального вікна
  useEffect(() => {
    if (isOpen) {
      prevFocusedElement.current = document.activeElement as HTMLElement;
      
      // Запобігає прокрутці фону при відкритому модальному вікні
      document.body.style.overflow = 'hidden';
      
      // Фокусуємо модальне вікно для правильної роботи клавіші Escape
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Відновлюємо прокрутку фону після закриття
      document.body.style.overflow = '';
      
      // Повертаємо фокус на елемент, який був активним перед відкриттям модального вікна
      if (prevFocusedElement.current) {
        prevFocusedElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Обробник кліку по оверлею
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Компонент рендериться, тільки якщо isOpen === true
  if (!isOpen) return null;

  // Формуємо класи для модального вікна
  const modalClasses = [
    styles.modal,
    styles[`size-${size}`],
    isScrollable ? styles.scrollable : '',
    isLoading ? styles.loading : '',
    modalClassName,
  ].filter(Boolean).join(' ');

  // Рендеримо модальне вікно в порталі для правильного позиціонування в DOM
  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div 
        className={modalClasses}
        ref={modalRef}
        tabIndex={-1} // Дозволяє фокусування div для захоплення подій клавіатури
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Кнопка закриття */}
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        {/* Заголовок модального вікна */}
        {title && (
          <div className={`${styles.header} ${headerClassName}`}>
            <h3 id="modal-title" className={styles.title}>{title}</h3>
          </div>
        )}
        
        {/* Тіло модального вікна */}
        <div className={`${styles.body} ${bodyClassName}`}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Завантаження...</p>
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Футер модального вікна, якщо передано */}
        {footer && (
          <div className={`${styles.footer} ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;