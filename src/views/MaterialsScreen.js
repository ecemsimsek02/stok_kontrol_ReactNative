import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MaterialsScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    quantity_in_stock: "",
    unit: "",
    min_stock_level: "",
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadTokenAndFetch = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        Alert.alert("Hata", "Token bulunamadı!");
        return;
      }
      setToken(accessToken);
      fetchMaterials(accessToken);
    };
    loadTokenAndFetch();
  }, []);

  const authHeaders = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  const fetchMaterials = async (accessToken = token) => {
    try {
      const res = await axios.get(
        "https://stokkontrol-production.up.railway.app/stocks/api/materials/",
        {
          headers: {
            Authorization: `Token ${accessToken}`,
          },
        }
      );
      setMaterials(res.data);
    } catch (err) {
      console.error("Material verisi alınamadı:", err);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        quantity_in_stock: parseFloat(formData.quantity_in_stock),
        min_stock_level:
          formData.min_stock_level !== ""
            ? parseFloat(formData.min_stock_level)
            : null,
      };

      if (editingMaterial) {
        await axios.put(
          `https://stokkontrol-production.up.railway.app/stocks/api/materials/${editingMaterial.id}/`,
          payload,
          authHeaders
        );
      } else {
        await axios.post(
          "https://stokkontrol-production.up.railway.app/stocks/api/materials/",
          payload,
          authHeaders
        );
      }

      setModalVisible(false);
      setFormData({
        name: "",
        quantity_in_stock: "",
        unit: "",
        min_stock_level: "",
      });
      setEditingMaterial(null);
      fetchMaterials();
    } catch (err) {
      console.error("İşlem hatası:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://stokkontrol-production.up.railway.app/stocks/api/materials/${id}/`,
        authHeaders
      );
      fetchMaterials();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      quantity_in_stock: material.quantity_in_stock.toString(),
      unit: material.unit,
      min_stock_level: material.min_stock_level?.toString() || "",
    });
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Miktar: {item.quantity_in_stock}</Text>
      <Text>Birim: {item.unit}</Text>
      <Text>Min Stok: {item.min_stock_level ?? "N/A"}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <MaterialIcons name="edit" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingMaterial(null);
          setFormData({
            name: "",
            quantity_in_stock: "",
            unit: "",
            min_stock_level: "",
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Malzeme Ekle</Text>
      </TouchableOpacity>

      <FlatList
        data={materials}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingMaterial ? "Malzeme Güncelle" : "Yeni Malzeme"}
          </Text>
          {["name", "quantity_in_stock", "unit", "min_stock_level"].map(
            (field) => (
              <TextInput
                key={field}
                placeholder={field.replace("_", " ")}
                value={formData[field]}
                onChangeText={(value) => handleChange(field, value)}
                style={styles.input}
                keyboardType={
                  field.includes("quantity") || field === "min_stock_level"
                    ? "numeric"
                    : "default"
                }
              />
            )
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.saveButton}>
                {editingMaterial ? "Güncelle" : "Ekle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MaterialsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButton: {
    color: "red",
    fontWeight: "bold",
  },
  saveButton: {
    color: "green",
    fontWeight: "bold",
  },
});
