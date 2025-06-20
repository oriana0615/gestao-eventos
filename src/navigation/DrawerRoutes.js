import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper'; 
import TabRoutes from './TabRoutes';
import SobreScreen from '../screens/Sobre/SobreScreen';
import QrScannerScreen from '../screens/TelaQr/QrScannerScreen';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'center',
        headerRight: () => (
          <Button 
            mode="text"
            icon="qrcode-scan"
            onPress={() => navigation.navigate('QrScanner')}
            style={{ marginRight: 15 }}
            labelStyle={{ fontSize: 12 }}
            compact
          >
            Scan
          </Button>
        ),
      })}
    >
      <Drawer.Screen
        name="Inicio"
        component={TabRoutes}
        options={{
          title: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Sobre"
        component={SobreScreen}
        options={{
          title: 'Sobre a App',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen 
        name="QrScanner" 
        component={QrScannerScreen}
        options={{
          title: 'Escanear QR Code',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}