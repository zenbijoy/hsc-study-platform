import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-[#071018] p-6">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-red-500/15 mb-4">
            <Text className="text-2xl font-black text-red-400">!</Text>
          </View>
          <Text className="text-xl font-black text-white text-center">
            Something went wrong
          </Text>
          <Text className="mt-2 text-xs text-white/50 text-center leading-5 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred while rendering.'}
          </Text>

          <Pressable
            onPress={this.handleReset}
            className="mt-6 rounded-2xl bg-mint px-6 py-3.5 active:opacity-80"
          >
            <Text className="text-xs font-black text-ink">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
