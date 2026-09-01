import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  library: 'library-outline',
  formulas: 'flash-outline',
  practice: 'school-outline',
  profile: 'person-outline',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0B151E', borderTopColor: 'rgba(255,255,255,0.08)', height: 70, paddingTop: 7 },
        tabBarActiveTintColor: '#57E0B7',
        tabBarInactiveTintColor: '#667582',
        tabBarLabelStyle: { fontSize: 11, paddingBottom: 7 },
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] ?? 'ellipse-outline'} color={color} size={size} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="formulas" options={{ title: 'Formula' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
