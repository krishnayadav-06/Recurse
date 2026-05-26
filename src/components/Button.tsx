"use client";
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center overflow-hidden font-medium transition-all duration-300 magnetic-hover hover:-translate-y-[1px]";

  const variants = {
    primary: "bg-ink text-white rounded-lg px-4 py-1.5 text-sm border border-transparent",
    ghost: "border border-border-light text-muted hover:border-gray-400 hover:text-ink bg-transparent rounded-lg px-4 py-1.5 text-sm",
    outline: "border border-border-light text-ink hover:border-gray-400 hover:bg-wash bg-surface rounded-lg px-4 py-1.5 text-sm"
  };

  return (
    <button className={`group ${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gray-700 translate-y-[100%] transition-transform duration-300 ease-out group-hover:translate-y-0 z-0"></span>
      )}
      <span className="relative z-10 flex items-center justify-center w-full h-full gap-2">{children}</span>
    </button>
  );
};
