/*import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="login/index">
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profil" }} />
     
    </Stack>
  );
} */

//import { Slot } from 'expo-router';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '../src/context/AuthContext';
import DrawerLayout from '../src/navigation/DrawerLayout';
import LoginScreen from '../src/views/LoginPage/LoginPage';

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const { userToken } = useContext(AuthContext);

  if (!userToken) {
    return <LoginScreen />;
  }

  return <DrawerLayout />;
}

