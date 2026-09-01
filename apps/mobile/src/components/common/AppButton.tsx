import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface AppButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function AppButton({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  icon,
}: AppButtonProps) {
  const baseStyles = 'items-center justify-center rounded-2xl py-3.5 px-5 flex-row gap-2 active:opacity-85';
  
  const variantStyles = {
    primary: 'bg-mint text-ink',
    secondary: 'bg-sky/20 border border-sky/30 text-sky',
    outline: 'border border-white/15 bg-white/5 text-white',
    danger: 'bg-red-500/20 border border-red-500/30 text-red-300',
  }[variant];

  const textColor = {
    primary: 'text-[#071018]',
    secondary: 'text-sky',
    outline: 'text-white',
    danger: 'text-red-300',
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#071018' : '#57E0B7'} />
      ) : (
        <>
          {icon}
          <Text className={`font-black text-xs uppercase tracking-wider ${textColor}`}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
