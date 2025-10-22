import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const ServiceItem = ({ service, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [serviceName, setServiceName] = useState(service.service_name);
  const [description, setDescription] = useState(service.description || '');
  const [loading, setLoading] = useState(false);

  const updateService = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Service name cannot be empty.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('services')
      .update({ service_name: serviceName, description })
      .eq('service_id', service.service_id);

    setLoading(false);

    if (error) {
      Alert.alert('Error updating service', error.message);
    } else {
      setEditing(false);
      onUpdate && onUpdate(service.service_id, { service_name: serviceName, description });
    }
  };

  const deleteService = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
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
          if (error) {
            Alert.alert('Error deleting service', error.message);
          } else {
            onDelete && onDelete(service.service_id);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      {editing ? (
        <>
          <TextInput
            value={serviceName}
            onChangeText={setServiceName}
            style={styles.input}
            placeholder="Service Name"
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            placeholder="Description"
          />
          <View style={styles.btnRow}>
            <Button title="Save" onPress={updateService} disabled={loading} color="#007AFF" />
            <Button title="Cancel" onPress={() => setEditing(false)} color="#999" />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>{service.service_name}</Text>
          {service.description ? (
            <Text style={styles.desc}>{service.description}</Text>
          ) : (
            <Text style={styles.descEmpty}>No description</Text>
          )}
          <View style={styles.btnRow}>
            <Button title="Edit" onPress={() => setEditing(true)} color="#007AFF" />
            <Button title="Delete" onPress={deleteService} color="#FF3B30" />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 14, color: '#555', marginTop: 4 },
  descEmpty: { fontSize: 14, color: '#999', marginTop: 4, fontStyle: 'italic' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
});

export default ServiceItem;
