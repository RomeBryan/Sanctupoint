import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const AddStaff = ({ navigation }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async () => {
    if (!fullname || !email || !password || !role) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('users').insert([
      { fullname, email, password, role },
    ]);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Staff account added successfully!');
      setFullname('');
      setEmail('');
      setPassword('');
      setRole('');
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Staff Account</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        value={fullname}
        onChangeText={setFullname}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Role</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Secretary, Cashier, Priest"
        value={role}
        onChangeText={setRole}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleAddStaff}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Adding...' : 'Add Staff'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: '600', color: '#333', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default AddStaff;
