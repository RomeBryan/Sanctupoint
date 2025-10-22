import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // ✅ Check if username or email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      Alert.alert('Error', 'Username or email already exists.');
      setLoading(false);
      return;
    }

    // ✅ Insert new user record
    const { error } = await supabase.from('users').insert([
      {
        username,
        password, // ⚠️ For production: hash this with bcrypt
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        role: 'User',
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create SanctuPoint Account</Text>

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
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontWeight: '500' },
});

export default Register;
