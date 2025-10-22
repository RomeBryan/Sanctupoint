import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const DonationSummary = () => {
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('donation_date', { ascending: false });

    if (error) {
      console.error('Error fetching donations:', error);
    } else {
      setDonations(data);

      // Calculate summary
      const total = data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      const count = data.length;
      setSummary({ total, count });
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDonations();

    // Real-time updates for donations
    const channel = supabase
      .channel('donations-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        (payload) => {
          console.log('Donation realtime event:', payload.eventType);
          fetchDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading donations...</Text>
      </View>
    );
  }

  const renderDonation = ({ item }) => (
    <View style={styles.donationCard}>
      <Text style={styles.donorName}>{item.donor_name}</Text>
      <Text style={styles.amount}>₱{parseFloat(item.amount).toFixed(2)}</Text>
      <Text style={styles.date}>
        {item.donation_date
          ? format(new Date(item.donation_date), 'MMM dd, yyyy')
          : 'No Date'}
      </Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donation Summary</Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Donations:</Text>
        <Text style={styles.summaryValue}>₱{summary.total.toFixed(2)}</Text>

        <Text style={[styles.summaryText, { marginTop: 10 }]}>Number of Donations:</Text>
        <Text style={styles.summaryValue}>{summary.count}</Text>
      </View>

      {/* Donations List */}
      {donations.length === 0 ? (
        <Text style={styles.empty}>No donations found.</Text>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item) => item.donation_id.toString()}
          renderItem={renderDonation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 15,
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    elevation: 3,
  },
  summaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  donationCard: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  donorName: { fontWeight: 'bold', fontSize: 16, color: '#007AFF' },
  amount: { color: '#333', fontSize: 16, marginTop: 2 },
  date: { color: '#777', fontSize: 13, marginTop: 2 },
  description: { color: '#555', fontSize: 13, marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default DonationSummary;
