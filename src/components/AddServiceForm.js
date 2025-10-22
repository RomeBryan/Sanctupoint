import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const AddServiceForm = ({ onAdd }) => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const addService = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Please enter a service name.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .insert([{ service_name: serviceName, description }])
      .select();

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setServiceName('');
      setDescription('');
      if (onAdd) onAdd(data[0]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Service Name"
        value={serviceName}
        onChangeText={setServiceName}
        style={styles.input}
      />
      <TextInput
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button
        title={loading ? 'Adding...' : 'Add Service'}
        onPress={addService}
        disabled={loading}
        color="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

export default AddServiceForm;
