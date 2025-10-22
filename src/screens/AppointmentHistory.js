import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const AppointmentHistory = ({ userId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          service:service_id (service_name)
        `)
        .eq('user_id', userId)
        .in('status', ['Completed', 'Cancelled'])
        .order('date', { ascending: false });

      if (error) throw error;
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (appointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No past appointments found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.service}>{item.service?.service_name}</Text>
      <Text style={styles.date}>{format(new Date(item.date), 'MMMM dd, yyyy')} at {item.time}</Text>
      <Text style={[styles.status, { color: item.status === 'Completed' ? 'green' : 'red' }]}>
        {item.status}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

export default AppointmentHistory;

const styles = StyleSheet.create({
  list: { padding: 20, backgroundColor: '#fff' },
  card: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  service: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { color: '#555', marginVertical: 3 },
  status: { fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: 'gray', fontSize: 16 },
});
