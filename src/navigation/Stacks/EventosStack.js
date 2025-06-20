import 'react-native-reanimated';

import { createStackNavigator } from '@react-navigation/stack';
import ListaEventosScreen from '../../screens/Eventos/ListaEventosScreen';
import FormEventoScreen from '../../screens/Eventos/FormEventoScreen';
import EventoDetalhesScreen from '../../screens/Eventos/EventoDetalhesScreen'; 

const Stack = createStackNavigator();

export default function EventosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ListaEventos" component={ListaEventosScreen} />
      <Stack.Screen name="FormEvento" component={FormEventoScreen} />
     
      <Stack.Screen name="EventoDetalhes" component={EventoDetalhesScreen} />
    </Stack.Navigator>
  );
}
