import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import InscricaoService from '../../services/InscricaoService';

export default function ListaInscricoesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      buscarInscricoes();
    }
  }, [isFocused]);

  async function buscarInscricoes() {
    setLoading(true);
    try {
      const lista = await InscricaoService.listar();
      setInscricoes(lista);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as inscrições.");
    }
    setLoading(false);
  }
  
  function confirmarExclusao(id) {
    Alert.alert('Excluir Inscrição', 'Tem a certeza que deseja excluir?', [
      { text: 'Cancelar' },
      { text: 'Sim', onPress: () => removerInscricao(id) },
    ]);
  }

  async function removerInscricao(id) {
    try {
      await InscricaoService.remover(id);
      Alert.alert('Sucesso', 'Inscrição excluída!');
      buscarInscricoes();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível excluir a inscrição.");
    }
  }

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={inscricoes}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma inscrição realizada.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.nome_completo}</Title>
              <Paragraph>CPF: {item.cpf}</Paragraph>
              <Paragraph>Email: {item.email}</Paragraph>
              <Paragraph>Telefone: {item.telefone}</Paragraph>
              <Paragraph>Evento ID: {item.evento_id || 'Não especificado'}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button icon="pencil" onPress={() => navigation.navigate('FormInscricao', item)}>Editar</Button>
              <Button icon="delete" onPress={() => confirmarExclusao(item.id)}>Excluir</Button>
            </Card.Actions>
          </Card>
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('FormInscricao')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginVertical: 8, elevation: 4 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});
