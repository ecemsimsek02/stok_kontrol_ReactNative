import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
const RegisterPage = () => {
  console.log("RegisterPage açıldı");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await axios.post("https://stokkontrol-production.up.railway.app/accounts/register/", {
        username,
        password,
      });

      const tokenResponse = await axios.post(
        "https://stokkontrol-production.up.railway.app/api-token-auth/",
        { username, password },
      );

      if (tokenResponse.status === 200) {
        const token = tokenResponse.data.token;
        await AsyncStorage.setItem("access_token", token);
        Alert.alert("Başarılı", "Kayıt ve giriş başarılı.");
        router.replace("/dashboard");
      } else {
        Alert.alert("Hata", "Token alınamadı.");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Hata", "Kayıt başarısız. Belki kullanıcı adı kullanılıyor?");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Kayıt Ol</Text>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Kayıt Ol ve Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default RegisterPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  inner: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
