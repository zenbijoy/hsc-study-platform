import React, { useState } from 'react';
import {
  Pressable,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export interface PasswordFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function PasswordField({
  label = 'Password',
  error,
  helperText,
  className = '',
  onFocus,
  onBlur,
  ...rest
}: PasswordFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(error);

  let borderColor = theme.colors.border;
  if (hasError) borderColor = theme.colors.danger;
  else if (isFocused) borderColor = theme.colors.primary;

  return (
    <View className={`w-full mb-4 ${className}`}>
      <AppText variant="labelMedium" color="secondary" className="mb-1.5 font-semibold">
        {label}
      </AppText>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderColor,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
        className="flex-row items-center gap-2.5"
      >
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={hasError ? theme.colors.danger : isFocused ? theme.colors.primary : theme.colors.textMuted}
        />

        <TextInput
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{
            color: theme.colors.textPrimary,
            fontSize: 14,
            padding: 0,
            margin: 0,
          }}
          className="flex-1"
          {...rest}
        />

        <Pressable
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          className="active:opacity-75"
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={theme.colors.textMuted}
          />
        </Pressable>
      </View>

      {hasError ? (
        <AppText variant="caption" color="rose" className="mt-1 ml-1">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="muted" className="mt-1 ml-1">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
