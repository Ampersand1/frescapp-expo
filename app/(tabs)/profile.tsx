import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Este "export default" es lo que te faltaba
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Perfil de Usuario</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  text: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  }
});