import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, Text } from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [punchType, setPunchType] = useState<'Entrada' | 'Salida' | null>(null);
  
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Asistencia</Text>
      <Text style={styles.subtitle}>
        Selecciona para registrar tu entrada o salida.
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Entrada"
          onPress={() => {
            setPunchType('Entrada');
            handleRegistration();
          }}
          color="#28a745" // Color verde
        />
        <Button
          title="Salida"
          onPress={() => {
            setPunchType('Salida');
            handleRegistration();
          }}
          color="#dc3545" // Color rojo
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff', 
  },
  optionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
  },
  scannerText: {
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: 10,
  }
});
