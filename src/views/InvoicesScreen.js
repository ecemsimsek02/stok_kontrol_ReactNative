import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Layout from "../components/Layout.js";

const InvoicesScreen = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    contact_number: "",
    item: "",
    price_per_item: "",
    quantity: "",
    shipping: "",
  });
  const API_URL = "https://stokkontrol-production.up.railway.app/invoice/api/invoices/";
  const getAuthHeaders = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.error("Token bulunamadı!");
        return {};
      }
      return {
        headers: {
          Authorization: `Token ${token}`,
        },
      };
    } catch (error) {
      console.error("Token alınırken hata:", error);
      return {};
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(
        "https://stokkontrol-production.up.railway.app/accounts/api/customers/",
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteri listesi alınamadı:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(API_URL, headers);
      setInvoices(response.data);
    } catch (error) {
      console.error("Invoice fetch error:", error);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, []);

  const openModal = (invoice = null) => {
    setEditingInvoice(invoice);
    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name,
        contact_number: invoice.contact_number,
        item: invoice.item,
        price_per_item: invoice.price_per_item.toString(),
        quantity: invoice.quantity.toString(),
        shipping: invoice.shipping.toString(),
      });
    } else {
      setFormData({
        customer_name: "",
        contact_number: "",
        item: "",
        price_per_item: "",
        quantity: "",
        shipping: "",
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingInvoice(null);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingInvoice) {
        await axios.put(
          `${API_URL}${editingInvoice.id}/`,
          formData,
          getAuthHeaders(),
        );
      } else {
        await axios.post(API_URL, formData, getAuthHeaders());
      }
      fetchInvoices();
      closeModal();
    } catch (error) {
      console.error("Invoice submit error:", error);
      Alert.alert("Error", "İşlem başarısız oldu.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      t("Delete Invoice"),
      t("Are you sure you want to delete this invoice?"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
              fetchInvoices();
            } catch (error) {
              console.error("Invoice delete error:", error);
              Alert.alert("Error", "Silme işlemi başarısız oldu.");
            }
          },
        },
      ],
    );
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contact_number.includes(searchTerm),
  );

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Siparişler</Text>

        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <Button title="Sipariş Ekle" onPress={() => openModal()} />

        <ScrollView style={{ marginTop: 16 }}>
          {filteredInvoices.map((invoice) => (
            <View key={invoice.id} style={styles.card}>
              <Text style={styles.cardTitle}>{invoice.customer_name}</Text>
              <Text>Contact: {invoice.contact_number}</Text>
              <Text>Item: {invoice.item}</Text>
              <Text>Quantity: {invoice.quantity}</Text>
              <Text>Price: {invoice.price_per_item}</Text>
              <Text>Shipping: {invoice.shipping}</Text>
              <Text>Total: {invoice.total}</Text>
              <Text>Grand Total: {invoice.grand_total}</Text>

              <View style={styles.cardButtons}>
                <Button
                  title="Download Pdf"
                  onPress={
                    () =>
                      // React Native'de window.open yok, Linking kullanılabilir
                      // Bu örnek için Linking eklenmeli:
                      Linking.openURL(
                        `https://stokkontrol-production.up.railway.app/invoice/pdf/${invoice.id}/`,
                      )
                    //Alert.alert("Not Implemented", "PDF indirme mobilde desteklenmiyor.")
                  }
                />
                <Button title="Güncelle" onPress={() => openModal(invoice)} />
                <Button
                  title="Sil"
                  color="red"
                  onPress={() => handleDelete(invoice.id)}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingInvoice ? "Edit Invoice" : "Add Invoice"}
              </Text>

              {/* Müşteri seçimi için Picker */}
              <Picker
                selectedValue={selectedCustomer}
                onValueChange={(value) => {
                  setSelectedCustomer(value);
                  if (value !== "Diğer") {
                    handleChange("customer_name", value);
                  } else {
                    handleChange("customer_name", "");
                  }
                }}
                style={styles.input}
              >
                <Picker.Item label="Müşteri Seçiniz" value="" />
                {customers.map((cust) => (
                  <Picker.Item
                    key={cust.id}
                    label={cust.full_name}
                    value={cust.full_name}
                  />
                ))}
                <Picker.Item label="Diğer" value="Diğer" />
              </Picker>

              {selectedCustomer === "Diğer" && (
                <TextInput
                  style={styles.input}
                  placeholder="MÜŞTERİ ADI"
                  value={formData.customer_name}
                  onChangeText={(value) => handleChange("customer_name", value)}
                />
              )}
              {[
                "customer_name",
                "contact_number",
                "item",
                "price_per_item",
                "quantity",
                "shipping",
              ].map((field) => (
                <TextInput
                  key={field}
                  style={styles.input}
                  placeholder={field.replace(/_/g, " ").toUpperCase()}
                  value={formData[field]}
                  onChangeText={(value) => handleChange(field, value)}
                  keyboardType={
                    ["price_per_item", "quantity", "shipping"].includes(field)
                      ? "numeric"
                      : "default"
                  }
                />
              ))}

              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={closeModal} />
                <Button
                  title={editingInvoice ? "Update" : "Add"}
                  onPress={handleSubmit}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  langButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  searchInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
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
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default InvoicesScreen;
