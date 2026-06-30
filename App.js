import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/shared/LoginScreen';
import HomeFamiliaScreen from './src/screens/familia/HomeFamiliaScreen';
import HomeAcompanhanteScreen from './src/screens/acompanhante/HomeAcompanhanteScreen';
import SolicitarServicoScreen from './src/screens/familia/SolicitarServicoScreen';
import MeusServicosScreen from './src/screens/familia/MeusServicosScreen';
import CompletarCadastroAcompanhanteScreen from './src/screens/acompanhante/CompletarCadastroAcompanhanteScreen';
import CompletarPerfilFamiliaScreen from './src/screens/familia/CompletarPerfilFamiliaScreen';
import ServicoAtivoAcompanhanteScreen from './src/screens/acompanhante/ServicoAtivoAcompanhanteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeFamilia" component={HomeFamiliaScreen} />
        <Stack.Screen name="HomeAcompanhante" component={HomeAcompanhanteScreen} />
        <Stack.Screen name="SolicitarServico" component={SolicitarServicoScreen} />
        <Stack.Screen name="MeusServicos" component={MeusServicosScreen} />
        <Stack.Screen name="CompletarCadastroAcompanhante" component={CompletarCadastroAcompanhanteScreen} />
        <Stack.Screen name="CompletarPerfilFamilia" component={CompletarPerfilFamiliaScreen} />
        <Stack.Screen name="ServicoAtivoAcompanhante" component={ServicoAtivoAcompanhanteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
