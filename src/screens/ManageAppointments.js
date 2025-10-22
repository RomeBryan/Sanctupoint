import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) console.error(error);
    else setAppointments(data);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('appointment_id', id);

    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', `Appointment ${newStatus.toLowerCase()}!`);
      fetchAppointments();
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Appointments</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.appointment_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.service}>{item.service_type}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>
            <Text>Status: {item.status}</Text>

            {item.status === 'Pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#28a745' }]}
                  onPress={() => updateStatus(item.appointment_id, 'Approved')}
                >
                  <Text style={styles.btnText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#dc3545' }]}
                  onPress={() => updateStatus(item.appointment_id, 'Cancelled')}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 15 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  service: { fontWeight: 'bold', color: '#007AFF', fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 6,
    padding: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default ManageAppointments;
