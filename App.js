import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from './src/services/NotificationService';

import { AppProvider } from './src/context/AppContext';
import { TDFProvider } from './src/context/TDFContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import TDFHomeScreen from './src/screens/tdf/TDFHomeScreen';
import TDFParticipantsScreen from './src/screens/tdf/TDFParticipantsScreen';
import TDFDrawScreen from './src/screens/tdf/TDFDrawScreen';
import TDFStagesScreen from './src/screens/tdf/TDFStagesScreen';
import TDFLeaderboardScreen from './src/screens/tdf/TDFLeaderboardScreen';
import DiagnosticScreen from './src/screens/DiagnosticScreen';
import SearchingScreen from './src/screens/SearchingScreen';
import ProAlertScreen from './src/screens/ProAlertScreen';
import DepositConfirmedScreen from './src/screens/DepositConfirmedScreen';
import ProDashboardScreen from './src/screens/ProDashboardScreen';
import ProAuthScreen from './src/screens/ProAuthScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import ProProfileScreen from './src/screens/ProProfileScreen';
import ProRequestScreen from './src/screens/ProRequestScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const navigationRef = useRef(null);

  useEffect(() => {
    // Demander les permissions dès le démarrage
    requestNotificationPermissions();

    // Listener : tap sur notification quand app en arrière-plan
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if ((data?.type === 'pro_request' || data?.type === 'pro_reminder') && navigationRef.current) {
        navigationRef.current.navigate('ProRequest', {
          catId: data.catId || 'plomberie',
          urgencyId: data.urgencyId || 'express',
          deposit: data.deposit || 60,
          clientLocation: data.clientLocation || '12 Rue de la Paix, Paris',
        });
      }
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator color="#0891B2" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <TDFProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TDFHome" component={TDFHomeScreen} />
            <Stack.Screen name="TDFParticipants" component={TDFParticipantsScreen} />
            <Stack.Screen name="TDFDraw" component={TDFDrawScreen} />
            <Stack.Screen name="TDFStages" component={TDFStagesScreen} />
            <Stack.Screen name="TDFLeaderboard" component={TDFLeaderboardScreen} />
            <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
            <Stack.Screen name="Searching" component={SearchingScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="ProAlert" component={ProAlertScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="DepositConfirmed" component={DepositConfirmedScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="ProAuth" component={ProAuthScreen} />
            <Stack.Screen name="ProRequest" component={ProRequestScreen} options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="ProProfile" component={ProProfileScreen} />
            <Stack.Screen name="ProDashboard" component={ProDashboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </TDFProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
