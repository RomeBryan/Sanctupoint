import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const ServiceDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ totalServices: 0, averagePrice: 0 });
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('service_name', { ascending: true });
    if (error) {
      console.error('Error fetching services:', error.message);
      setLoading(false);
      return;
    }
    setServices(data);

    // Dashboard stats
    const avg =
      data.length > 0
        ? data.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0) / data.length
        : 0;
    setStats({ totalServices: data.length, averagePrice: avg });

    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    const channel = supabase
      .channel('services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchServices)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleAddService = async () => {
    if (!serviceName || !description) {
      Alert.alert('Error', 'Please enter a name and description.');
      return;
    }

    const { error } = await supabase.from('services').insert([
      {
        service_name: serviceName,
        description,
        price: price ? parseFloat(price) : null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) Alert.alert('Error adding service', error.message);
    else {
      Alert.alert('Success', 'Service added successfully!');
      setServiceName('');
      setDescription('');
      setPrice('');
      setShowModal(false);
      fetchServices();
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('services').delete().eq('service_id', id);
          if (error) Alert.alert('Error deleting', error.message);
          else {
            Alert.alert('Deleted', 'Service removed.');
            fetchServices();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Service Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Services</Text>
          <Text style={styles.cardValue}>{stats.totalServices}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avg. Price</Text>
          <Text style={styles.cardValue}>₱{stats.averagePrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Service List */}
      <Text style={styles.sectionTitle}>All Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.service_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              <Text style={styles.serviceDesc}>{item.description}</Text>
              {item.price && <Text style={styles.servicePrice}>₱{item.price}</Text>}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ServiceDetails', { service: item })}
                style={styles.actionBtn}
              >
                <Ionicons name="eye-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditService', { service: item })}
                style={styles.actionBtn}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.service_id)}
                style={styles.actionBtn}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No services available.</Text>}
      />

      {/* Add Service Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={serviceName}
              onChangeText={setServiceName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Price (optional)"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddService}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  card: {
    flex: 1,
    backgroundColor: '#eaf2ff',
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, color: '#555' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  serviceDesc: { color: '#555', fontSize: 13, marginTop: 4 },
  servicePrice: { color: '#333', fontWeight: 'bold', marginTop: 4 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: { padding: 6 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveButton: { backgroundColor: '#007AFF', flex: 1, marginRight: 5, borderRadius: 8, padding: 10 },
  cancelButton: { backgroundColor: '#ccc', flex: 1, marginLeft: 5, borderRadius: 8, padding: 10 },
  saveText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { color: '#333', textAlign: 'center', fontWeight: 'bold' },
});

export default ServiceDashboard;
