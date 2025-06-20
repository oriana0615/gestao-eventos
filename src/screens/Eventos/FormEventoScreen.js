
import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Title, IconButton, ActivityIndicator, HelperText } from 'react-native-paper';
import { MaskedTextInput } from 'react-native-mask-text';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import EventoService from '../../services/EventoService';
import ViaCepService from '../../services/ViaCepService';

export default function FormEventoScreen({ navigation, route }) {
  const eventoAntigo = route.params || {};
  
  // Estados para os campos do formulário
  const [nome, setNome] = useState(eventoAntigo.nome || '');
  const [descricao, setDescricao] = useState(eventoAntigo.descricao || '');
  const [data, setData] = useState(eventoAntigo.data || '');
  const [local, setLocal] = useState(eventoAntigo.local || '');
  const [organizador, setOrganizador] = useState(eventoAntigo.organizador || '');
  const [imagemUri, setImagemUri] = useState(eventoAntigo.imagem_url || null);
  const [cep, setCep] = useState('');
  
  // Estados de controle da UI
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs para controlar o foco dos inputs
  const nomeRef = useRef(null);
  const descricaoRef = useRef(null);
  const organizadorRef = useRef(null);
  const dataRef = useRef(null);


  function validate() {
    const newErrors = {};

    // Validação do Nome
    if (!nome) {
      newErrors.nome = 'O nome do evento é obrigatório.';
    } else if (nome.length < 3) {
      newErrors.nome = 'O nome deve ter pelo menos 3 caracteres.';
    } else if (/\d/.test(nome)) { 
      newErrors.nome = 'O nome do evento não pode conter números.';
    }
    
    // Validação da Descrição
    if (!descricao) newErrors.descricao = 'A descrição é obrigatória.';

    if (!organizador) newErrors.organizador = 'O nome do organizador é obrigatório.';
    if (!local) newErrors.local = 'O local do evento é obrigatório.';
    if (!data) newErrors.data = 'A data é obrigatória.';
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) newErrors.data = 'O formato da data deve ser DD/MM/AAAA.';
    else {
      const parts = data.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const eventDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate.getFullYear() !== year || eventDate.getMonth() !== month || eventDate.getDate() !== day) {
        newErrors.data = 'Data inválida.';
      } else if (eventDate < today) {
        newErrors.data = 'A data não pode ser no passado.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  /**
   * Handler para a seleção de data no calendário.
   */
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setData(formattedDate);
      if (errors.data) setErrors({ ...errors, data: null });
    }
  };

  /**
   * Controla o foco dos campos, garantindo a ordem de preenchimento.
   */
  const handleFocus = (currentField) => {
    if (currentField === 'descricao') {
        if (!nome) {
            Alert.alert('Campo Obrigatório', 'Por favor, preencha o Nome do Evento primeiro.');
            nomeRef.current.focus();
            return false;
        }
    }
    if (currentField === 'organizador') {
        if (!nome) {
            Alert.alert('Campo Obrigatório', 'Por favor, preencha o Nome do Evento primeiro.');
            nomeRef.current.focus();
            return false;
        }
        if (!descricao) {
            Alert.alert('Campo Obrigatório', 'Por favor, preencha a Descrição primeiro.');
            descricaoRef.current.focus();
            return false;
        }
    }
    if (currentField === 'data') {
      if (!organizador) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o Organizador primeiro.');
        organizadorRef.current.focus();
        return false;
      }
    }
    if (currentField === 'cep' || currentField === 'local') {
      if (!data) {
        Alert.alert('Campo Obrigatório', 'Por favor, selecione a Data primeiro.');
        dataRef.current.focus();
        return false;
      }
    }
    return true;
  };
  
  async function escolherImagem() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'É preciso permitir o acesso à galeria.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 1,
    });
    if (!result.canceled) setImagemUri(result.assets[0].uri);
  }

  async function salvar() {
    if (!validate()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os erros indicados no formulário.');
      return;
    }
    setSaving(true);
    const evento = { nome, descricao, data, local, organizador };
    try {
      if (eventoAntigo.id) {
        evento.id = eventoAntigo.id;
        evento.imagem_url = eventoAntigo.imagem_url;
        await EventoService.atualizar(evento, imagemUri);
        Alert.alert('Sucesso', 'Evento alterado!');
      } else {
        await EventoService.salvar(evento, imagemUri);
        Alert.alert('Sucesso', 'Evento cadastrado!');
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o evento.');
    }
    setSaving(false);
  }
  
  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setLoadingCep(true);
    try {
      const endereco = await ViaCepService.getEndereco(cepLimpo);
      if (endereco.erro) Alert.alert('Erro', 'CEP não encontrado.');
      else {
        setLocal(`${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`);
        if (errors.local) setErrors({ ...errors, local: null });
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    }
    setLoadingCep(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>{eventoAntigo.id ? 'Editar Evento' : 'Novo Evento'}</Title>

      {imagemUri && <Image source={{ uri: imagemUri }} style={styles.imagem} />}
      <Button icon="camera" mode="outlined" onPress={escolherImagem} style={styles.input}>
        Selecionar Imagem
      </Button>

      <View>
        <TextInput
          ref={nomeRef}
          label="Nome do Evento *"
          value={nome}
          onChangeText={text => {
            // Lógica revertida: permite digitar qualquer coisa e valida ao salvar
            setNome(text);
            if (errors.nome) setErrors({ ...errors, nome: null });
          }}
          mode="outlined" style={styles.input} error={!!errors.nome}
        />
        <HelperText type="error" visible={!!errors.nome}>{errors.nome}</HelperText>
      </View>
      
      <View>
        <TextInput
          ref={descricaoRef}
          label="Descrição *"
          value={descricao}
          onChangeText={text => {
            setDescricao(text);
            if (errors.descricao) setErrors({...errors, descricao: null});
          }}
          onFocus={() => handleFocus('descricao')}
          mode="outlined" style={styles.input} multiline error={!!errors.descricao}
        />
        <HelperText type="error" visible={!!errors.descricao}>{errors.descricao}</HelperText>
      </View>
      
      <View>
        <TextInput
          ref={organizadorRef}
          label="Organizador *"
          value={organizador}
          onFocus={() => handleFocus('organizador')}
          onChangeText={text => {
            setOrganizador(text);
            if (errors.organizador) setErrors({ ...errors, organizador: null });
          }}
          mode="outlined" style={styles.input} error={!!errors.organizador}
        />
        <HelperText type="error" visible={!!errors.organizador}>{errors.organizador}</HelperText>
      </View>

      <View>
        <TouchableOpacity onPress={() => handleFocus('data') && setShowDatePicker(true)}>
            <TextInput
              ref={dataRef}
              label="Data *" value={data} mode="outlined" editable={false}
              right={<TextInput.Icon icon="calendar" />}
              error={!!errors.data} style={styles.input}
            />
        </TouchableOpacity>
        <HelperText type="error" visible={!!errors.data}>{errors.data}</HelperText>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={data ? new Date(data.split('/')[2], data.split('/')[1] - 1, data.split('/')[0]) : new Date()}
          mode="date" display="default" onChange={onDateChange}
        />
      )}

      <View style={styles.cepContainer}>
        <TextInput
          label="CEP" value={cep} onChangeText={setCep}
          onFocus={() => handleFocus('cep')}
          mode="outlined" style={styles.cepInput} keyboardType="numeric"
          render={(props) => <MaskedTextInput {...props} mask="99999-999" />}
        />
        <IconButton icon="magnify" size={30} onPress={buscarCep} disabled={loadingCep} />
      </View>
      
      <View>
        <TextInput
          label="Local do Evento *" value={local}
          onFocus={() => handleFocus('local')}
          onChangeText={text => {
            setLocal(text);
            if (errors.local) setErrors({ ...errors, local: null });
          }}
          mode="outlined" style={styles.input} multiline error={!!errors.local}
        />
        <HelperText type="error" visible={!!errors.local}>{errors.local}</HelperText>
      </View>
      
      <Button mode="contained" onPress={salvar} style={styles.button} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : 'Salvar'}
      </Button>
      <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button} disabled={saving}>
        Cancelar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', paddingBottom: 40 },
  title: { textAlign: 'center', marginBottom: 20, fontSize: 22 },
  input: { marginBottom: 2 },
  button: { marginTop: 15, paddingVertical: 5 },
  imagem: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, backgroundColor: '#eee' },
  cepContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  cepInput: { flex: 1 },
});

