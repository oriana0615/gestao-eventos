import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Paragraph, Card, Divider, Text } from 'react-native-paper';


export default function SobreScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.header}>
          <Avatar.Icon size={64} icon="rocket-launch" style={styles.avatar} />
          <Title style={styles.title}>App Gestão de Eventos v2</Title>
          <Paragraph style={styles.subtitle}>Versão 2.0.0</Paragraph>
        </Card.Content>
        <Divider />
        <Card.Content style={styles.content}>
          <Paragraph style={styles.paragraph}>
            Esta é a versão 2.0 do aplicativo, agora com integração a um backend robusto e funcionalidades nativas.
          </Paragraph>
          <Title style={styles.featuresTitle}>Recursos Utilizados:</Title>
          <Text style={styles.featureItem}>• React Navigation (Drawer, Tabs, Stack)</Text>
          <Text style={styles.featureItem}>• React Native Paper (UI Components)</Text>
          <Text style={styles.featureItem}>• Supabase (Backend e Base de Dados)</Text>
          <Text style={styles.featureItem}>• Supabase Storage (Upload de Imagens)</Text>
          <Text style={styles.featureItem}>• Expo Barcode Scanner (Leitor de QR Code)</Text>
          <Text style={styles.featureItem}>• Expo Image Picker (Seleção de Imagem)</Text>
          <Text style={styles.featureItem}>• Axios (Consumo de API Externa - ViaCEP)</Text>
          <Text style={styles.featureItem}>• React Native Mask Text (Máscaras)</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  content: {
    paddingVertical: 20,
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  featuresTitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 10,
  },
});
