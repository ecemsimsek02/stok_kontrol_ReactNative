import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [editTaskTitles, setEditTaskTitles] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    checkNotifications();
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get("https://stokkontrol-production.up.railway.app/tasks/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setTasks(data);

      // Edit için başlıkları hazırla
      const titles = {};
      data.forEach((task) => {
        titles[task.id] = task.title;
      });
      setEditTaskTitles(titles);
    } catch (error) {
      console.error("Görevler alınırken hata:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) {
      Alert.alert("Hata", "Lütfen görev başlığı ve tarih girin.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.post(
        "https://stokkontrol-production.up.railway.app/tasks/",
        { title: newTaskTitle, due_date: newTaskDueDate },
        { headers: { Authorization: `Token ${token}` } }
      );
      setNewTaskTitle("");
      setNewTaskDueDate("");
      fetchTasks();
    } catch (error) {
      console.error("Görev eklenirken hata:", error.response?.data || error.message);
    }
  };

  const handleUpdateTask = async (taskId) => {
    const updatedTitle = editTaskTitles[taskId];
    if (!updatedTitle || !updatedTitle.trim()) return;
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.patch(
        `https://stokkontrol-production.up.railway.app/tasks/${taskId}/`,
        { title: updatedTitle },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error("Görev güncellenirken hata:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.delete(`https://stokkontrol-production.up.railway.app/tasks/${taskId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Görev silinirken hata:", error);
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.patch(
        `https://stokkontrol-production.up.railway.app/tasks/${task.id}/`,
        { is_completed: !task.is_completed },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error("Görev tamamlanma durumu değiştirilirken hata:", error);
    }
  };

  const checkNotifications = async (tasks, setNotifications) => {
       const today = new Date();
    const updatedNotifications = tasks
      .filter((task) => {
        if (task.is_completed || !task.due_date) return false;
        const due = new Date(task.due_date);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff <= 3 && diff >= 0;
      })
      .map((task) => {
        const due = new Date(task.due_date);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return {
          id: task.id,
          title: task.title,
          message: `Görev "${task.title}" için son ${diff} gün!`,
        };
      });

    setNotifications(updatedNotifications);

    // Bildirimleri AsyncStorage'a kaydet (navbarda okunması için)

      await AsyncStorage.setItem(
      "taskNotifications",
      JSON.stringify(updatedNotifications)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Görevler</Text>

      <TextInput
        style={styles.input}
        placeholder="Yeni görev başlığı"
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Bitiş tarihi (YYYY-MM-DD)"
        value={newTaskDueDate}
        onChangeText={setNewTaskDueDate}
      />
      <Button title="Görev Ekle" onPress={handleAddTask} />

      <FlatList
        style={styles.taskList}
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text
              style={[
                styles.taskTitle,
                item.is_completed && styles.completedTaskTitle,
              ]}
            >
              {item.title} ({item.due_date || "Tarih yok"})
            </Text>

            <TextInput
              style={styles.editInput}
              value={editTaskTitles[item.id]}
              onChangeText={(text) =>
                setEditTaskTitles((prev) => ({ ...prev, [item.id]: text }))
              }
            />
            <Button title="Güncelle" onPress={() => handleUpdateTask(item.id)} />

            <View style={styles.row}>
              <Text>Tamamlandı:</Text>
              <Switch
                value={item.is_completed}
                onValueChange={() => toggleTaskCompletion(item)}
              />
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Sil",
                  `"${item.title}" görevini silmek istediğinize emin misiniz?`,
                  [
                    { text: "İptal" },
                    { text: "Sil", onPress: () => handleDeleteTask(item.id) },
                  ]
                )
              }
              style={styles.deleteButton}
            >
              <Text style={{ color: "white" }}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default TaskPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskList: { marginTop: 10 },
  taskItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
  },
  taskTitle: { fontSize: 16 },
  completedTaskTitle: { textDecorationLine: "line-through", color: "gray" },
  editInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 5,
    marginVertical: 5,
    borderRadius: 3,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 5, gap: 5 },
});
