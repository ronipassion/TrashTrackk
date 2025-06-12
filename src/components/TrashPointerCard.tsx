import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface TrashPointCardProps {
  title: string;
  photoUrl: string;
  collectionType: string;
}


const TrashPointCard: React.FC<TrashPointCardProps> = ({ title, photoUrl, collectionType }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Sem Imagem</Text>
        </View>
      )}
      <Text style={styles.collectionType}>Coleta: {collectionType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  noImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontStyle: 'italic',
  },
  collectionType: {
    fontSize: 14,
    color: '#555',
  },
});

export default TrashPointCard;