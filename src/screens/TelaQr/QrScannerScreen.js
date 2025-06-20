


import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../config/supabaseClient'; // --- LINHA ADICIONADA ---

export default function QrScannerScreen({ navigation, route }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const qrCodeLock = useRef(false);
  const userId = route.params?.userId;

  useEffect(() => {
    const prepareCamera = async () => {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permissão necessária', 'Necessário acesso à câmera para escanear QR Codes');
        navigation.goBack();
      }
    };
    prepareCamera();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (qrCodeLock.current) return;
    qrCodeLock.current = true;
    setLoading(true);

    try {
      console.log('[SCAN] Iniciando processamento do QR:', data);
      
      const eventoId = data.match(/\d+$/)[0];
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError || !evento) throw new Error('Evento não encontrado.');
      
      Alert.alert('Sucesso', `Evento: ${evento.nome}`);

      // Indicamos o caminho completo para a navegação aninhada.
      navigation.navigate('Inicio', {
        screen: 'EventosTab',
        params: {
          screen: 'EventoDetalhes',
          params: { evento: evento },
        },
      });

    } catch (error) {
      console.error('[SCAN_ERROR]', error);
      Alert.alert(
        'QR Inválido', 
        error.message,
        [{ text: 'OK', onPress: () => qrCodeLock.current = false }]
      );
    } finally {
      setLoading(false);
      setTimeout(() => { qrCodeLock.current = false }, 2000);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={qrCodeLock.current ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            style={styles.toggleButton}
          >
            Alternar Câmera
          </Button>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});
