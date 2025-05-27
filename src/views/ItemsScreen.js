import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const ItemsScreen =  () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    quantity: "0",
  });
  const [editingItemId, setEditingItemId] = useState(null);

  
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }

      const authHeaders = {
        headers: {
          Authorization: `Token ${token}`,
        },
      };

      await Promise.all([
        fetchItems(authHeaders),
        fetchCategories(authHeaders),
      ]);
    } catch (error) {
      console.error("Başlangıç verileri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchInitialData();
}, []);

  const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
};

 const fetchItems = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get("http://192.168.99.3:8000/store/api/items/", headers);
    setItems(response.data);
  } catch (error) {
    console.error("Item verileri alınamadı:", error);
  }
};
const fetchCategories = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get("http://192.168.99.3:8000/store/api/categories/", headers);
    setCategories(response.data);
  } catch (error) {
    console.error("Category verileri alınamadı:", error);
  }
};


  const handleAddOrUpdateItem = async () => {
  try {
    const headers = await getAuthHeaders();

    if (editingItemId) {
      await axios.put(
        `http://192.168.99.3:8000/store/api/items/${editingItemId}/`,
        newItem,
        headers
      );
    } else {
      await axios.post(
        "http://192.168.99.3:8000/store/api/items/",
        newItem,
        headers
      );
    }

    setNewItem({ name: "", description: "", category: "", quantity: "0" });
    setEditingItemId(null);
    fetchItems(); // burası zaten tokenlı çalışıyorsa sorun olmaz
  } catch (error) {
    console.error("Item ekleme/güncelleme hatası:", error);
  }
};

const handleEditItem = (item) => {
  setNewItem({
    name: item.name,
    description: item.description,
    category: item.category,
    quantity: String(item.quantity),
  });
  setEditingItemId(item.id);
};

const handleDeleteItem = async (id) => {
  try {
    const headers = await getAuthHeaders();

    await axios.delete(
      `http://192.168.99.3:8000/store/api/items/${id}/`,
      headers
    );
    fetchItems();
  } catch (error) {
    console.error("Item silinemedi:", error);
  }
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {editingItemId ? "Item Güncelle" : "Yeni Item"}
      </Text>

      <TextInput
        placeholder="Ad"
        style={styles.input}
        value={newItem.name}
        onChangeText={(text) => setNewItem({ ...newItem, name: text })}
      />
      <TextInput
        placeholder="Açıklama"
        style={styles.input}
        value={newItem.description}
        onChangeText={(text) => setNewItem({ ...newItem, description: text })}
      />

      <Picker
        selectedValue={newItem.category}
        onValueChange={(value) =>
          setNewItem({ ...newItem, category: value })
        }
        style={styles.input}
      >
        <Picker.Item label="Kategori Seçiniz" value="" />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <TextInput
        placeholder="Adet"
        style={styles.input}
        keyboardType="numeric"
        value={newItem.quantity}
        onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
      />

      <Button
        title={editingItemId ? "Güncelle" : "Ekle"}
        onPress={handleAddOrUpdateItem}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>Açıklama: {item.description || "Yok"}</Text>
            <Text>Kategori ID: {item.category}</Text>
            <Text>Adet: {item.quantity}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => handleEditItem(item)}>
                <Text style={styles.editBtn}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                <Text style={styles.deleteBtn}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ItemsScreen;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editBtn: { color: "blue" },
  deleteBtn: { color: "red" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
