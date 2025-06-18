import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const AdminNavbarLinks = () => {
  const navigation = useNavigation();
  const [openAlerts, setOpenAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [taskNotifications, setTaskNotifications] = useState([]);
  const { logout } = useContext(AuthContext);

  const toggleAlerts = () => {
    setOpenAlerts(!openAlerts);
  };

  const goToProfile = () => {
    navigation.navigate("Profiles");
  };

  const goToDashboard = () => {
    navigation.navigate("Dashboard");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      logout();
    } catch (error) {
      console.log("Çıkış yapılamadı:", error);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await axios.get(
          "http://192.168.1.33:8000/stocks/api/stock-alerts/",
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        setAlerts(response.data.alerts);
      } catch (error) {
        console.log("Uyarılar alınamadı:", error);
      }
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    const fetchTaskNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem("taskNotifications");
        if (stored) {
          setTaskNotifications(JSON.parse(stored));
        } else {
          setTaskNotifications([]);
        }
      } catch (err) {
        console.log("Bildirimler okunamadı:", err);
        setTaskNotifications([]);
      }
    };

    fetchTaskNotifications();
  }, [openAlerts]);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleAlerts}>
        <MaterialIcons
          name="notifications"
          size={28}
          color={
            alerts.length > 0 || taskNotifications.length > 0 ? "red" : "gray"
          }
        />
      </TouchableOpacity>

      {openAlerts && (
        <View style={styles.alertBox}>
          <ScrollView>
            {taskNotifications.length === 0 ? (
              <Text>Görev uyarısı yok.</Text>
            ) : (
              taskNotifications.map((task) => (
                <Text key={task.id} style={{ color: "orange", marginBottom: 4 }}>
                  • {task.message}
                </Text>
              ))
            )}
            {alerts.length > 0 && (
              <>
                <Text style={styles.title}>Stok Uyarıları</Text>
                {alerts.map((alert, idx) => (
                  <Text key={idx} style={[styles.message, { color: "red" }]}>
                    • {alert}
                  </Text>
                ))}
              </>
            )}

            {taskNotifications.length === 0 && alerts.length === 0 && (
              <Text style={styles.message}>Hiçbir bildirim yok.</Text>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity onPress={goToDashboard}>
        <MaterialIcons name="dashboard" size={28} color="#555" />
      </TouchableOpacity>

      <TouchableOpacity onPress={goToProfile}>
        <MaterialIcons name="person" size={28} color="#555" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <MaterialIcons name="logout" size={28} color="#555" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  alertBox: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 300,
    maxHeight: 300,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  message: {
    fontSize: 14,
    marginVertical: 3,
  },
});

export default AdminNavbarLinks;
