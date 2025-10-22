import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Login = ({ navigation }) => {
  const { setUser, setRole } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter your username and password.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      Alert.alert('Login Failed', 'Invalid username or password.');
      return;
    }

    // ✅ Save session in AuthContext
    setUser(data);
    setRole(data.role);

    Alert.alert('Welcome', `${data.first_name} ${data.last_name} (${data.role})`);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SanctuPoint Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontWeight: '500' },
});

export default Login;
