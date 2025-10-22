import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const CustomerData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('user_id, first_name, last_name, email, phone_number, role')
      .order('first_name', { ascending: true });

    if (error) console.error('Error fetching users:', error);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Data</Text>
      {users.length === 0 ? (
        <Text style={styles.empty}>No users found.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.detail}>Email: {item.email}</Text>
              <Text style={styles.detail}>Phone: {item.phone_number || 'N/A'}</Text>
              <Text style={styles.role}>Role: {item.role || 'User'}</Text>
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
    backgroundColor: '#f0f6ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  detail: { fontSize: 14, color: '#333' },
  role: { fontSize: 14, color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default CustomerData;
