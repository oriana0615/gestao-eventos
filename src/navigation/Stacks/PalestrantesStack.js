import { createStackNavigator } from '@react-navigation/stack';
import ListaPalestrantesScreen from '../../screens/Palestrantes/ListaPalestrantesScreen';
import FormPalestranteScreen from '../../screens/Palestrantes/FormPalestranteScreen';
import PalestranteDetalhesScreen from '../../screens/Palestrantes/PalestranteDetalhesScreen'; // <-- IMPORTAR

const Stack = createStackNavigator();

export default function PalestrantesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ListaPalestrantes" component={ListaPalestrantesScreen} />
      <Stack.Screen name="FormPalestrante" component={FormPalestranteScreen} />
      <Stack.Screen name="PalestranteDetalhes" component={PalestranteDetalhesScreen} /> 
    </Stack.Navigator>
  );
}
