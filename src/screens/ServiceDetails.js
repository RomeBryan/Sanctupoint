import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ServiceDetails = ({ route, navigation }) => {
  const { service } = route.params;

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Service not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 💙 Header Section */}
      <View style={styles.headerCard}>
        <Ionicons name="information-circle-outline" size={40} color="#007AFF" />
        <Text style={styles.title}>{service.service_name}</Text>
      </View>

      {/* 📋 Details Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About This Service</Text>
        <Text style={styles.description}>
          {service.description || 'No description available for this service.'}
        </Text>
      </View>

      {/* 💰 Price Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Service Fee</Text>
        <View style={styles.priceRow}>
          <Ionicons name="cash-outline" size={22} color="#007AFF" />
          <Text style={styles.priceText}>
            {service.price ? `₱${service.price.toFixed(2)}` : 'Free'}
          </Text>
        </View>
      </View>

      {/* 🕒 Duration (if available) */}
      {service.duration && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.detailText}>{service.duration}</Text>
        </View>
      )}

      {/* 📅 Action Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BookAppointment', { selectedService: service })}
      >
        <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.buttonText}>Book This Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9ff',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#eaf2ff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ServiceDetails;
