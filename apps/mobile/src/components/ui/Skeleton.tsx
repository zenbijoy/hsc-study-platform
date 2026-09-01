import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme';
import { Card } from './Card';

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  className = '',
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: theme.colors.surfaceElevated,
          opacity,
        },
        style,
      ]}
      className={className}
    />
  );
}

export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <View className={`gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
          borderRadius={6}
        />
      ))}
    </View>
  );
}

export function BookCardSkeleton() {
  return (
    <Card variant="outlined" className="w-[160px] mr-3 p-3">
      <Skeleton height={180} borderRadius={12} className="w-full mb-3" />
      <Skeleton height={14} width="85%" borderRadius={4} className="mb-1.5" />
      <Skeleton height={10} width="50%" borderRadius={4} />
    </Card>
  );
}

export function FormulaCardSkeleton() {
  return (
    <Card variant="outlined" className="p-4 mb-3">
      <View className="flex-row justify-between mb-3">
        <Skeleton height={12} width="40%" borderRadius={4} />
        <Skeleton height={12} width="20%" borderRadius={4} />
      </View>
      <Skeleton height={28} width="80%" borderRadius={6} className="mb-3" />
      <Skeleton height={10} width="50%" borderRadius={4} />
    </Card>
  );
}

export function SubjectCardSkeleton() {
  return (
    <Card variant="outlined" className="p-4 mb-3">
      <View className="flex-row items-center gap-3">
        <Skeleton height={46} width={46} borderRadius={12} />
        <View className="flex-1 gap-2">
          <Skeleton height={16} width="60%" borderRadius={4} />
          <Skeleton height={10} width="40%" borderRadius={4} />
        </View>
      </View>
    </Card>
  );
}

export function ChapterCardSkeleton() {
  return (
    <Card variant="outlined" className="p-3.5 mb-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          <Skeleton height={36} width={36} borderRadius={8} />
          <View className="flex-1 gap-2">
            <Skeleton height={14} width="70%" borderRadius={4} />
            <Skeleton height={10} width="45%" borderRadius={4} />
          </View>
        </View>
        <Skeleton height={18} width={18} borderRadius={4} />
      </View>
    </Card>
  );
}
