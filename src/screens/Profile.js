import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Profile = ({ navigation }) => {
  const { user, setUser, setRole } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole(null);
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>No user session.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔷 Header */}
      <View style={styles.profileHeader}>
     
        <Text style={styles.name}>
          {user.first_name} {user.last_name}
        </Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      {/* 🪪 Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user.phone_number}</Text>
        </View>
      </View>

      {/* 🚪 Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
    alignItems: 'center',
    paddingTop: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  role: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    fontStyle: 'italic',
  },
  infoCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  label: {
    fontWeight: '600',
    color: '#444',
  },
  value: {
    color: '#333',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    width: '60%',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { color: '#777' },
});

export default Profile;
