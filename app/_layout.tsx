// app/_layout.tsx
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native'; // Importe View e StyleSheet se precisar de estilo global

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff', // Cor de fundo do cabeçalho
        },
        headerTintColor: '#fff', // Cor do texto e ícones do cabeçalho
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Adiciona um padding inferior para evitar que o conteúdo (e o botão)
        // fique muito colado na borda inferior do dispositivo.
        // Isso pode ser ajustado conforme a necessidade.
        contentStyle: { paddingBottom: 20 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'TrashTracker',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Novo Ponto Crítico',
          headerShown: true,
        }}
      />
    </Stack>
  );
}