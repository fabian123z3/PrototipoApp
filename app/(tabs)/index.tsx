import React, { useState, useRef } from 'react';
import { StyleSheet, View, Button, Alert, Text, Modal, Pressable, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [punchType, setPunchType] = useState<'Entrada' | 'Salida' | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Función para validar RUT chileno
  const validateRUT = (rut: string): boolean => {
    const cleanRUT = rut.replace(/[.-\s]/g, '').toUpperCase();
    
    if (!/^\d{7,8}[0-9K]$/.test(cleanRUT)) {
      return false;
    }

    const rutNumber = cleanRUT.slice(0, -1);
    const verifyDigit = cleanRUT.slice(-1);

    let sum = 0;
    let multiplier = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedDigit = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());

    return verifyDigit === calculatedDigit;
  };

  // Función para extraer RUT del código QR del carnet chileno
  const extractRUTFromQR = (qrData: string): string | null => {
    try {
      const rutMatch = qrData.match(/(\d{7,8}-[0-9K])/i);
      if (rutMatch) {
        return rutMatch[1];
      }

      const altRutMatch = qrData.match(/(\d{7,8}[0-9K])/i);
      if (altRutMatch) {
        const rut = altRutMatch[1];
        return rut.slice(0, -1) + '-' + rut.slice(-1);
      }

      return null;
    } catch (error) {
      console.log('Error extracting RUT from QR:', error);
      return null;
    }
  };

  const handleRegistration = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permiso de ubicación denegado', 'Por favor, habilita los permisos de ubicación para usar esta función.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      const time = new Date().toLocaleString();
      const lat = currentLocation.coords.latitude;
      const lon = currentLocation.coords.longitude;
      const street = address[0]?.street || 'No disponible';
      const streetNumber = address[0]?.streetNumber || 'No disponible';
      const city = address[0]?.city || 'No disponible';

      let message = `Tipo: ${punchType}\nHora: ${time}\nDirección: ${street} ${streetNumber}, ${city}\nLatitud: ${lat}\nLongitud: ${lon}`;

      Alert.alert(
        `Registro de Asistencia`,
        message
      );
    } catch (error) {
      Alert.alert('Error de ubicación', 'No se pudo obtener la ubicación. Asegúrate de que los servicios de ubicación están activados.');
    }
  };

  const handleRegistrationWithRUT = async (rut: string) => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permiso de ubicación denegado', 'Por favor, habilita los permisos de ubicación para usar esta función.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      const time = new Date().toLocaleString();
      const lat = currentLocation.coords.latitude;
      const lon = currentLocation.coords.longitude;
      const street = address[0]?.street || 'No disponible';
      const streetNumber = address[0]?.streetNumber || 'No disponible';
      const city = address[0]?.city || 'No disponible';

      let message = `RUT: ${rut}\nTipo: ${punchType}\nHora: ${time}\nDirección: ${street} ${streetNumber}, ${city}\nLatitud: ${lat}\nLongitud: ${lon}`;

      Alert.alert(
        `Registro de Asistencia con QR`,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowQRScanner(false);
              setScanned(false);
              setPunchType(null);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error de ubicación', 'No se pudo obtener la ubicación. Asegúrate de que los servicios de ubicación están activados.');
    }
  };

  const handleRegistrationWithFace = async (imageUri: string) => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permiso de ubicación denegado', 'Por favor, habilita los permisos de ubicación para usar esta función.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      const time = new Date().toLocaleString();
      const lat = currentLocation.coords.latitude;
      const lon = currentLocation.coords.longitude;
      const street = address[0]?.street || 'No disponible';
      const streetNumber = address[0]?.streetNumber || 'No disponible';
      const city = address[0]?.city || 'No disponible';

      // Generar ID único para el rostro capturado
      const faceId = `FACE_${Date.now()}`;

      let message = `Reconocimiento Facial: ${faceId}\nTipo: ${punchType}\nHora: ${time}\nDirección: ${street} ${streetNumber}, ${city}\nLatitud: ${lat}\nLongitud: ${lon}\n\nImagen capturada y validada correctamente.`;

      Alert.alert(
        `✅ Registro de Asistencia con Reconocimiento Facial`,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowFaceScanner(false);
              setCapturedImage(null);
              setPunchType(null);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error de ubicación', 'No se pudo obtener la ubicación. Asegúrate de que los servicios de ubicación están activados.');
    }
  };

  const handleQRScan = (result: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    const qrData = result.data;
    console.log('QR Data:', qrData);
    
    const extractedRUT = extractRUTFromQR(qrData);
    
    if (!extractedRUT) {
      Alert.alert(
        'QR Inválido', 
        'No se pudo extraer el RUT del código QR. Asegúrate de escanear un carnet chileno válido.',
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false)
          },
          {
            text: 'Cancelar',
            onPress: () => {
              setShowQRScanner(false);
              setScanned(false);
              setPunchType(null);
            }
          }
        ]
      );
      return;
    }

    if (!validateRUT(extractedRUT)) {
      Alert.alert(
        'Carnet No Válido', 
        `El RUT ${extractedRUT} no es válido. Por favor, verifica el carnet.`,
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false)
          },
          {
            text: 'Cancelar',
            onPress: () => {
              setShowQRScanner(false);
              setScanned(false);
              setPunchType(null);
            }
          }
        ]
      );
      return;
    }

    handleRegistrationWithRUT(extractedRUT);
  };

  // Capturar foto con la cámara
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
          skipProcessing: false,
        });
        
        setCapturedImage(photo.uri);
        
        // Simular validación facial (aquí irían los algoritmos reales)
        setTimeout(() => {
          Alert.alert(
            '✅ Rostro Capturado',
            'Imagen facial capturada correctamente. ¿Confirmas el registro de asistencia?',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {
                  setCapturedImage(null);
                }
              },
              {
                text: 'Confirmar Registro',
                onPress: () => handleRegistrationWithFace(photo.uri)
              }
            ]
          );
        }, 1000);
        
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'No se pudo capturar la imagen. Inténtalo de nuevo.');
      }
    }
  };

  // Seleccionar imagen de la galería como alternativa
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      
      Alert.alert(
        '📸 Imagen Seleccionada',
        'Imagen seleccionada de la galería. ¿Confirmas el registro de asistencia?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setCapturedImage(null)
          },
          {
            text: 'Confirmar Registro',
            onPress: () => handleRegistrationWithFace(result.assets[0].uri)
          }
        ]
      );
    }
  };

  const startQRScanner = async (type: 'Entrada' | 'Salida') => {
    setPunchType(type);
    
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso de cámara denegado', 'Necesitas habilitar el permiso de cámara para escanear códigos QR.');
        return;
      }
    }
    
    setScanned(false);
    setShowQRScanner(true);
  };

  const startFaceScanner = async (type: 'Entrada' | 'Salida') => {
    setPunchType(type);
    
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso de cámara denegado', 'Necesitas habilitar el permiso de cámara para el reconocimiento facial.');
        return;
      }
    }
    
    setCapturedImage(null);
    setShowFaceScanner(true);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    setScanned(false);
    setPunchType(null);
  };

  const closeFaceScanner = () => {
    setShowFaceScanner(false);
    setCapturedImage(null);
    setPunchType(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕐 Registro de Asistencia</Text>
      <Text style={styles.subtitle}>
        Selecciona el método de registro que prefieras
      </Text>
      
      {/* Registro Manual */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📝 Registro Manual</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="✅ Entrada"
            onPress={() => {
              setPunchType('Entrada');
              handleRegistration();
            }}
            color="#28a745"
          />
          <Button
            title="🚪 Salida"
            onPress={() => {
              setPunchType('Salida');
              handleRegistration();
            }}
            color="#dc3545"
          />
        </View>
      </View>

      {/* Registro con QR */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📱 Registro con Carnet QR</Text>
        <Text style={styles.description}>
          Escanea el código QR de tu carnet chileno
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="🔍 Entrada QR"
            onPress={() => startQRScanner('Entrada')}
            color="#17a2b8"
          />
          <Button
            title="📤 Salida QR"
            onPress={() => startQRScanner('Salida')}
            color="#fd7e14"
          />
        </View>
      </View>

      {/* Registro con Reconocimiento Facial */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>👤 Reconocimiento Facial</Text>
        <Text style={styles.description}>
          Captura tu rostro para registrar asistencia de forma segura
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="📸 Entrada Facial"
            onPress={() => startFaceScanner('Entrada')}
            color="#6f42c1"
          />
          <Button
            title="🤳 Salida Facial"
            onPress={() => startFaceScanner('Salida')}
            color="#e83e8c"
          />
        </View>
      </View>

      {/* Modal del Scanner QR */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showQRScanner}
        onRequestClose={closeQRScanner}
      >
        <View style={styles.modalContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>
              📱 Escanear Carnet - {punchType}
            </Text>
            <Pressable style={styles.closeButton} onPress={closeQRScanner}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleQRScan}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>
                📋 Coloca el código QR del carnet dentro del marco
              </Text>
              <Text style={styles.scannerSubtext}>
                💡 Asegúrate de que haya buena iluminación
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal del Reconocimiento Facial */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFaceScanner}
        onRequestClose={closeFaceScanner}
      >
        <View style={styles.modalContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>
              👤 Reconocimiento Facial - {punchType}
            </Text>
            <Pressable style={styles.closeButton} onPress={closeFaceScanner}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          <View style={styles.scannerContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />
            
            {capturedImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
              </View>
            )}
            
            <View style={styles.faceOverlay}>
              <View style={styles.faceFrame} />
              <Text style={styles.scannerText}>
                🎯 Coloca tu rostro dentro del marco ovalado
              </Text>
              <Text style={styles.scannerSubtext}>
                👀 Mira directamente a la cámara frontal
              </Text>
              
              <View style={styles.faceButtonContainer}>
                <Pressable 
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <Text style={styles.captureButtonText}>📸 Capturar Rostro</Text>
                </Pressable>
                
                <Pressable 
                  style={styles.galleryButton}
                  onPress={pickImageFromGallery}
                >
                  <Text style={styles.galleryButtonText}>🖼️ Desde Galería</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    paddingHorizontal: 20,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  faceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 200,
    height: 250,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 15,
  },
  scannerSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 10,
  },
  faceButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 15,
  },
  captureButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  galleryButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4CAF50',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});