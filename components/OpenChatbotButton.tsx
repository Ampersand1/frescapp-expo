import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const OpenChatbotButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/chatbot')}
    >
      <Text style={styles.text}>💬</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#83c41a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1000,
  },
  text: {
    fontSize: 28,
  },
});

export default OpenChatbotButton;
