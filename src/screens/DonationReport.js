import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const DonationReport = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAmount: 0, totalDonors: 0 });

  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('donations').select('*').order('donation_date', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const totalAmount = data.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const uniqueDonors = new Set(data.map((d) => d.donor_name)).size;

    setStats({ totalAmount, totalDonors: uniqueDonors });
    setDonations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();

    const subscription = supabase
      .channel('donations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchDonations)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading donation report...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Donation Summary</Text>

      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Donations</Text>
          <Text style={styles.cardValue}>₱{stats.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Donors</Text>
          <Text style={styles.cardValue}>{stats.totalDonors}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Donations</Text>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.donation_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.donor_name || 'Anonymous'}</Text>
              <Text style={styles.desc}>{item.description || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>₱{item.amount}</Text>
              <Text style={styles.date}>
                {new Date(item.donation_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: '#eaf2ff',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cardLabel: { color: '#555', fontSize: 14 },
  cardValue: { color: '#007AFF', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  name: { fontSize: 15, fontWeight: 'bold', color: '#007AFF' },
  desc: { color: '#555' },
  amount: { fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#888' },
});

export default DonationReport;
