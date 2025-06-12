import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.0.70:3000/api/trash-points';

interface FormData {
  title: string;
  photoBase64: string | null;
  latitude: number | null;
  longitude: number | null;
  collectionType: 'manual - segunda a sábado' | 'caminhão - segunda, quarta e sexta' | '';
}

export default function AddTrashPointScreen() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    photoBase64: null,
    latitude: null,
    longitude: null,
    collectionType: '',
  });

  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const router = useRouter();

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      // Solicita permissão para acessar a localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        setLoadingLocation(false);
        return;
      }

      // Obtém a localização atual
      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
      Alert.alert('Sucesso', 'Localização capturada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização');
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    try {
      // Solicita permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para acessar galeria negada');
        return;
      }

      // Abre o seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setFormData(prev => ({ 
          ...prev, 
          photoBase64: `data:image/jpeg;base64,${result.assets[0].base64}` 
        }));
        Alert.alert('Sucesso', 'Foto anexada!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar a imagem');
    }
  };

  const takePicture = async () => {
    try {
      // Solicita permissão para usar a câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão para usar câmera negada');
        return;
      }

      // Abre a câmera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setFormData(prev => ({ 
          ...prev, 
          photoBase64: `data:image/jpeg;base64,${result.assets[0].base64}` 
        }));
        Alert.alert('Sucesso', 'Foto capturada!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao capturar a foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção:',
      [
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePicture },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.photoBase64 || formData.latitude === null || !formData.collectionType) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.text();
      if (!response.ok) {
        let errorMessage = `Erro: ${response.status}`;
        try {
          const errorJson = JSON.parse(responseBody);
          errorMessage = errorJson.error || responseBody;
        } catch (e) {
          errorMessage = responseBody || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const json = JSON.parse(responseBody);
      if (json.success) {
        Alert.alert('Sucesso', 'Novo ponto crítico cadastrado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error(json.error || 'Ocorreu um erro desconhecido ao salvar.');
      }
    } catch (error: any) {
      Alert.alert('Erro', `Erro ao Salvar: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Cadastrar Ponto Crítico</Text>

      <Text style={styles.label}>Título do Ponto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Lixo acumulado na esquina"
        value={formData.title}
        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        multiline
      />

      {formData.photoBase64 && (
        <Image source={{ uri: formData.photoBase64 }} style={styles.imagePreview} />
      )}
      
      <TouchableOpacity style={styles.button} onPress={showImageOptions}>
        <Text style={styles.buttonText}>
          {formData.photoBase64 ? 'Trocar Foto' : 'Anexar Foto'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loadingLocation && styles.buttonDisabled]} 
        onPress={getLocation} 
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {formData.latitude !== null ? '✔ Localização Capturada' : 'Obter Localização GPS'}
          </Text>
        )}
      </TouchableOpacity>

      {formData.latitude !== null && (
        <Text style={styles.statusText}>
          Lat: {formData.latitude.toFixed(5)}, Lon: {formData.longitude?.toFixed(5)}
        </Text>
      )}

      <Text style={styles.label}>Tipo de Coleta</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[
            styles.pickerOption,
            formData.collectionType === 'manual - segunda a sábado' && styles.pickerOptionSelected
          ]}
          onPress={() => setFormData(prev => ({ ...prev, collectionType: 'manual - segunda a sábado' }))}
        >
          <Text style={[
            styles.pickerOptionText,
            formData.collectionType === 'manual - segunda a sábado' && styles.pickerOptionTextSelected
          ]}>
            Manual (Seg-Sáb)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.pickerOption,
            formData.collectionType === 'caminhão - segunda, quarta e sexta' && styles.pickerOptionSelected
          ]}
          onPress={() => setFormData(prev => ({ ...prev, collectionType: 'caminhão - segunda, quarta e sexta' }))}
        >
          <Text style={[
            styles.pickerOptionText,
            formData.collectionType === 'caminhão - segunda, quarta e sexta' && styles.pickerOptionTextSelected
          ]}>
            Caminhão (Seg, Qua, Sex)
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Salvar Ponto Crítico</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()} 
        disabled={submitting}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: 15,
    color: '#444',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    minHeight: 50,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  pickerOption: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    flex: 1,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  pickerOptionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
  },
});