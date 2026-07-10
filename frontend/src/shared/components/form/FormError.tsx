import type { ReactNode } from 'react';

interface FormErrorProps {
  children: ReactNode;
  className?: string;
}

function FormError({ children, className = '' }: FormErrorProps) {
  return (
    <p className={`form-error${className ? ` ${className}` : ''}`} role="alert">
      {children}
    </p>
  );
}

export default FormError;
