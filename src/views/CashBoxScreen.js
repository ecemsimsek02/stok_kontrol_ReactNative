// src/views/cashbox/CashboxPage.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Layout from "../components/Layout.js";

const getUserRole = async () => {
  try {
    const userInfo = await AsyncStorage.getItem("userInfo");
    console.log("userInfo:", userInfo);
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.role || null;
    }
  } catch (e) {
    console.error("userInfo çözümlenemedi:", e);
  }
  return null;
};

const CashboxPage = () => {

  const [transactions, setTransactions] = useState([]);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [editRegisterModalVisible, setEditRegisterModalVisible] = useState(false);

  const [editingRegister, setEditingRegister] = useState(null);
  const [newRegisterDate, setNewRegisterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    cash_register: "",
    amount: "",
    transaction_type: "IN",
    description: "",
  });

  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  const API_URL = "http://192.168.1.33:8000/cash/transactions/";
  const REGISTER_API = "http://192.168.1.33:8000/cash/cash_registers/";

useEffect(() => {
  const loadData = async () => {
    const tkn = await AsyncStorage.getItem("access_token");
    const r = await getUserRole();
    console.log("TOKEN:", tkn);
    console.log("ROLE:", r);
    setToken(tkn);
    setRole(r);
    if (tkn) {
      fetchTransactions(tkn);
      fetchCashRegisters(tkn);
    }
  };
  loadData();
}, []);

  const fetchTransactions = async (tkn) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Token ${tkn}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Transaction verisi alınamadı", error);
    }
  };

  const fetchCashRegisters = async (tkn) => {
    try {
      const response = await axios.get(REGISTER_API, {
        headers: { Authorization: `Token ${tkn}` },
      });
      setCashRegisters(response.data);
      if (response.data.length > 0 && !formData.cash_register) {
        setFormData((prev) => ({
          ...prev,
          cash_register: response.data[0].id,
        }));
      }
    } catch (error) {
      console.error("Cash register verisi alınamadı", error);
    }
  };

  const handleDeleteRegister = async (id) => {
    try {
      await axios.delete(`${REGISTER_API}${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchCashRegisters(token);
      fetchTransactions(token);
    } catch (error) {
      console.error("Kayıt silinemedi:", error);
      Alert.alert("Hata", "Kayıt silinemedi");
    }
  };

  const handleEditRegister = (reg) => {
    setEditingRegister(reg);
    setEditRegisterModalVisible(true);
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchTransactions(token);
      fetchCashRegisters(token);
    } catch (error) {
      console.error("Silme işlemi başarısız", error);
      Alert.alert("Hata", "Silme işlemi başarısız");
    }
  };

  const handleEditTransaction = (tx) => {
    setFormData({
      id: tx.id,
      cash_register: tx.cash_register,
      amount: tx.amount.toString(),
      transaction_type: tx.transaction_type,
      description: tx.description,
    });
    setFormModalVisible(true);
  };

  const handleSubmit = async () => {
    const data = {
      cash_register: formData.cash_register,
      amount: parseFloat(formData.amount),
      transaction_type: formData.transaction_type,
      description: formData.description,
    };

    try {
      if (formData.id) {
        await axios.put(`${API_URL}${formData.id}/`, data, {
          headers: { Authorization: `Token ${token}` },
        });
      } else {
        await axios.post(API_URL, data, {
          headers: { Authorization: `Token ${token}` },
        });
      }
      fetchTransactions(token);
      fetchCashRegisters(token);
      setFormModalVisible(false);
      setFormData({
        id: null,
        cash_register: cashRegisters[0]?.id || "",
        amount: "",
        transaction_type: "IN",
        description: "",
      });
    } catch (error) {
      console.error("Kayıt işlemi başarısız", error);
      Alert.alert("Hata", "Kayıt işlemi başarısız");
    }
  };

  const handleAddRegister = async () => {
    try {
      await axios.post(
        REGISTER_API,
        { date: newRegisterDate.toISOString().split("T")[0] },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setRegisterModalVisible(false);
      fetchCashRegisters(token);
    } catch (error) {
      console.error("Cash register eklenemedi:", error);
      Alert.alert("Hata", "Cash register eklenemedi");
    }
  };

  const handleUpdateRegister = async () => {
    try {
      await axios.put(`${REGISTER_API}${editingRegister.id}/`, editingRegister, {
        headers: { Authorization: `Token ${token}` },
      });
      setEditRegisterModalVisible(false);
      fetchCashRegisters(token);
    } catch (error) {
      console.error("Cash register güncellenemedi", error);
      Alert.alert("Hata", "Cash register güncellenemedi");
    }
  };



  return (
    <Layout>
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Cash Transactions</Text>

      <Button
        title="Add Transactions"
        onPress={() => setFormModalVisible(true)}
      />

      {/* Transactions List */}
      <FlatList
        style={{ marginTop: 16 }}
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.transaction_type === "IN" ? "Kasa Giriş" : "Kasa Çıkış"} -{" "}
              {item.amount} TL
            </Text>
            <Text>{item.description}</Text>
            <Text>
              Date: {new Date(item.created_at).toLocaleString()}
            </Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleEditTransaction(item)}>
                <Icon name="edit" size={24} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={[styles.title, { marginTop: 32 }]}>
        Cash Registers
      </Text>

      <Button
        title="New Cash Registers"
        onPress={() => setRegisterModalVisible(true)}
      />

      {/* Cash Registers List */}
      <FlatList
        style={{ marginTop: 8 }}
        data={cashRegisters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Date: {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text>
              Balance: {item.balance} TL
            </Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleEditRegister(item)}>
                <Icon name="edit" size={24} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteRegister(item.id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Transaction Form Modal */}
      <Modal visible={formModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {formData.id ? "Edit Transaction" : "Add Transaction"}
            </Text>

            <Text>Cash Register</Text>
            {/* Cash Register Picker */}
            {Platform.OS === "android" ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.cash_register}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, cash_register: value }))
                  }
                  style={{ height: 40 }}
                >
                  {cashRegisters.map((reg) => (
                    <Picker.Item
                      key={reg.id}
                      label={new Date(reg.date).toLocaleDateString()}
                      value={reg.id}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <ScrollView horizontal style={{ marginVertical: 8 }}>
                {cashRegisters.map((reg) => (
                  <TouchableOpacity
                    key={reg.id}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, cash_register: reg.id }))
                    }
                    style={[
                      styles.registerOption,
                      formData.cash_register === reg.id && styles.registerOptionSelected,
                    ]}
                  >
                    <Text>{new Date(reg.date).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text>Amount</Text>
            <TextInput
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, amount: text }))
              }
              style={styles.input}
            />

            <Text>Transaction Type</Text>
            <View style={styles.transactionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  formData.transaction_type === "IN" && styles.selectedButton,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, transaction_type: "IN" }))
                }
              >
                <Text>IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  formData.transaction_type === "OUT" && styles.selectedButton,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, transaction_type: "OUT" }))
                }
              >
                <Text>OUT</Text>
              </TouchableOpacity>
            </View>

            <Text>Description</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              style={[styles.input, { height: 80 }]}
            />

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setFormModalVisible(false)} />
              <Button title="Save" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </Modal>

      {/* New Cash Register Modal */}
      <Modal visible={registerModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Cash Register</Text>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text>{newRegisterDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newRegisterDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setNewRegisterDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setRegisterModalVisible(false)} />
              <Button title="Add" onPress={handleAddRegister} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Cash Register Modal */}
      <Modal
        visible={editRegisterModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Cash Register</Text>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text>
                {editingRegister
                  ? new Date(editingRegister.date).toLocaleDateString()
                  : ""}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={
                  editingRegister ? new Date(editingRegister.date) : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate && editingRegister) {
                    setEditingRegister({ ...editingRegister, date: selectedDate });
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setEditRegisterModalVisible(false)}
              />
              <Button title="Save" onPress={handleUpdateRegister} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  transactionTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  selectedButton: {
    backgroundColor: "#cce5ff",
    borderColor: "#339af0",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginVertical: 12,
    alignItems: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  registerOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 10,
  },
  registerOptionSelected: {
    backgroundColor: "#cce5ff",
    borderColor: "#339af0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CashboxPage;
