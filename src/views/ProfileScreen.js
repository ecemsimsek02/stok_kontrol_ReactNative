import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const ProfileScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    profile_picture: null,
  });
  const [editingProfileId, setEditingProfileId] = useState(null);

  const fetchProfiles = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await axios.get(
        "http://192.168.99.3:8000/accounts/api/profiles/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setProfiles(response.data);
    } catch (error) {
      console.error("Profil verileri alınamadı", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token || !editingProfileId) return;

    const formData = new FormData();
    formData.append("first_name", newProfile.first_name);
    formData.append("last_name", newProfile.last_name);
    formData.append("email", newProfile.email);
    formData.append("telephone", newProfile.phone);
    formData.append("role", newProfile.role);
    formData.append("status", newProfile.status);
    if (newProfile.profile_picture) {
      formData.append("profile_picture", {
        uri: newProfile.profile_picture,
        name: "photo.jpg",
        type: "image/jpeg",
      });
    }

    try {
      await axios.put(
        `http://192.168.99.3:8000/accounts/profile/${editingProfileId}/update/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Profil güncellendi");
      setEditingProfileId(null);
      resetForm();
      fetchProfiles();
    } catch (error) {
      console.error("Güncelleme başarısız", error);
    }
  };

  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token || !id) return;

    try {
      await axios.delete(
        `http://192.168.99.3:8000/accounts/profiles/${id}/delete/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchProfiles();
    } catch (error) {
      console.error("Silme işlemi başarısız", error);
    }
  };

  const handleEditClick = (profile) => {
    setNewProfile({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      phone: profile.telephone || "",
      role: profile.role || "",
      status: profile.status || "",
      profile_picture: null,
    });
    setEditingProfileId(profile.id);
  };

  const resetForm = () => {
    setNewProfile({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      status: "",
      profile_picture: null,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiller</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad"
        value={newProfile.first_name}
        onChangeText={(text) => setNewProfile({ ...newProfile, first_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyad"
        value={newProfile.last_name}
        onChangeText={(text) => setNewProfile({ ...newProfile, last_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={newProfile.email}
        onChangeText={(text) => setNewProfile({ ...newProfile, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={newProfile.phone}
        onChangeText={(text) => setNewProfile({ ...newProfile, phone: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Rol"
        value={newProfile.role}
        onChangeText={(text) => setNewProfile({ ...newProfile, role: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Durum"
        value={newProfile.status}
        onChangeText={(text) => setNewProfile({ ...newProfile, status: text })}
      />
      {/* Profil fotoğrafı yüklemek için ayrı bir bileşen eklenebilir */}

      {editingProfileId && (
        <Button title="Profili Güncelle" onPress={handleUpdate} />
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.image} />
            )}
            <Text>{item.first_name} {item.last_name}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Telefon: {item.telephone}</Text>
            <Text>Rol: {item.role}</Text>
            <Text>Durum: {item.status}</Text>
            <View style={styles.cardButtons}>
              <Button title="Düzenle" onPress={() => handleEditClick(item)} />
              <Button title="Sil" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 6,
    padding: 8,
    borderRadius: 4,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 8,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
