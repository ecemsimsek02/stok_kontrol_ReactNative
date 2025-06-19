import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import Layout from "../components/Layout.js";

const RecipeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [disinfectants, setDisinfectants] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    disinfectant: "",
    material: "",
    quantity: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    getTokenAndFetchData();
  }, []);

  const getTokenAndFetchData = async () => {
    const t = await AsyncStorage.getItem("access_token");
    if (!t) {
      Alert.alert("Hata", "Token bulunamadı!");
      return;
    }
    setToken(t);
    fetchAll(t);
  };

  const fetchAll = async (t) => {
    const config = { headers: { Authorization: `Token ${t}` } };
    try {
      const [r, d, m] = await Promise.all([
        axios.get("https://stokkontrol-production.up.railway.app/stocks/api/recipes/", config),
        axios.get("https://stokkontrol-production.up.railway.app/stocks/api/disinfectants/", config),
        axios.get("https://stokkontrol-production.up.railway.app/stocks/api/materials/", config),
      ]);
      setRecipes(r.data);
      setDisinfectants(d.data);
      setMaterials(m.data);
    } catch (err) {
      console.error("Veri alınamadı:", err);
    }
  };

  const handleSubmit = async () => {
    const config = { headers: { Authorization: `Token ${token}` } };
    try {
      if (editingId) {
        await axios.put(
          `https://stokkontrol-production.up.railway.app/stocks/api/recipes/${editingId}/update/`,
          formData,
          config
        );
        setEditingId(null);
      } else {
        await axios.post(
          "https://stokkontrol-production.up.railway.app/stocks/api/recipes/",
          formData,
          config
        );
      }
      setFormData({ disinfectant: "", material: "", quantity: "" });
      fetchAll(token);
    } catch (err) {
      console.error("Kaydetme hatası:", err);
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      disinfectant: recipe.disinfectant,
      material: recipe.material,
      quantity: recipe.quantity.toString(),
    });
  };

  const handleDelete = async (id) => {
    const config = { headers: { Authorization: `Token ${token}` } };
    try {
      await axios.delete(
        `https://stokkontrol-production.up.railway.app/stocks/api/recipes/${id}/delete/`,
        config
      );
      fetchAll(token);
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const getName = (list, id) => list.find((item) => item.id === id)?.name || "";

  return (
    <Layout>
    <View style={styles.container}>
      <Text style={styles.title}>Tarif Yönetimi</Text>

      <Text>Dezenfektan:</Text>
      <Picker
        selectedValue={formData.disinfectant}
        onValueChange={(value) =>
          setFormData({ ...formData, disinfectant: value })
        }
      >
        <Picker.Item label="Seçiniz" value="" />
        {disinfectants.map((d) => (
          <Picker.Item key={d.id} label={d.name} value={d.id} />
        ))}
      </Picker>

      <Text>Malzeme:</Text>
      <Picker
        selectedValue={formData.material}
        onValueChange={(value) =>
          setFormData({ ...formData, material: value })
        }
      >
        <Picker.Item label="Seçiniz" value="" />
        {materials.map((m) => (
          <Picker.Item
            key={m.id}
            label={`${m.name} (${m.unit})`}
            value={m.id}
          />
        ))}
      </Picker>

      <Text>Miktar:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.quantity}
        onChangeText={(value) =>
          setFormData({ ...formData, quantity: value })
        }
      />

      <Button title={editingId ? "Güncelle" : "Ekle"} onPress={handleSubmit} />

      <Text style={styles.subtitle}>Tarif Listesi</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const disinfectantName = getName(disinfectants, item.disinfectant);
          const materialObj = materials.find((m) => m.id === item.material);
          return (
            <View style={styles.card}>
              <Text>
                <Text style={styles.bold}>Dezenfektan:</Text>{" "}
                {disinfectantName}{" "}
                <Text style={styles.bold}>| Malzeme:</Text>{" "}
                {materialObj?.name}{" "}
                <Text style={styles.bold}>| Miktar:</Text>{" "}
                {item.quantity} {materialObj?.unit}
              </Text>
              <View style={styles.actions}>
                <Button title="Düzenle" onPress={() => handleEdit(item)} />
                <Button
                  title="Sil"
                  color="red"
                  onPress={() => handleDelete(item.id)}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    marginVertical: 6,
  },
  bold: { fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default RecipeScreen;
