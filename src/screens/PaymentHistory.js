import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, appointments(service_type)')
      .order('payment_date', { ascending: false });
    if (!error) setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.payment_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.service}>{item.appointments?.service_type}</Text>
            <Text>Date: {item.payment_date}</Text>
            <Text>Amount: ₱{item.amount}</Text>
            <Text>Method: {item.payment_method}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  service: { color: '#007AFF', fontWeight: 'bold' },
});
export default PaymentHistory;
