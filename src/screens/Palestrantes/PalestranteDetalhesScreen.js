import React from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';

export default function PalestranteDetalhesScreen({ route, navigation }) {
  // Recebe o objeto 'palestrante' passado pela navegação
  const { palestrante } = route.params;

  if (!palestrante) {
    return (
      <View style={styles.container}>
        <Title>Nenhum palestrante para mostrar</Title>
      </View>
    );
  }
  
  // Função para compartilhar os detalhes do palestrante
  const onShare = async () => {
    try {
      await Share.share({
        message: `Confira o palestrante: ${palestrante.nome}!\nEspecialidade: ${palestrante.especialidade}.`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Title style={styles.title}>{palestrante.nome}</Title>
          <Paragraph style={styles.detailItem}>
            <Title style={styles.detailTitle}>Especialidade:</Title> {palestrante.especialidade}
          </Paragraph>

          <Divider style={styles.divider} />

          <Title style={styles.bioTitle}>Biografia</Title>
          <Paragraph style={styles.paragraph}>
            {palestrante.biografia || 'Nenhuma biografia fornecida.'}
          </Paragraph>

          <Divider style={styles.divider} />
          
          <Paragraph style={styles.detailItem}>
            <Title style={styles.detailTitle}>Email:</Title> {palestrante.email}
          </Paragraph>
          <Paragraph style={styles.detailItem}>
            <Title style={styles.detailTitle}>Telefone:</Title> {palestrante.telefone || 'Não informado'}
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
    margin: 15,
    elevation: 4,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 32,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  actions: {
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 10,
  },
  divider: {
    marginVertical: 15,
  }
});
