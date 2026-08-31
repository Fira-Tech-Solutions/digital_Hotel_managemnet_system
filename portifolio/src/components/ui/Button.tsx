import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const base = 'inline-flex items-center justify-center font-sans font-medium tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-gold text-primary hover:bg-gold-light active:bg-gold-dark',
  secondary: 'border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold active:bg-gold/20',
  ghost: 'text-ivory/70 hover:text-ivory underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'px-5 py-2.5 text-[10px]',
  md: 'px-8 py-3.5 text-xs',
  lg: 'px-10 py-4 text-xs',
};

export function Button({ children, variant = 'primary', size = 'md', href, onClick, className = '', type = 'button', disabled }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link to={href} className={classes} role="button">
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
