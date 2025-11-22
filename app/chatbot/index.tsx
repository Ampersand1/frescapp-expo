import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const MOCK_PRODUCTS = [
  { name: "Manzana", price: 2000 },
  { name: "Banano", price: 1500 },
  { name: "Zanahoria", price: 1000 },
  { name: "Lechuga", price: 1200 },
];

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "¡Hola! 👋 Soy tu asistente Frescapp. ¿Qué producto deseas buscar hoy?" }
  ]);

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: { from: "user" | "bot"; text: string } = {
      from: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);

    let botReply = "No encontré productos con ese nombre.";

    const matches = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(input.toLowerCase())
    );

    if (matches.length > 0) {
      botReply =
        "Aquí tienes lo que encontré:\n" +
        matches.map((p) => `• ${p.name}: $${p.price}`).join("\n");
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    }, 600);

    setInput("");
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chatbot</Text>
      </View>

      {/* MENSAJES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.from === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },

  header: {
    backgroundColor: "#83c41a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },

  message: {
    marginVertical: 6,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#83c41a",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  messageText: { color: "#000", fontSize: 15 },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#83c41a",
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
  },
});
