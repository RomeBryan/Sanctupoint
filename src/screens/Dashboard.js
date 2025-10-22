import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, totalDonations: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const [{ count: up }, { count: comp }, { data: dons }] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'Pending'),
      supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'Completed'),
      supabase.from('donations').select('amount'),
    ]);
    const total = dons?.reduce((a, d) => a + parseFloat(d.amount || 0), 0);
    setStats({ upcoming: up || 0, completed: comp || 0, totalDonations: total || 0 });
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.card}><Text>Upcoming Appointments: {stats.upcoming}</Text></View>
      <View style={styles.card}><Text>Completed Appointments: {stats.completed}</Text></View>
      <View style={styles.card}><Text>Total Donations: ₱{stats.totalDonations.toFixed(2)}</Text></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#e6f0ff', padding: 20, borderRadius: 10, marginBottom: 10 },
});
export default Dashboard;
