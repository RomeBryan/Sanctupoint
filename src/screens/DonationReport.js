import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const DonationReport = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchDonations = async () => {
    const { data, error } = await supabase.from('donations').select('*').order('donation_date', { ascending: false });
    if (!error) {
      setDonations(data);
      const totalSum = data.reduce((acc, d) => acc + parseFloat(d.amount || 0), 0);
      setTotal(totalSum);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDonations(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donation Summary</Text>
      <Text style={styles.total}>Total Donations: ₱{total.toFixed(2)}</Text>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.donation_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.donor}>{item.donor_name}</Text>
            <Text>₱{item.amount}</Text>
            <Text>{new Date(item.donation_date).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 10 },
  total: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginVertical: 10 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  donor: { fontWeight: 'bold' },
});
export default DonationReport;
