import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';

const AddService = ({ navigation }) => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddService = async () => {
    if (!serviceName || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('services')
      .insert([
        {
          service_name: serviceName,
          description,
          price: price ? parseFloat(price) : null,
          created_at: new Date().toISOString(),
        },
      ]);

    setLoading(false);

    if (error) Alert.alert('Failed', error.message);
    else {
      Alert.alert('Success', 'Service added successfully!');
      setServiceName('');
      setDescription('');
      setPrice('');
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Service</Text>

      <Text style={styles.label}>Service Name *</Text>
      <TextInput
        style={styles.input}
        value={serviceName}
        onChangeText={setServiceName}
        placeholder="Enter service name"
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Price (optional)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddService}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Service</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 14,
  },
  textArea: { textAlignVertical: 'top', height: 100 },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default AddService;
