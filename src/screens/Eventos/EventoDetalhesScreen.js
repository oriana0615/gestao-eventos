import React from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';


export default function EventoDetalhesScreen({ route, navigation }) {
  // Recebe o objeto 'evento' completo que foi passado pelo QrScannerScreen
  const { evento } = route.params;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Confira este evento: ${evento.nome}!\nData: ${evento.data}\nLocal: ${evento.local}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  if (!evento) {
    return (
      <View style={styles.container}>
        <Title>Nenhum evento para mostrar</Title>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* AQUI MOSTRAMOS A IMAGEM */}
        {evento.imagem_url && (
          <Card.Cover source={{ uri: evento.imagem_url }} />
        )}
        <Card.Content style={styles.content}>
          <Title style={styles.title}>{evento.nome}</Title>
          <Paragraph style={styles.paragraph}>
            {evento.descricao || 'Este evento não tem uma descrição detalhada.'}
          </Paragraph>
          <Paragraph style={styles.details}>
            <Title style={styles.detailTitle}>Data:</Title> {evento.data}
          </Paragraph>
          <Paragraph style={styles.details}>
            <Title style={styles.detailTitle}>Local:</Title> {evento.local}
          </Paragraph>
          <Paragraph style={styles.details}>
            <Title style={styles.detailTitle}>Organizador:</Title> {evento.organizador}
          </Paragraph>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button icon="share-variant" mode="contained" onPress={onShare}>
            Partilhar
          </Button>
          <Button icon="arrow-left" mode="outlined" onPress={() => navigation.goBack()}>
            Voltar
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 30,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  details: {
    fontSize: 16,
    marginBottom: 8,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actions: {
    justifyContent: 'space-around',
    padding: 15,
  },
});
