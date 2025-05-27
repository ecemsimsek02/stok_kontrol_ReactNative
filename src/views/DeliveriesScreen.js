import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [formData, setFormData] = useState({
    item: "",
    customer_name: "",
    phone_number: "",
    location: "",
    date: "",
    is_delivered: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [token, setToken] = useState(null);

useEffect(() => {
    const loadTokenAndFetch = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        if (!storedToken) {
          Alert.alert("Hata", "Token bulunamadı!");
          return;
        }
        setToken(storedToken);
        await fetchDeliveries(storedToken);
      } catch (error) {
        console.error("Token alınırken hata:", error);
      }
    };

    loadTokenAndFetch();
  }, []);


 const fetchDeliveries = async (accessToken) => {
    try {
      const res = await axios.get(
        "http://192.168.99.3:8000/store/api/deliveries/",
        {
          headers: {
            Authorization: `Token ${accessToken}`,
          },
        }
      );
      setDeliveries(res.data);
    } catch (err) {
      console.error("Teslimat verisi alınamadı:", err);
    }
  };


  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const headers = {
        headers: {
          Authorization: `Token ${token}`,
        },
      };

      if (editingId) {
        await axios.put(
          `http://192.168.99.3:8000/store/api/deliveries/${editingId}/`,
          formData,
          headers
        );
        setEditingId(null);
      } else {
        await axios.post(
          "http://192.168.99.3:8000/store/api/deliveries/",
          formData,
          headers
        );
      }

      setFormData({
        item: "",
        customer_name: "",
        phone_number: "",
        location: "",
        date: "",
        is_delivered: false,
      });
       fetchDeliveries(token);
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  };

   const handleEdit = (delivery) => {
    setEditingId(delivery.id);
    setFormData({
      item: delivery.item,
      customer_name: delivery.customer_name,
      phone_number: delivery.phone_number,
      location: delivery.location,
      date: delivery.date?.split("T")[0] || "",
      is_delivered: delivery.is_delivered,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://192.168.99.3:8000/store/api/deliveries/${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchDeliveries(token);
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await axios.get(
        `http://192.168.99.3:8000/store/api/deliveries/${id}/mark_as_delivered/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchDeliveries(token);
    } catch (err) {
      console.error("Teslim etme hatası:", err);
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>
        {item.customer_name} - {item.phone_number} ({item.location})
      </Text>
      <Text style={styles.cardSubText}>
        Ürün ID: {item.item} | Tarih: {item.date?.split("T")[0]} |{" "}
        Durum: {item.is_delivered ? "Teslim edildi" : "Bekliyor"}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
        {!item.is_delivered && (
          <TouchableOpacity onPress={() => handleMarkDelivered(item.id)}>
            <MaterialIcons name="check" size={24} color="green" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  if (!token) return null;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Teslimat Yönetimi</Text>

      {["item", "customer_name", "phone_number", "location", "date"].map(
        (field) => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={field.replace("_", " ").toUpperCase()}
            value={formData[field]}
            onChangeText={(text) => handleChange(field, text)}
          />
        )
      )}

      <Button
        title={editingId ? "Güncelle" : "Ekle"}
        onPress={handleSubmit}
        color="#007BFF"
      />

      <Text style={styles.subTitle}>Teslimatlar</Text>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default DeliveriesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  langSwitch: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    marginVertical: 8,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },
  card: {
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  cardText: {
    fontWeight: "bold",
  },
  cardSubText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-around",
  },
});
