import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import EventoService from '../../services/EventoService';


export default function ListaEventosScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      buscarEventos();
    }
  }, [isFocused]);

  async function buscarEventos() {
    setLoading(true);
    try {
      const listaEventos = await EventoService.listar();
      setEventos(listaEventos);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os eventos.');
      console.error(error);
    }
    setLoading(false);
  }

  async function removerEvento(id) {
    Alert.alert('Confirmar', 'Deseja realmente excluir este evento?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        onPress: async () => {
          try {
            await EventoService.remover(id);
            Alert.alert('Sucesso', 'Evento excluído!');
            buscarEventos();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o evento.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento cadastrado.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imagem_url && <Card.Cover source={{ uri: item.imagem_url }} />}
            <Card.Content>
              <Title>{item.nome}</Title>
              <Paragraph>Data: {item.data}</Paragraph>
              <Paragraph>Local: {item.local}</Paragraph>
              <Paragraph>Organizador: {item.organizador}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button icon="pencil" onPress={() => navigation.navigate('FormEvento', item)}>Editar</Button>
              <Button icon="delete" onPress={() => removerEvento(item.id)}>Excluir</Button>
            </Card.Actions>
          </Card>
        )}
      />
      <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('FormEvento')} />
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
