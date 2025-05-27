import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";

import {
    Alert,
    Button,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    amount: "",
    date: "",
  });
  const [token, setToken] = useState(null);

  const API_URL = "http://192.168.99.3:8000/cash/expenses/";

  useEffect(() => {
    const getTokenAndFetch = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (!storedToken) {
        Alert.alert("Hata", "Token bulunamadı!");
        return;
      }
      setToken(storedToken);
      fetchExpenses(storedToken);
    };
    getTokenAndFetch();
  }, []);

  const fetchExpenses = async (storedToken) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Token ${storedToken}`,
        },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error("Expense fetch error:", error);
      Alert.alert("Hata", "Harcamalar getirilemedi.");
    }
  };

  const openModalForNew = () => {
    setFormData({ id: null, name: "", amount: "", date: "" });
    setModalVisible(true);
  };

  const openModalForEdit = (expense) => {
    setFormData({
      id: expense.id,
      name: expense.name,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setModalVisible(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount || !formData.date) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      if (formData.id) {
        // Update
        await axios.put(`${API_URL}${formData.id}/`, formData, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } else {
        // Create
        await axios.post(API_URL, formData, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      }
      fetchExpenses(token);
      setModalVisible(false);
      setFormData({ id: null, name: "", amount: "", date: "" });
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Hata", "İşlem başarısız oldu.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      t("Delete Expense"),
      t("Are you sure you want to delete this expense?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}${id}/`, {
                headers: {
                  Authorization: `Token ${token}`,
                },
              });
              fetchExpenses(token);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Hata", "Silme işlemi başarısız oldu.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>


      <Button title="Add Expense" onPress={openModalForNew} />

      <ScrollView style={styles.listContainer}>
        {expenses.map((exp) => (
          <View key={exp.id} style={styles.card}>
            <Text style={styles.cardTitle}>{exp.name}</Text>
            <Text>
              Amount: {exp.amount} TL
            </Text>
            <Text>
              Date: {exp.date}
            </Text>
            <View style={styles.cardButtons}>
              <TouchableOpacity onPress={() => openModalForEdit(exp)} style={styles.editBtn}>
                <Text style={styles.buttonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(exp.id)} style={styles.deleteBtn}>
                <Text style={styles.buttonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {formData.id ? "Update Expense" : "Add Expense"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Expense Name"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(text) => handleChange("amount", text)}
            />
            <TextInput
              style={styles.input}
              placeholder= "Date"
              value={formData.date}
              onChangeText={(text) => handleChange("date", text)}
            />

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button
                title={formData.id ? "Update": "Add"}
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExpensePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  listContainer: {
    marginTop: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  editBtn: {
    marginRight: 16,
  },
  deleteBtn: {},
  buttonText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
