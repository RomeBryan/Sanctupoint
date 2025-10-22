import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';

const EditService = ({ route, navigation }) => {
  const { service } = route.params;
  const [serviceName, setServiceName] = useState(service.service_name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price ? String(service.price) : '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('services')
      .update({
        service_name: serviceName,
        description,
        price: price ? parseFloat(price) : null,
      })
      .eq('service_id', service.service_id);
    setLoading(false);

    if (error) Alert.alert('Update Failed', error.message);
    else {
      Alert.alert('Success', 'Service updated!');
      navigation.goBack();
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Service', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase
            .from('services')
            .delete()
            .eq('service_id', service.service_id);
          setLoading(false);
          if (error) Alert.alert('Error', error.message);
          else {
            Alert.alert('Deleted', 'Service removed.');
            navigation.goBack();
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Service</Text>

      <Text style={styles.label}>Service Name *</Text>
      <TextInput style={styles.input} value={serviceName} onChangeText={setServiceName} />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Price</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Service</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
        <Text style={styles.buttonText}>Delete Service</Text>
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
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, marginTop: 10 },
  deleteButton: { backgroundColor: '#dc3545', padding: 14, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default EditService;
