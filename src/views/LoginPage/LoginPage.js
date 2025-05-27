import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    Dimensions, Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { AuthContext } from '../../context/AuthContext';
//import loginImage from '../../../../assets/images/disinfectant-login.png';
const { width } = Dimensions.get("window");
const LoginPage = () => {
  const { login } = useContext(AuthContext);
  useEffect(() => {
  fetch("http://192.168.99.3:8000/")
    .then(res => console.log("Sunucu çalışıyor!", res.status))
    .catch(err => console.log("Sunucuya erişilemiyor:", err.message));
}, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
  try {
    const response = await axios.post(
      "http://192.168.99.3:8000/api-token-auth/",
      {
        username,
        password,
      }
    );

    const token = response.data.token;
    await AsyncStorage.setItem("access_token", token);
    login(token);

    // PROFİL BİLGİLERİ AL
    const profileResponse = await axios.get(
      "http://192.168.99.3:8000/accounts/api/profiles/",
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    const userProfile = profileResponse.data[0]; // Eğer tek profil varsa
    console.log("Giriş yapan kullanıcının profili:", userProfile);

    if (userProfile) {
      await AsyncStorage.setItem("userInfo", JSON.stringify(userProfile));
    }

    if (!userProfile) {
      router.push("/ProfileScreen");
    } else {
      router.push("/dashboard");
    }
  } catch (err) {
    console.log("Login Error:", err.response?.data || err.message);
    setError("Giriş hatası! Lütfen bilgilerinizi kontrol edin.");
  }
};
  //console.log(require("../../../../assets/images/disinfectant-login.png"));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <Image
              source={require("./disinfectant-login.png")}
              style={styles.image}
            />

            <Text style={styles.title}>Hoş geldiniz!</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>
            {error !== "" && <Text style={styles.error}>{error}</Text>}
            <View style={styles.links}>
              <Text style={{ marginRight: 6 }}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
                <Text style={styles.linkText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default LoginPage;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 6,
    width: "100%",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  links: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
