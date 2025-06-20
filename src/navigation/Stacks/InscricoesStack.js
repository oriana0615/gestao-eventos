import { createStackNavigator } from '@react-navigation/stack';
import ListaInscricoesScreen from '../../screens/Inscricoes/ListaInscricoesScreen';
import FormInscricaoScreen from '../../screens/Inscricoes/FormInscricaoScreen';

const Stack = createStackNavigator();

export default function InscricoesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ListaInscricoes" component={ListaInscricoesScreen} />
      <Stack.Screen name="FormInscricao" component={FormInscricaoScreen} />
    </Stack.Navigator>
  );
}
