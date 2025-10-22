import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const BookAppointment = ({ route, navigation }) => {
  // ✅ Pre-fill selected service if navigated from ServiceDetails
  const preselectedService = route.params?.selectedService || null;

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  // 🔹 Fetch all services (if not preselected)
  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('service_name');
    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load services.');
    } else {
      setServices(data);
    }
    setLoadingServices(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 🔹 Insert appointment to Supabase
  const handleBookAppointment = async () => {
    if (!selectedService) {
      Alert.alert('Missing Data', 'Please select a service.');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = time.toTimeString().split(' ')[0];

    setLoading(true);

    const { error } = await supabase.from('appointments').insert([
      {
        date: formattedDate,
        time: formattedTime,
        service_type: selectedService.service_name,
        status: 'Pending',
        created_by: 1, // 🔧 Replace with actual logged-in user id (useAuth later)
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Appointment booked successfully!');
      navigation.navigate('AppointmentList');
    }
  };

  // 🔹 Handle loading state
  if (loadingServices) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>

      {/* 🔹 Service Selection */}
      <Text style={styles.label}>Select a Service</Text>
      {services.length === 0 ? (
        <Text style={styles.infoText}>No services available.</Text>
      ) : (
        services.map((service) => (
          <TouchableOpacity
            key={service.service_id}
            style={[
              styles.serviceButton,
              selectedService?.service_id === service.service_id && styles.serviceSelected,
            ]}
            onPress={() => setSelectedService(service)}
          >
            <Text style={styles.serviceName}>{service.service_name}</Text>
            {service.description ? (
              <Text style={styles.serviceDesc}>{service.description}</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}

      {/* 🔹 Date Picker */}
      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* 🔹 Time Picker */}
      <Text style={styles.label}>Select Time</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          onChange={(e, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      {/* 🔹 Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleBookAppointment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Booking...' : 'Book Appointment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  infoText: { color: '#777', fontStyle: 'italic', marginTop: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  serviceButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
  },
  serviceSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  serviceName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  serviceDesc: { color: '#666', fontSize: 14, marginTop: 3 },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});

export default BookAppointment;
