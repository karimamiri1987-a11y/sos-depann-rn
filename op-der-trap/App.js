import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { TDFProvider } from './src/context/TDFContext';

// Op der Trap screens
import MenuScreen               from './src/screens/opderTrap/MenuScreen';
import TableReservationScreen   from './src/screens/opderTrap/TableReservationScreen';
import EvenementsScreen         from './src/screens/opderTrap/EvenementsScreen';
import BowlingReservationScreen from './src/screens/opderTrap/BowlingReservationScreen';
import PronosticsScreen         from './src/screens/opderTrap/PronosticsScreen';
import CarteScreen              from './src/screens/opderTrap/CarteScreen';

// TDF screens (intégrés dans l'onglet Pronostics)
import TDFHomeScreen         from './src/screens/tdf/TDFHomeScreen';
import TDFParticipantsScreen from './src/screens/tdf/TDFParticipantsScreen';
import TDFDrawScreen         from './src/screens/tdf/TDFDrawScreen';
import TDFStagesScreen       from './src/screens/tdf/TDFStagesScreen';
import TDFLeaderboardScreen  from './src/screens/tdf/TDFLeaderboardScreen';

const Tab    = createBottomTabNavigator();
const SMenu  = createNativeStackNavigator();
const SEvt   = createNativeStackNavigator();
const SPron  = createNativeStackNavigator();
const SCarte = createNativeStackNavigator();

const PRIMARY = '#1B3A2D';

function MenuStack() {
  return (
    <SMenu.Navigator screenOptions={{ headerShown: false }}>
      <SMenu.Screen name="MenuMain"         component={MenuScreen} />
      <SMenu.Screen name="TableReservation" component={TableReservationScreen} />
    </SMenu.Navigator>
  );
}

function EvenementsStack() {
  return (
    <SEvt.Navigator screenOptions={{ headerShown: false }}>
      <SEvt.Screen name="EvenementsMain"     component={EvenementsScreen} />
      <SEvt.Screen name="BowlingReservation" component={BowlingReservationScreen} />
    </SEvt.Navigator>
  );
}

function PronosticsStack() {
  return (
    <SPron.Navigator screenOptions={{ headerShown: false }}>
      <SPron.Screen name="PronosticsMain"  component={PronosticsScreen} />
      <SPron.Screen name="TDFHome"         component={TDFHomeScreen} />
      <SPron.Screen name="TDFParticipants" component={TDFParticipantsScreen} />
      <SPron.Screen name="TDFDraw"         component={TDFDrawScreen} />
      <SPron.Screen name="TDFStages"       component={TDFStagesScreen} />
      <SPron.Screen name="TDFLeaderboard"  component={TDFLeaderboardScreen} />
    </SPron.Navigator>
  );
}

function CarteStack() {
  return (
    <SCarte.Navigator screenOptions={{ headerShown: false }}>
      <SCarte.Screen name="CarteMain" component={CarteScreen} />
    </SCarte.Navigator>
  );
}

const TAB_ICONS = {
  'Menu':       { active: 'restaurant',  inactive: 'restaurant-outline' },
  'Événements': { active: 'calendar',    inactive: 'calendar-outline'   },
  'Pronostics': { active: 'trophy',      inactive: 'trophy-outline'     },
  'Carte':      { active: 'book',        inactive: 'book-outline'       },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <TDFProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: PRIMARY,
              tabBarInactiveTintColor: '#9CA3AF',
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopColor: '#E8E0D8',
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingTop: 6,
                height: 62,
              },
              tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
              tabBarIcon: ({ focused, color }) => {
                const icons = TAB_ICONS[route.name];
                const name  = icons ? (focused ? icons.active : icons.inactive) : 'ellipse';
                return <Ionicons name={name} size={22} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Menu"        component={MenuStack}       options={{ title: 'Menu' }} />
            <Tab.Screen name="Événements"  component={EvenementsStack} options={{ title: 'Événements' }} />
            <Tab.Screen name="Pronostics"  component={PronosticsStack} options={{ title: 'Pronostics' }} />
            <Tab.Screen name="Carte"       component={CarteStack}      options={{ title: 'Carte' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </TDFProvider>
    </SafeAreaProvider>
  );
}
