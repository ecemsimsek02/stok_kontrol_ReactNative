import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Layout from "../components/Layout.js";

const DisinfectantScreen = () => {
  const [disinfectants, setDisinfectants] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    quantity_in_stock: "",
    min_stock_level: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedDisinfectantId, setSelectedDisinfectantId] = useState(null);
  const [productionAmount, setProductionAmount] = useState("");


   useEffect(() => {
    getTokenAndFetch();
  }, []);

  const getTokenAndFetch = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (storedToken) {
        setToken(storedToken);
        fetchDisinfectants(storedToken);
      } else {
        Alert.alert("Hata", "Token bulunamadı.");
      }
    } catch (err) {
      console.error("Token alınamadı:", err);
    }
  };

  const fetchDisinfectants = async (tk) => {
    try {
      const res = await axios.get(
        "https://stokkontrol-production.up.railway.app/stocks/api/disinfectants/",
        {
          headers: { Authorization: `Token ${tk}` },
        }
      );
      setDisinfectants(res.data);
    } catch (err) {
      console.error("Veri alınamadı:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        quantity_in_stock: parseFloat(formData.quantity_in_stock),
        min_stock_level: parseFloat(formData.min_stock_level),
      };

      const url = editingId
        ? `https://stokkontrol-production.up.railway.app/stocks/api/disinfectants/${editingId}/`
        : "https://stokkontrol-production.up.railway.app/stocks/api/disinfectants/";

      const method = editingId ? axios.put : axios.post;

      await method(url, data, {
        headers: { Authorization: `Token ${token}` },
      });

      setFormData({ name: "", quantity_in_stock: "", min_stock_level: "" });
      setEditingId(null);
      fetchDisinfectants(token);
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setFormData({
      name: d.name,
      quantity_in_stock: d.quantity_in_stock.toString(),
      min_stock_level: d.min_stock_level.toString(),
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://stokkontrol-production.up.railway.app/stocks/api/disinfectants/${id}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      fetchDisinfectants(token);
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleProduce = async () => {
    try {
      await axios.post(
        "https://stokkontrol-production.up.railway.app/stocks/api/produce/",
        {
          disinfectant_id: selectedDisinfectantId,
          quantity_to_produce: parseFloat(productionAmount),
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      Alert.alert("Başarılı", "Üretim tamamlandı!");
      fetchDisinfectants(token);
    } catch (err) {
      console.error("Üretim hatası:", err.response?.data || err);
      Alert.alert("Hata", "Üretim başarısız!");
    }
  };

  return (
    <Layout>
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.header}>Dezenfektan Listesi</Text>

      <TextInput
        placeholder="Ad"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Stok Miktarı"
        value={formData.quantity_in_stock}
        onChangeText={(text) =>
          setFormData({ ...formData, quantity_in_stock: text })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Minimum Stok Seviyesi"
        value={formData.min_stock_level}
        onChangeText={(text) =>
          setFormData({ ...formData, min_stock_level: text })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{editingId ? "Güncelle" : "Ekle"}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Kayıtlı Dezenfektanlar</Text>

      <FlatList
        data={disinfectants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>Stok: {item.quantity_in_stock} L</Text>
            <Text>Minimum Seviye: {item.min_stock_level} L</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.link}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.link}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.header}>Dezenfektan Üretimi</Text>

      <Picker
        selectedValue={selectedDisinfectantId}
        onValueChange={(itemValue) => setSelectedDisinfectantId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seçiniz..." value={null} />
        {disinfectants.map((d) => (
          <Picker.Item key={d.id} label={d.name} value={d.id} />
        ))}
      </Picker>

      <TextInput
        placeholder="Üretim Miktarı (Litre)"
        value={productionAmount}
        onChangeText={(text) => setProductionAmount(text)}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (!selectedDisinfectantId || !productionAmount) && styles.buttonDisabled,
        ]}
        onPress={handleProduce}
        disabled={!selectedDisinfectantId || !productionAmount}
      >
        <Text style={styles.buttonText}>Üret</Text>
      </TouchableOpacity>
    </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    alignItems: "center",
    borderRadius: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  link: {
    color: "#007AFF",
  },
  picker: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
});

export default DisinfectantScreen;