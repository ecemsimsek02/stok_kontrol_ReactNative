// src/views/VendorsScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Layout from "../components/Layout.js";
const VendorsScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVendor, setNewVendor] = useState({ name: '', address: '', phone_number: '' });
  const [editingVendorId, setEditingVendorId] = useState(null);
  
  // AsyncStorage veya context'ten alınmalı

  const fetchVendors = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await axios.get('https://stokkontrol-production.up.railway.app/accounts/api/vendors/', {
        headers: { Authorization: `Token ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      Alert.alert('Hata', 'Vendor verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };
   
  const handleSaveVendor = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const url = editingVendorId
      ? `https://stokkontrol-production.up.railway.app/accounts/vendors/${editingVendorId}/update/`
      : 'https://stokkontrol-production.up.railway.app/accounts/vendors/new/';

    try {
      if (editingVendorId) {
        await axios.put(url, newVendor, { headers: { Authorization: `Token ${token}` } });
      } else {
        await axios.post(url, newVendor, { headers: { Authorization: `Token ${token}` } });
      }
      setNewVendor({ name: '', address: '', phone_number: '' });
      setEditingVendorId(null);
      fetchVendors();
    } catch (err) {
      Alert.alert('Hata', 'Vendor kaydedilemedi');
    }
  };

  const handleDeleteVendor = async (id) => {
    const token = await AsyncStorage.getItem("access_token");
      if (!token) {
    Alert.alert("Hata", "Token bulunamadı!");
    return;
  }
     try {
    const response = await axios.delete(`https://stokkontrol-production.up.railway.app/accounts/vendors/${id}/delete/`, {
      headers: { Authorization: `Token ${token}` },
    });

    console.log("Delete response:", response.status, response.data);

      setTimeout(() => {
  fetchVendors();
}, 500);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      Alert.alert("Bilgi", "Kayıt zaten silinmiş.");
      await fetchVendors();
    } else {
      console.error("Delete error:", error.response || error.message || error);
      Alert.alert("Hata", "Silinemedi");
    }
  }
};

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <Layout>
    <View style={styles.container}>
      <Text style={styles.header}>Satıcı Ekle </Text>
      <TextInput
        style={styles.input}
        placeholder="Ad"
        value={newVendor.name}
        onChangeText={(text) => setNewVendor({ ...newVendor, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
        value={newVendor.address}
        onChangeText={(text) => setNewVendor({ ...newVendor, address: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={newVendor.phone_number}
        onChangeText={(text) => setNewVendor({ ...newVendor, phone_number: text })}
      />
      <Button title={editingVendorId ? 'Güncelle' : 'Ekle'} onPress={handleSaveVendor} />

      <Text style={styles.header}>Satıcı Listesi</Text>
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.vendorItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{item.name}</Text>
              <Text>{item.address}</Text>
              <Text>{item.phone_number}</Text>
            </View>
            <Icon name="pencil" size={24} color="blue" onPress={() => {
              setNewVendor(item);
              setEditingVendorId(item.id);
            }} />
            <Icon name="delete" size={24} color="red" onPress={() => handleDeleteVendor(item.id)} style={{ marginLeft: 10 }} />
          </View>
        )}
      />
    </View>
    </Layout>
  );
};

export default VendorsScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
  vendorItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  vendorName: { fontWeight: 'bold' },
});
