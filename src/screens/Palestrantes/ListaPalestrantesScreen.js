import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import PalestranteService from '../../services/PalestranteService';

export default function ListaPalestrantesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [palestrantes, setPalestrantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      buscarPalestrantes();
    }
  }, [isFocused]);

  async function buscarPalestrantes() {
    setLoading(true);
    try {
      const lista = await PalestranteService.listar();
      setPalestrantes(lista);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os palestrantes.");
    }
    setLoading(false);
  }

  function confirmarExclusao(id) {
    Alert.alert('Excluir Palestrante', 'Tem a certeza que deseja excluir?', [
      { text: 'Cancelar' },
      { text: 'Sim', onPress: () => removerPalestrante(id) },
    ]);
  }

  async function removerPalestrante(id) {
    try {
      await PalestranteService.remover(id);
      Alert.alert('Sucesso', 'Palestrante excluído!');
      buscarPalestrantes();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível excluir o palestrante.");
    }
  }

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={palestrantes}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum palestrante cadastrado.</Text>}
        renderItem={({ item }) => (
          // Envolve o Card com um TouchableOpacity para torná-lo clicável
          <TouchableOpacity onPress={() => navigation.navigate('PalestranteDetalhes', { palestrante: item })}>
            <Card style={styles.card}>
              <Card.Content>
                {/* Adicionado o rótulo "Nome:" para maior clareza */}
                <Paragraph style={styles.nomeText}>Nome: {item.nome}</Paragraph>
                <Paragraph>Especialidade: {item.especialidade}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button icon="pencil" onPress={() => navigation.navigate('FormPalestrante', item)}>Editar</Button>
                <Button icon="delete" onPress={() => confirmarExclusao(item.id)}>Excluir</Button>
              </Card.Actions>
            </Card>
          </TouchableOpacity>
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('FormPalestrante')}
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
  // Estilo adicionado para o nome do palestrante
  nomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
