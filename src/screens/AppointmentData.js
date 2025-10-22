import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const AppointmentData = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        date,
        time,
        service_type,
        status,
        created_by,
        users (first_name, last_name, email)
      `)
      .order('date', { ascending: false });

    if (error) console.error('Error fetching appointments:', error);
    else setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Data</Text>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>No appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.appointment_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.service}>{item.service_type}</Text>
              <Text style={styles.detail}>
                Date: {item.date} | Time: {item.time}
              </Text>
              <Text style={styles.detail}>Status: {item.status || 'Pending'}</Text>
              {item.users && (
                <Text style={styles.user}>
                  Booked by: {item.users.first_name} {item.users.last_name} ({item.users.email})
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', marginBottom: 10, textAlign: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f5f9ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  service: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  detail: { fontSize: 14, color: '#333' },
  user: { fontSize: 14, color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default AppointmentData;
