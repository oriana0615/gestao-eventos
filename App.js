
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import DrawerRoutes from './src/navigation/DrawerRoutes';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Modal, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function App() {
  // Estado e permissões da câmera
  const [modalVisible, setModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const qrCodeLock = useRef(false);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permissão necessária", "Você precisa permitir o acesso à câmera para escanear QR Codes");
        return;
      }
      setModalVisible(true);
      qrCodeLock.current = false; 
    } catch (error) {
      console.error("Erro ao abrir câmera:", error);
    }
  }

  function handleQrCodeScanned({ data }) {
    if (data && !qrCodeLock.current) {
      qrCodeLock.current = true;
      console.log("QR Code lido:", data);
      setModalVisible(false);
      
    }
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        {/* Modal da câmera (pode ser acessado de qualquer tela via contexto se necessário) */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={StyleSheet.absoluteFill}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              onBarcodeScanned={handleQrCodeScanned}
            />
            <View style={styles.footer}>
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                Fechar
              </Button>
            </View>
          </View>
        </Modal>
        
        <DrawerRoutes 
          
        />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeButton: {
    width: 200,
  },
});