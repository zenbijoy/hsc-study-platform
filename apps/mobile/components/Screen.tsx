import { PropsWithChildren } from 'react';
import { SafeAreaView, View } from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
}
