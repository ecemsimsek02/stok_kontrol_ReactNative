import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Layout from "../components/Layout.js";

const TransactionsScreen = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchToken = async () => {
    return await AsyncStorage.getItem("access_token");
  };

  const fetchData = async () => {
    try {
      const token = await fetchToken();
      const headers = {
        Authorization: `Token ${token}`,
      };

      const [saleRes, invoiceRes, purchaseRes, billRes] = await Promise.all([
        axios.get("http://192.168.1.33:8000/transactions/sale-transactions/", {
          headers,
        }),
        axios.get("http://192.168.1.33:8000/invoice/api/invoices/", { headers }),
        axios.get("http://192.168.1.33:8000/transactions/purchase-transactions/", {
          headers,
        }),
        axios.get("http://192.168.1.33:8000/bills/api/bills/", { headers }),
      ]);

      const invoiceMap = {};
      invoiceRes.data.forEach((inv) => {
        invoiceMap[inv.id] = inv;
      });

      const billMap = {};
      billRes.data.forEach((bill) => {
        billMap[bill.id] = bill;
      });

      const combinedSales = saleRes.data.map((sale) => ({
        ...sale,
        invoice: invoiceMap[sale.invoice] || {},
      }));

      const combinedPurchases = purchaseRes.data.map((purchase) => ({
        ...purchase,
        bill: billMap[purchase.bill] || {},
      }));

      setSales(combinedSales);
      setPurchases(combinedPurchases);
    } catch (error) {
      console.error("Veriler alınırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (type, id, newStatus) => {
    try {
      const token = await fetchToken();
      const url =
        type === "sale"
          ? `http://192.168.1.33:8000/transactions/sale-transactions/${id}/`
          : `http://192.168.1.33:8000/transactions/purchase-transactions/${id}/`;

      await axios.patch(
        url,
        { delivery_status: newStatus },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchData();
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 /* const renderTransactionItem = ({ item, type }) => (
    <View style={styles.item}>
      <Text style={styles.text}>
        {type === "sale"
          ? `Customer: ${item.invoice?.customer_name || "—"}`
          : `Institution: ${item.bill?.institution_name || "—"}`}
      </Text>
      <Text style={styles.text}>
        {type === "sale"
          ? `Invoice ID: ${item.invoice?.id} - Total: ${item.invoice?.grand_total} ₺`
          : `Bill ID: ${item.bill?.id} - Amount: ${item.bill?.amount} ₺`}
      </Text>
      <Text style={styles.text}>Delivery: {item.delivery_status}</Text>
      <Picker
        selectedValue={item.delivery_status}
        style={styles.picker}
        onValueChange={(value) =>
          updateDeliveryStatus(type, item.id, value)
        }
      >
        <Picker.Item label="Pending" value="pending" />
        <Picker.Item label="Shipped" value="shipped" />
        <Picker.Item label="Delivered" value="delivered" />
      </Picker>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales</Text>
      <FlatList
        data={sales}
        keyExtractor={(item) => `sale-${item.id}`}
        renderItem={({ item }) => renderTransactionItem({ item, type: "sale" })}
      />
      <Text style={styles.title}>Purchases</Text>
      <FlatList
        data={purchases}
        keyExtractor={(item) => `purchase-${item.id}`}
        renderItem={({ item }) =>
          renderTransactionItem({ item, type: "purchase" })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  item: {
    padding: 13,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  text: { marginBottom: 4 },
  picker: { height: 40, width: "100%" },
});

export default TransactionsScreen;  */
const renderTransactionItem = ({ item, type }) => (
    <View style={styles.item}>
      <Text style={styles.text}>
        {type === "sale"
          ? `Customer: ${item.invoice?.customer_name || "—"}`
          : `Institution: ${item.bill?.institution_name || "—"}`}
      </Text>
      <Text style={styles.text}>
        {type === "sale"
          ? `Invoice ID: ${item.invoice?.id} - Total: ${item.invoice?.grand_total} ₺`
          : `Bill ID: ${item.bill?.id} - Amount: ${item.bill?.amount} ₺`}
      </Text>
      <Text style={styles.text}>Delivery: {item.delivery_status}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={item.delivery_status}
          style={styles.picker}
          onValueChange={(value) => updateDeliveryStatus(type, item.id, value)}
        >
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Shipped" value="shipped" />
          <Picker.Item label="Delivered" value="delivered" />
        </Picker>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;

  return (
    <Layout>
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sales</Text>
        <FlatList
          data={sales}
          keyExtractor={(item) => `sale-${item.id}`}
          renderItem={({ item }) => renderTransactionItem({ item, type: "sale" })}
          scrollEnabled={false}
        />
        <Text style={styles.title}>Purchases</Text>
        <FlatList
          data={purchases}
          keyExtractor={(item) => `purchase-${item.id}`}
          renderItem={({ item }) => renderTransactionItem({ item, type: "purchase" })}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  picker: {
    height: 60,
    width: "100%",
  },
});

export default TransactionsScreen;
