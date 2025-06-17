import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
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
  const [taskNotifications, setTaskNotifications] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [username, setUsername] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
          "http://192.168.1.33:8000/stocks/api/materials/",
          authHeaders,
        );
        setMaterialData(res.data);
      } catch (err) {
        console.error("Material verileri alınamadı", err);
      }
    };

    const fetchDisinfectants = async () => {
      try {
        const res = await axios.get(
          "http://192.168.1.33:8000/stocks/api/disinfectants/",
          authHeaders,
        );
        setDisinfectantData(res.data);
      } catch (err) {
        console.error("Disinfectant verileri alınamadı", err);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://192.168.1.33:8000/accounts/api/user/",
          authHeaders,
        );
        setUsername(res.data.username);
      } catch (err) {
        console.error("Kullanıcı alınamadı", err);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const res = await axios.get(
          "http://192.168.1.33:8000/store/api/deliveries/",
          authHeaders,
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
          "http://192.168.1.33:8000/stocks/api/stock-alerts/",
          authHeaders,
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
          "http://192.168.1.33:8000/cash/transactions/",
          authHeaders,
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
  useEffect(() => {
  AsyncStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);

// Görevleri geri yükle
useEffect(() => {
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log("Görevler yüklenemedi:", error);
    }
  };

  loadTasks();
}, []);
useEffect(() => {
  const now = new Date();
  const upcoming = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;
    const due = new Date(task.dueDate);
    const diffDays = (due - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 3;
  });

  const notifications = upcoming.map((task, index) => ({
    id: index,
    message: `Görev "${task.text}" için son tarih 3 gün içinde.`,
  }));

  setTaskNotifications(notifications);

  if (notifications.length > 0) {
    AsyncStorage.setItem("taskNotifications", JSON.stringify(notifications));
  } else {
    AsyncStorage.removeItem("taskNotifications");  // ✅ Bildirimleri temizle
  }
}, [tasks]);
  // Tasklar için fonksiyonlar
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    if (editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex].text = newTaskText;
      updatedTasks[editingIndex].dueDate = dueDate; // tarih güncelle
      setTasks(updatedTasks);
      setEditingIndex(null);
    } else {
      setTasks([
        ...tasks,
        {
          text: newTaskText,
          completed: false,
          addedBy: username,
          dueDate: dueDate,
        },
      ]);
    }
    setNewTaskText("");
    setDueDate(null);
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
        `http://192.168.1.33:8000/store/api/deliveries/${id}/mark_as_delivered/`,
        { headers: { Authorization: `Token ${token}` } },
      );
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Teslim etme hatası:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80} // Navbar vs varsa burayı ayarlayabilirsin
    >
      <ScrollView
        style={{ flex: 1, padding: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }} // Alt boşluk!
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <AdminNavbarLinks /> {/* Bu olmalı */}
          <Text>Dashboard Sayfası</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Icon name="notifications" size={30} color="#000" />
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={{ color: "white", fontSize: 12 }}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {showNotifications && (
          <View
            style={{ backgroundColor: "#eee", padding: 10, borderRadius: 8 }}
          >
            <Text style={{ fontWeight: "bold" }}>Stok Uyarıları</Text>
            {notifications.map((note, i) => (
              <Text key={i} style={{ color: "red", marginVertical: 2 }}>
                • {note}
              </Text>
            ))}

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              Görev Uyarıları
            </Text>
            {taskNotifications.length === 0 ? (
              <Text>Görev uyarısı yok.</Text>
            ) : (
              taskNotifications.map((task) => (
                <Text key={task.id} style={{ color: "orange" }}>
                  • {task.message}
                </Text>
              ))
            )}
          </View>
        )}

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
              <Text>
                {delivery.customer_name} - Ürün ID: {delivery.item}
              </Text>
            </View>
          ))
        )}

        {/* Görevler */}
        <Text style={styles.header}>Görevler</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Yeni görev"
            value={newTaskText}
            onChangeText={setNewTaskText}
          />

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ marginLeft: 10 }}
          >
            <Text>
              {dueDate
                ? new Date(dueDate).toLocaleDateString()
                : "Son tarih seç"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={{ color: "white" }}>
              {editingIndex !== null ? "Güncelle" : "Ekle"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate ? new Date(dueDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDueDate(selectedDate.toISOString());
            }}
          />
        )}

        {/* Görev Listesi */}
        {tasks.map((task, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <Checkbox
              status={task.completed ? "checked" : "unchecked"}
              onPress={() => toggleComplete(index)}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{task.text}</Text>
              <Text style={{ fontSize: 12, color: "#777" }}>
                – {task.addedBy} tarafından eklendi
                {task.dueDate
                  ? ` | Son tarih: ${new Date(task.dueDate).toLocaleDateString()}`
                  : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleEditTask(index)}>
              <Text style={{ marginHorizontal: 10, color: "blue" }}>
                Düzenle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(index)}>
              <Text style={{ color: "red" }}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 5,
    paddingVertical: 1,
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
