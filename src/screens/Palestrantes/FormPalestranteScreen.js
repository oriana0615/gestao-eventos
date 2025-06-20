import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Alert, View, FlatList, TouchableOpacity, Text, Modal } from 'react-native';
import { TextInput, Button, Title, ActivityIndicator, HelperText, Divider, List } from 'react-native-paper';
import { MaskedTextInput } from 'react-native-mask-text';
import PalestranteService from '../../services/PalestranteService';
// Importa a lista de especialidades do novo arquivo de dados
import { exemplosEspecialidades } from '../../data/exemplosData';

export default function FormPalestranteScreen({ navigation, route }) {
  const itemAntigo = route.params || {};
  
  // Estados dos campos do formulário
  const [nome, setNome] = useState(itemAntigo.nome || '');
  const [especialidade, setEspecialidade] = useState(itemAntigo.especialidade || '');
  const [email, setEmail] = useState(itemAntigo.email || '');
  const [biografia, setBiografia] = useState(itemAntigo.biografia || ''); // NOVO CAMPO
  const [telefone, setTelefone] = useState(itemAntigo.telefone || '');

  // Estados de controlo
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalEspecialidadeVisivel, setModalEspecialidadeVisivel] = useState(false);

  // Refs para controlar o foco
  const nomeRef = useRef(null);
  const especialidadeRef = useRef(null);
  const emailRef = useRef(null);
  const biografiaRef = useRef(null); // NOVO REF

  /**
   * Preenche o campo de especialidade com a opção selecionada na lista.
   */
  const selecionarEspecialidade = (item) => {
    setEspecialidade(item);
    setModalEspecialidadeVisivel(false);
    if (errors.especialidade) setErrors({ ...errors, especialidade: null });
  };

  /**
   * Valida os campos do formulário.
   * @returns {boolean} - True se válido, false em caso contrário.
   */
  function validate() {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nome) {
      newErrors.nome = 'O nome é obrigatório.';
    } else if (/\d/.test(nome)) {
      newErrors.nome = 'O nome não pode conter números.';
    }
    if (!especialidade) newErrors.especialidade = 'A especialidade é obrigatória.';
    if (!email) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Formato de email inválido.';
    }
    // VALIDAÇÃO DA BIOGRAFIA
    if (!biografia) {
        newErrors.biografia = 'A biografia é obrigatória.';
    } else if (biografia.length < 10) {
        newErrors.biografia = 'A biografia deve ter pelo menos 10 caracteres.';
    }

    // Validação do Telefone (se preenchido)
    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, ''); // Remove a máscara
      if (telefoneLimpo.length > 0 && telefoneLimpo.length < 11) {
        newErrors.telefone = 'O telefone deve ter 11 dígitos (DDD + número).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Controla o foco sequencial dos campos
   */
  const handleFocus = (currentField) => {
    if (currentField === 'especialidade' && !nome) {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o Nome primeiro.');
      nomeRef.current.focus();
      return false;
    }
    if (currentField === 'email' && !especialidade) {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha a Especialidade primeiro.');
      especialidadeRef.current.focus();
      return false;
    }
    // AJUSTE NA ORDEM DE FOCO
    if (currentField === 'biografia' && !email) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha o Email primeiro.');
        emailRef.current.focus();
        return false;
    }
    if (currentField === 'telefone' && !biografia) {
        Alert.alert('Campo Obrigatório', 'Por favor, preencha a Biografia primeiro.');
        biografiaRef.current.focus();
        return false;
    }
    return true;
  }

  /**
   * Valida e guarda os dados do palestrante.
   */
  async function salvar() {
    if (!validate()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os erros indicados.');
      return;
    }
    
    setSaving(true);
    const palestrante = { nome, especialidade, email, biografia, telefone }; // BIOGRAFIA ADICIONADA AQUI

    try {
      if (itemAntigo.id) {
        palestrante.id = itemAntigo.id;
        await PalestranteService.atualizar(palestrante);
        Alert.alert('Sucesso', 'Palestrante atualizado!');
      } else {
        await PalestranteService.salvar(palestrante);
        Alert.alert('Sucesso', 'Palestrante cadastrado!');
      }
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Ocorreu um erro ao guardar o palestrante.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>
        {itemAntigo.id ? 'Editar Palestrante' : 'Novo Palestrante'}
      </Title>
      
      {/* Campos de Inserção Manual */}
      <View>
        <TextInput
          ref={nomeRef}
          label="Nome *" 
          value={nome} 
          onChangeText={text => {
            setNome(text);
            if (errors.nome) setErrors({...errors, nome: null});
          }} 
          mode="outlined" 
          style={styles.input}
          error={!!errors.nome}
        />
        <HelperText type="error" visible={!!errors.nome}>{errors.nome}</HelperText>
      </View>

      <View>
        <TextInput
          ref={especialidadeRef}
          label="Especialidade *" 
          value={especialidade}
          onFocus={() => handleFocus('especialidade')}
          onChangeText={text => {
            setEspecialidade(text);
            if (errors.especialidade) setErrors({...errors, especialidade: null});
          }} 
          mode="outlined" 
          style={styles.input}
          error={!!errors.especialidade}
          right={<TextInput.Icon icon="menu-down" onPress={() => setModalEspecialidadeVisivel(true)} />}
        />
        <HelperText type="error" visible={!!errors.especialidade}>{errors.especialidade}</HelperText>
      </View>

      <View>
        <TextInput
          ref={emailRef}
          label="Email *" 
          value={email}
          onFocus={() => handleFocus('email')}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: null});
          }} 
          mode="outlined" 
          style={styles.input} 
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!errors.email}
        />
        <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>
      </View>

      {/* NOVO CAMPO DE BIOGRAFIA */}
      <View>
        <TextInput
          ref={biografiaRef}
          label="Biografia *"
          value={biografia}
          onFocus={() => handleFocus('biografia')}
          onChangeText={text => {
            setBiografia(text);
            if (errors.biografia) setErrors({...errors, biografia: null});
          }}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!errors.biografia}
        />
        <HelperText type="error" visible={!!errors.biografia}>{errors.biografia}</HelperText>
      </View>


      <View>
        <TextInput 
          label="Telefone" 
          value={telefone}
          onFocus={() => handleFocus('telefone')}
          onChangeText={text => {
            setTelefone(text);
            if (errors.telefone) setErrors({...errors, telefone: null});
          }} 
          mode="outlined" 
          style={styles.input}
          error={!!errors.telefone}
          render={props => (
            <MaskedTextInput {...props} mask="(99) 99999-9999" />
          )}
        />
        <HelperText type="error" visible={!!errors.telefone}>{errors.telefone}</HelperText>
      </View>

      <Button 
        mode="contained" 
        onPress={salvar} 
        style={styles.button} 
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : 'Guardar'}
      </Button>
      <Button 
        mode="outlined" 
        onPress={() => navigation.goBack()} 
        style={styles.button} 
        disabled={saving}
      >
        Cancelar
      </Button>

      {/* Modal para selecionar especialidade */}
      <Modal
        visible={modalEspecialidadeVisivel}
        onRequestClose={() => setModalEspecialidadeVisivel(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Title style={styles.modalTitle}>Selecione uma Especialidade</Title>
                <FlatList
                    data={exemplosEspecialidades}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item}
                            onPress={() => selecionarEspecialidade(item)}
                        />
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                />
                <Button onPress={() => setModalEspecialidadeVisivel(false)} style={{marginTop: 10}}>Fechar</Button>
            </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 20, 
    fontSize: 22 
  },
  input: { 
    marginBottom: 2 
  },
  button: { 
    marginTop: 15, 
    paddingVertical: 5 
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
    width: '80%',
    maxHeight: '70%'
  },
  modalTitle: {
      marginBottom: 15,
      textAlign: 'center'
  }
});
