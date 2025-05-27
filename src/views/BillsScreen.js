import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const BillsScreen = () => {
  const [bills, setBills] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    institution_name: "",
    phone_number: "",
    email: "",
    address: "",
    description: "",
    payment_details: "",
    amount: "",
    status: false,
  });

  const [token, setToken] = useState(null);

  useEffect(() => {
    const getTokenAndFetch = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        if (!storedToken) {
          Alert.alert("Hata", "Token bulunamadı.");
          return;
        }
        setToken(storedToken);
        fetchBills(storedToken);
      } catch (err) {
        console.error("Token alınamadı:", err);
      }
    };
    getTokenAndFetch();
  }, []);

  const fetchBills = async (tk) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://192.168.99.3:8000/bills/api/bills/",
        {
          headers: {
            Authorization: `Token ${tk}`,
          },
        }
      );
      setBills(response.data);
    } catch (error) {
      console.error("Fatura verileri alınamadı:", error);
      Alert.alert("Hata", "Fatura verileri alınamadı.");
    }
    setLoading(false);
  };

  const openModal = (bill = null) => {
    setEditingBill(bill);
    if (bill) {
      setFormData({ ...bill });
    } else {
      setFormData({
        institution_name: "",
        phone_number: "",
        email: "",
        address: "",
        description: "",
        payment_details: "",
        amount: "",
        status: false,
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBill(null);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Hata", "Token bulunamadı.");
      return;
    }

    try {
      if (editingBill) {
        await axios.put(
          `http://192.168.99.3:8000/bills/api/bills/${editingBill.id}/`,
          formData,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
      } else {
        await axios.post("http://192.168.99.3:8000/bills/api/bills/", formData, {
          headers: { Authorization: `Token ${token}` },
        });
      }
      fetchBills(token);
      closeModal();
    } catch (error) {
      console.error("Fatura kaydetme hatası:", error);
      Alert.alert("Hata", "Fatura kaydedilemedi.");
    }
  };

  const handleDelete = async (id) => {
    if (!token) {
      Alert.alert("Hata", "Token bulunamadı.");
      return;
    }
    try {
      await axios.delete(`http://192.168.99.3:8000/bills/api/bills/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchBills(token);
    } catch (error) {
      console.error("Fatura silme hatası:", error);
      Alert.alert("Hata", "Fatura silinemedi.");
    }
  };

  const renderBillItem = ({ item }) => (
    <View style={styles.billCard}>
      <Text style={styles.title}>{item.institution_name}</Text>
      <Text>{item.description}</Text>
      <Text>Miktar: {item.amount}</Text>
      <Text>Durum: {item.status ? "Ödendi" : "Ödenmedi"}</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
          <Text style={styles.btnText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Silme Onayı",
              "Faturayı silmek istediğinize emin misiniz?",
              [
                { text: "İptal", style: "cancel" },
                { text: "Sil", onPress: () => handleDelete(item.id) },
              ]
            )
          }
          style={styles.deleteBtn}
        >
          <Text style={styles.btnText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Faturalar</Text>
      <Button title="Fatura Ekle" onPress={() => openModal()} />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBillItem}
          style={{ marginTop: 16 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingBill ? "Fatura Düzenle" : "Fatura Ekle"}</Text>

          <ScrollView style={{ width: "100%" }}>
            {[
              "institution_name",
              "phone_number",
              "email",
              "address",
              "description",
              "payment_details",
              "amount",
            ].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field.replace(/_/g, " ").toUpperCase()}
                value={formData[field]?.toString()}
                onChangeText={(text) => handleChange(field, text)}
                keyboardType={field === "amount" || field === "phone_number" ? "numeric" : "default"}
                autoCapitalize="none"
              />
            ))}

            <View style={styles.switchContainer}>
              <Text>Ödendi</Text>
              <Switch
                value={formData.status}
                onValueChange={(val) => handleChange("status", val)}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button title="İptal" onPress={closeModal} />
              <Button title={editingBill ? "Güncelle" : "Ekle"} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default BillsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  billCard: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  editBtn: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
  },
  btnText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
