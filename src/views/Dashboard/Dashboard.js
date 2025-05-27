/*import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const DashboardScreen = () => {
  const [materialData, setMaterialData] = useState([]);
  const [disinfectantData, setDisinfectantData] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        if (storedToken) {
          setToken(storedToken);
          await fetchAllData(storedToken);
        } else {
          console.warn("Token bulunamadı");
        }
      } catch (err) {
        console.error("Token alma hatası:", err);
      }
    };

    fetchTokenAndData();
  }, []);

  const fetchAllData = async (token) => {
    const authHeaders = {
      headers: { Authorization: `Token ${token}` },
    };

    try {
      const [materialsRes, disinfectantsRes, userRes, deliveriesRes] = await Promise.all([
        axios.get("http://192.168.99.3:8000/stocks/api/materials/", authHeaders),
        axios.get("http://192.168.99.3:8000/stocks/api/disinfectants/", authHeaders),
        axios.get("http://192.168.99.3:8000/accounts/api/user/", authHeaders),
        axios.get("http://192.168.99.3:8000/store/api/deliveries/", authHeaders),
      ]);

      setMaterialData(materialsRes.data);
      setDisinfectantData(disinfectantsRes.data);
      setUsername(userRes.data.username);

      const pendingDeliveries = deliveriesRes.data.filter((d) => !d.is_delivered);
      setDeliveries(pendingDeliveries);
    } catch (err) {
      console.error("Veriler alınamadı:", err);
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    if (editingIndex !== null) {
      const updated = [...tasks];
      updated[editingIndex].text = newTaskText;
      setTasks(updated);
      setEditingIndex(null);
    } else {
      setTasks([...tasks, { text: newTaskText, completed: false, addedBy: username }]);
    }
    setNewTaskText("");
  };

  const toggleComplete = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const handleDeleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  const handleEditTask = (index) => {
    setNewTaskText(tasks[index].text);
    setEditingIndex(index);
  };

  const handleMarkDelivered = async (id) => {
    const authHeaders = {
      headers: { Authorization: `Token ${token}` },
    };

    try {
      await axios.get(`http://192.168.99.3:8000/store/api/deliveries/${id}/mark_as_delivered/`, authHeaders);
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Teslimat hatası:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📦 Material Stocks</Text>
      {materialData.map((m) => (
        <Text key={m.id}>{m.name}: {m.quantity_in_stock} {m.unit}</Text>
      ))}

      <Text style={styles.header}>🧴 Disinfectant Stocks</Text>
      {disinfectantData.map((d) => (
        <Text key={d.id}>{d.name}: {d.quantity_in_stock}</Text>
      ))}

      <Text style={styles.header}>🚚 Bekleyen Teslimatlar</Text>
      {deliveries.length === 0 ? (
        <Text>Tüm teslimatlar tamamlandı.</Text>
      ) : (
        deliveries.map((delivery) => (
          <TouchableOpacity key={delivery.id} onPress={() => handleMarkDelivered(delivery.id)}>
            <Text>• {delivery.customer_name} - Ürün ID: {delivery.item}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.header}>📝 Görev Listesi</Text>
      <View style={styles.taskInput}>
        <TextInput
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder="Yeni görev"
          style={styles.input}
        />
        <Button title={editingIndex !== null ? "Güncelle" : "Ekle"} onPress={handleAddTask} />
      </View>
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskItem}>
          <TouchableOpacity onPress={() => toggleComplete(index)} style={{ flex: 1 }}>
            <Text style={{ textDecorationLine: task.completed ? "line-through" : "none" }}>
              {task.text} – {task.addedBy}
            </Text>
          </TouchableOpacity>
          <Button title="D" onPress={() => handleDeleteTask(index)} />
          <Button title="E" onPress={() => handleEditTask(index)} />
        </View>
      ))}
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  taskInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    flex: 1,
    marginRight: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
});
*/
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Checkbox } from "react-native-paper"; // react-native-paper kurulmalı
import Icon from "react-native-vector-icons/MaterialIcons"; // react-native-vector-icons kurulmalı
import AdminNavbarLinks from "../../components/AdminNavbarLinks";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 136, 254, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 2,
};

export default function Dashboard() {
  const [materialData, setMaterialData] = useState([]);
  const [disinfectantData, setDisinfectantData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [username, setUsername] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("access_token").then((storedToken) => {
      if (storedToken) {
        setToken(storedToken);
      }
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    const authHeaders = { headers: { Authorization: `Token ${token}` } };

    const fetchMaterials = async () => {
      try {
        const res = await axios.get(
          "http://192.168.99.3:8000/stocks/api/materials/",
          authHeaders
        );
        setMaterialData(res.data);
      } catch (err) {
        console.error("Material verileri alınamadı", err);
      }
    };

    const fetchDisinfectants = async () => {
      try {
        const res = await axios.get(
          "http://192.168.99.3:8000/stocks/api/disinfectants/",
          authHeaders
        );
        setDisinfectantData(res.data);
      } catch (err) {
        console.error("Disinfectant verileri alınamadı", err);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://192.168.99.3:8000/accounts/api/user/",
          authHeaders
        );
        setUsername(res.data.username);
      } catch (err) {
        console.error("Kullanıcı alınamadı", err);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const res = await axios.get(
          "http://192.168.99.3:8000/store/api/deliveries/",
          authHeaders
        );
        const pending = res.data.filter((d) => !d.is_delivered);
        setDeliveries(pending);
      } catch (err) {
        console.error("Teslimat verisi alınamadı:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://192.168.99.3:8000/stocks/api/stock-alerts/",
          authHeaders
        );
        if (Array.isArray(res.data.alerts)) {
          setNotifications(res.data.alerts);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Bildirimler alınamadı:", err);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          "http://192.168.99.3:8000/cash/transactions/",
          authHeaders
        );
        setTransactions(response.data);
      } catch (error) {
        console.error("Transaction verisi alınamadı", error);
      }
    };

    fetchMaterials();
    fetchDisinfectants();
    fetchUser();
    fetchDeliveries();
    fetchNotifications();
    fetchTransactions();
  }, [token]);

  const totalCashIn = transactions
    .filter((tx) => tx.transaction_type === "IN")
    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

  const totalCashOut = transactions
    .filter((tx) => tx.transaction_type === "OUT")
    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

  const pieData = [
    {
      name: "Cash In",
      population: totalCashIn,
      color: "#0088FE",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Cash Out",
      population: totalCashOut,
      color: "#FF8042",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  // Bar chart için data hazırlama
  const prepareBarData = (dataArray) => ({
    labels: dataArray.slice(0, 5).map((item) => item.name),
    datasets: [
      {
        data: dataArray.slice(0, 5).map((item) => item.quantity_in_stock),
      },
    ],
  });

  // Tasklar için fonksiyonlar
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    if (editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex].text = newTaskText;
      setTasks(updatedTasks);
      setEditingIndex(null);
    } else {
      setTasks([
        ...tasks,
        { text: newTaskText, completed: false, addedBy: username },
      ]);
    }
    setNewTaskText("");
  };

  const handleDeleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleEditTask = (index) => {
    setNewTaskText(tasks[index].text);
    setEditingIndex(index);
  };

  const toggleComplete = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const handleMarkDelivered = async (id) => {
    try {
      await axios.get(
        `http://192.168.99.3:8000/store/api/deliveries/${id}/mark_as_delivered/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Teslim etme hatası:", err);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {/* Bildirim sayısı ve basit gösterim */}
        <View>
      <AdminNavbarLinks />  {/* Bu olmalı */}
      <Text>Dashboard Sayfası</Text>
    </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        <TouchableOpacity>
          <Icon name="notifications" size={30} color="#000" />
          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={{ color: "white", fontSize: 12 }}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Pie Chart */}
      <Text style={styles.header}>Cash In vs Cash Out</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Material Stocks Bar Chart */}
      <Text style={styles.header}>Material Stocks</Text>
      <BarChart
        data={prepareBarData(materialData)}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        fromZero
      />

      {/* Disinfectant Stocks Bar Chart */}
      <Text style={styles.header}>Disinfectant Stocks</Text>
      <BarChart
        data={prepareBarData(disinfectantData)}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1) => `rgba(130, 202, 157, ${opacity})`,
        }}
        verticalLabelRotation={30}
        fromZero
      />

      {/* Pending Deliveries */}
      <Text style={styles.header}>Bekleyen Siparişler</Text>
      {deliveries.length === 0 ? (
        <Text>Tüm teslimatlar tamamlandı.</Text>
      ) : (
        deliveries.map((delivery) => (
          <View key={delivery.id} style={styles.deliveryItem}>
            <Checkbox
              status={false}
              onPress={() => handleMarkDelivered(delivery.id)}
            />
            <Text>{delivery.customer_name} - Ürün ID: {delivery.item}</Text>
          </View>
        ))
      )}

      {/* Görevler */}
      <Text style={styles.header}>Görevler</Text>
      <View style={styles.taskInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Yeni görev"
          value={newTaskText}
          onChangeText={setNewTaskText}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={{ color: "white" }}>
            {editingIndex !== null ? "Güncelle" : "Ekle"}
          </Text>
        </TouchableOpacity>
      </View>

      {tasks.map((task, index) => (
        <View key={index} style={styles.taskItem}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Checkbox
              status={task.completed ? "checked" : "unchecked"}
              onPress={() => toggleComplete(index)}
            />
            <Text
              style={{
                textDecorationLine: task.completed ? "line-through" : "none",
                flexShrink: 1,
              }}
            >
              {task.text} <Text style={{ fontSize: 12, color: "#777" }}>– {task.addedBy} tarafından eklendi</Text>
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() => handleEditTask(index)} style={{ marginRight: 10 }}>
              <Icon name="edit" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(index)}>
              <Icon name="delete" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskInputContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    flex: 1,
    height: 40,
  },
  addButton: {
    backgroundColor: "#0088FE",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
});
