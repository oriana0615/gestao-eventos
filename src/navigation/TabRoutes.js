import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import EventosStack from './Stacks/EventosStack';
import PalestrantesStack from './Stacks/PalestrantesStack';
import InscricoesStack from './Stacks/InscricoesStack';


const Tab = createBottomTabNavigator();

export default function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="EventosTab"
        component={EventosStack}
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="PalestrantesTab"
        component={PalestrantesStack}
        options={{
          title: 'Palestrantes',
          tabBarIcon: ({ color, size }) => <Ionicons name="mic-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="InscricoesTab"
        component={InscricoesStack}
        options={{
          title: 'Inscrições',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
