import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import TrashPointCard from '../src/components/TrashPointerCard'; 

import { useRouter, useFocusEffect } from 'expo-router'; 

const API_URL = 'http://192.168.0.70:3000/api/trash-points';

export default function HomeScreen() {
  const [trashPoints, setTrashPoints] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  
  const router = useRouter(); 


  const fetchTrashPoints = async () => {
    setLoading(true);
    setError(null); 
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const json = await response.json();
      if (json.success) {
        setTrashPoints(json.data);
      } else {
        throw new Error(json.error || 'Erro desconhecido ao buscar dados.'); 
      }
    } catch (err: any) { 
      console.error('Erro ao buscar pontos críticos:', err);
      setError('Não foi possível carregar os pontos críticos. Verifique a conexão da API.');
    } finally {
      setLoading(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrashPoints(); 
      return () => {

      };
    }, []) 
  );


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando pontos críticos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchTrashPoints}>
          <Text style={styles.refreshButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {trashPoints.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noPointsText}>Nenhum ponto crítico cadastrado ainda.</Text>
          <Text style={styles.noPointsText}>Use o botão abaixo para adicionar um!</Text>
        </View>
      ) : (
        <FlatList
          data={trashPoints}
          keyExtractor={(item) => item._id} 
          renderItem={({ item }) => (
            <TrashPointCard
              title={item.title}
              photoUrl={item.photoURL} 
              collectionType={item.collectionType}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add')} 
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noPointsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
});