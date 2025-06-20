import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Alert, View, Modal, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, ActivityIndicator, HelperText, List, Divider, Text } from 'react-native-paper';
import { MaskedTextInput } from 'react-native-mask-text';
import InscricaoService from '../../services/InscricaoService';
import EventoService from '../../services/EventoService'; // Importar o serviço de eventos

export default function FormInscricaoScreen({ navigation, route }) {
  const itemAntigo = route.params || {};

  // Estados dos campos
  const [nomeCompleto, setNomeCompleto] = useState(itemAntigo.nome_completo || '');
  const [cpf, setCpf] = useState(itemAntigo.cpf || '');
  const [email, setEmail] = useState(itemAntigo.email || '');
  const [telefone, setTelefone] = useState(itemAntigo.telefone || '');
  const [eventoId, setEventoId] = useState(itemAntigo.evento_id || null);
  const [nomeEventoSelecionado, setNomeEventoSelecionado] = useState('');

  // Estados de controle
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalEventosVisivel, setModalEventosVisivel] = useState(false);
  const [listaEventos, setListaEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);

  // Refs para controle de foco
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const cpfRef = useRef(null);

  // Efeito para buscar a lista de eventos ao carregar a tela
  useEffect(() => {
    async function fetchEventos() {
      try {
        const eventos = await EventoService.listar();
        setListaEventos(eventos);
        // Se estiver editando, busca o nome do evento
        if (itemAntigo.evento_id) {
          const eventoAtual = eventos.find(e => e.id === itemAntigo.evento_id);
          if (eventoAtual) {
            setNomeEventoSelecionado(eventoAtual.nome);
          }
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar a lista de eventos.");
      }
      setLoadingEventos(false);
    }
    fetchEventos();
  }, []);

  /**
   * Valida os campos do formulário.
   */
  function validate() {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (!nomeCompleto) newErrors.nomeCompleto = 'O nome completo é obrigatório.';
    if (!email) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Formato de email inválido.';
    }
    if (!cpf) {
      newErrors.cpf = 'O CPF é obrigatório.';
    } else if (cpfLimpo.length !== 11) {
      newErrors.cpf = 'O CPF deve ter 11 dígitos.';
    }
    if (telefone && telefone.replace(/\D/g, '').length < 11) {
        newErrors.telefone = 'O telefone deve ter 11 dígitos (DDD + número).';
    }
    if (!eventoId) newErrors.eventoId = 'É obrigatório selecionar um evento.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  /**
   * Controla o foco sequencial dos campos
   */
  const handleFocus = (currentField) => {
    if (currentField === 'email' && !nomeCompleto) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o Nome Completo primeiro.');
        nomeRef.current.focus();
        return false;
    }
    if (currentField === 'cpf' && !email) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o Email primeiro.');
        emailRef.current.focus();
        return false;
    }
    if (currentField === 'telefone' && !cpf) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o CPF primeiro.');
        cpfRef.current.focus();
        return false;
    }
     if (currentField === 'evento' && !cpf) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o CPF primeiro.');
        cpfRef.current.focus();
        return false;
    }
    return true;
  }


  /**
   * Preenche o campo de evento com a opção selecionada
   */
  const selecionarEvento = (evento) => {
    setEventoId(evento.id);
    setNomeEventoSelecionado(evento.nome);
    setModalEventosVisivel(false);
    if (errors.eventoId) setErrors({...errors, eventoId: null});
  }

  /**
   * Valida e salva os dados da inscrição.
   */
  async function salvar() {
    if (!validate()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os erros indicados.');
      return;
    }

    setSaving(true);
    const inscricao = { nome_completo: nomeCompleto, cpf, email, telefone, evento_id: eventoId };

    try {
      if (itemAntigo.id) {
        await InscricaoService.atualizar({ ...inscricao, id: itemAntigo.id });
        Alert.alert('Sucesso', 'Inscrição atualizada!');
      } else {
        await InscricaoService.salvar(inscricao);
        Alert.alert('Sucesso', 'Inscrição cadastrada!');
      }
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao salvar:', error);
      Alert.alert('Erro', error.message || 'Falha ao salvar inscrição');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>
        {itemAntigo.id ? 'Editar Inscrição' : 'Nova Inscrição'}
      </Title>
      
      <View>
        <TextInput
          ref={nomeRef}
          label="Nome Completo *"
          value={nomeCompleto}
          onChangeText={text => {
            setNomeCompleto(text);
            if (errors.nomeCompleto) setErrors({...errors, nomeCompleto: null});
          }}
          mode="outlined" style={styles.input} error={!!errors.nomeCompleto}
        />
        <HelperText type="error" visible={!!errors.nomeCompleto}>{errors.nomeCompleto}</HelperText>
      </View>

      <View>
        <TextInput
          ref={emailRef}
          label="Email *" value={email}
          onFocus={() => handleFocus('email')}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: null});
          }}
          mode="outlined" style={styles.input} keyboardType="email-address"
          autoCapitalize="none" error={!!errors.email}
        />
        <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>
      </View>

      <View>
        <TextInput
          ref={cpfRef}
          label="CPF *" value={cpf}
          onFocus={() => handleFocus('cpf')}
          onChangeText={text => {
            setCpf(text);
            if (errors.cpf) setErrors({...errors, cpf: null});
          }}
          mode="outlined" style={styles.input} error={!!errors.cpf}
          render={props => (
            <MaskedTextInput {...props} mask="999.999.999-99" />
          )}
        />
        <HelperText type="error" visible={!!errors.cpf}>{errors.cpf}</HelperText>
      </View>

      <View>
        <TextInput
          label="Telefone" value={telefone}
          onFocus={() => handleFocus('telefone')}
          onChangeText={text => {
            setTelefone(text);
            if(errors.telefone) setErrors({...errors, telefone: null});
          }}
          mode="outlined" style={styles.input} error={!!errors.telefone}
          render={props => (
            <MaskedTextInput {...props} mask="(99) 99999-9999" />
          )}
        />
        <HelperText type="error" visible={!!errors.telefone}>{errors.telefone}</HelperText>
      </View>

      <View>
        <TouchableOpacity onPress={() => handleFocus('evento') && setModalEventosVisivel(true)}>
          <TextInput
              label="Evento *"
              value={nomeEventoSelecionado}
              mode="outlined"
              editable={false}
              right={<TextInput.Icon icon="menu-down" />}
              error={!!errors.eventoId}
              style={styles.input}
          />
        </TouchableOpacity>
        <HelperText type="error" visible={!!errors.eventoId}>{errors.eventoId}</HelperText>
      </View>


      <Button
        mode="contained" onPress={salvar} style={styles.button}
        loading={saving} disabled={saving}
      >
        {saving ? 'Salvando...' : 'Salvar'}
      </Button>

      <Button
        mode="outlined" onPress={() => navigation.goBack()}
        style={styles.button}
      >
        Cancelar
      </Button>

      <Modal
        visible={modalEventosVisivel}
        onRequestClose={() => setModalEventosVisivel(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <Title style={styles.modalTitle}>Selecione um Evento</Title>
              {loadingEventos ? <ActivityIndicator/> : 
                <FlatList
                    data={listaEventos}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento encontrado.</Text>}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.nome}
                            description={`ID: ${item.id} - Data: ${item.data}`}
                            onPress={() => selecionarEvento(item)}
                        />
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                />
              }
              <Button onPress={() => setModalEventosVisivel(false)} style={{marginTop: 10}}>Fechar</Button>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
  },
  input: {
    marginBottom: 2,
  },
  button: {
    marginTop: 15,
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%'
  },
  modalTitle: {
      marginBottom: 15,
      textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
    color: '#666'
  }
});
