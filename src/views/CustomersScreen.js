import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Layout from "../components/Layout.js";
export default function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    loyalty_points: 0,
  });
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      console.error('Token bulunamadı!');
      return;
    }

    try {
      const response = await axios.get(
        'http://192.168.1.33:8000/accounts/api/customers/',
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error('Müşteri bilgileri alınamadı:', error);
    }
  };

  const handleChange = (field, value) => {
    setNewCustomer({ ...newCustomer, [field]: value });
  };

  const handleCreateOrUpdate = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return;

    const url = editingCustomerId
      ? `http://192.168.1.33:8000/accounts/customers/${editingCustomerId}/update/`
      : 'http://192.168.1.33:8000/accounts/customers/create/';

    try {
      await axios({
        method: editingCustomerId ? 'put' : 'post',
        url,
        data: newCustomer,
        headers: { Authorization: `Token ${token}` },
      });

      setNewCustomer({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        loyalty_points: 0,
      });
      setEditingCustomerId(null);
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri kaydedilemedi:', error);
    }
  };

  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return;

    try {
      await axios.delete(
        `http://192.168.1.33:8000/accounts/customers/${id}/delete/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setTimeout(() => {
  fetchCustomers();
}, 500);
    } catch (error) {
      console.error('Müşteri silinemedi:', error.response?.status, error.response?.data, error.message);
    }
  };

  const handleEdit = (customer) => {
    setNewCustomer({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      loyalty_points: customer.loyalty_points || 0,
    });
    setEditingCustomerId(customer.id);
  };

  return (
    <Layout>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Müşteri Listesi</Text>

      {customers.map((customer) => (
        <View key={customer.id} style={styles.card}>
          <Text style={styles.name}>
            {customer.full_name || `${customer.first_name} ${customer.last_name}`}
          </Text>
          <Text>Email: {customer.email || 'Yok'}</Text>
          <Text>Telefon: {customer.phone || 'Yok'}</Text>
          <Text>Adres: {customer.address || 'Yok'}</Text>
          <Text>Puan: {customer.loyalty_points}</Text>
          <View style={styles.buttonRow}>
            <Button title="Sil" color="red" onPress={() => handleDelete(customer.id)} />
            <Button title="Güncelle" onPress={() => handleEdit(customer)} />
          </View>
        </View>
      ))}

      <Text style={styles.header}>
        {editingCustomerId ? 'Müşteri Güncelle' : 'Yeni Müşteri Ekle'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ad"
        value={newCustomer.first_name}
        onChangeText={(text) => handleChange('first_name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyad"
        value={newCustomer.last_name}
        onChangeText={(text) => handleChange('last_name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={newCustomer.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={newCustomer.phone}
        onChangeText={(text) => handleChange('phone', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
        value={newCustomer.address}
        onChangeText={(text) => handleChange('address', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Sadakat Puanı"
        keyboardType="numeric"
        value={String(newCustomer.loyalty_points)}
        onChangeText={(text) => handleChange('loyalty_points', parseInt(text) || 0)}
      />

      <Button
        title={editingCustomerId ? 'Güncelle' : 'Ekle'}
        onPress={handleCreateOrUpdate}
      />
    </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
