import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const AdminNavbarLinks = () => {
  const navigation = useNavigation();  // Burada navigation alındı
  const [openAlerts, setOpenAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [taskNotifications, setTaskNotifications] = useState([]);
  
  console.log("navigation:", navigation);

  const toggleAlerts = () => {
    setOpenAlerts(!openAlerts);
  };

  const goToProfile = () => {
    navigation.navigate("Profiles");
    console.log("navigation:", navigation);

  };

  const goToDashboard = () => {
    navigation.navigate("Dashboard");
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:8000/stocks/api/stock-alerts/", {
          headers: { Authorization: `Token ${token}` },
        });
        setAlerts(response.data.alerts);
      } catch (error) {
        console.log("Uyarılar alınamadı:", error);
      }
    };

    fetchAlerts();

    AsyncStorage.getItem("taskNotifications").then((data) => {
      if (data) {
        try {
          setTaskNotifications(JSON.parse(data));
        } catch {
          setTaskNotifications([]);
        }
      }
    });
  }, []);

   return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleAlerts}>
        <MaterialIcons 
          name="notifications"
          size={28}
          color={alerts.length > 0 ? "red" : "gray"}
        />
      </TouchableOpacity>

      {openAlerts && (
        <View style={styles.alertBox}>
          <ScrollView>
            <Text style={styles.title}>Görev Bildirimleri</Text>
            {taskNotifications.length === 0 ? (
              <Text style={styles.message}>Bildirim yok</Text>
            ) : (
              taskNotifications.map((note, idx) => (
                <Text key={idx} style={styles.message}>{note.message}</Text>
              ))
            )}
            {alerts.length > 0 && (
              <>
                <Text style={styles.title}>Stok Uyarıları</Text>
                {alerts.map((alert, idx) => (
                  <Text key={idx} style={styles.message}>{alert}</Text>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity onPress={goToDashboard}>
        <MaterialIcons  name="dashboard" size={28} color="#555" />
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
    padding: 10,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  alertBox: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: 250,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginVertical: 5,
  },
  message: {
    fontSize: 13,
    marginVertical: 2,
  },
});

export default AdminNavbarLinks;
