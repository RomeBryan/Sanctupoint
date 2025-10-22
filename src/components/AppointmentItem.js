import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';

const AppointmentItem = ({ appointment, onPress }) => {
  if (!appointment) return null;

  // Format date & time nicely
  const formattedDate = appointment.date
    ? format(new Date(appointment.date), 'MMMM dd, yyyy')
    : 'No date';
  const formattedTime = appointment.time
    ? appointment.time.slice(0, 5)
    : 'No time';

  // Status color logic
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#28a745';
      case 'completed':
        return '#6c63ff';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#f0ad4e'; // pending
    }
  };

  const statusColor = getStatusColor(appointment.status);

  return (
    <Pressable
      onPress={() => onPress && onPress(appointment)}
      android_ripple={{ color: '#e5f0ff' }}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.serviceName}>{appointment.service_type}</Text>
        <View
          style={[styles.statusContainer, { backgroundColor: statusColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {appointment.status ? appointment.status.toUpperCase() : 'PENDING'}
          </Text>
        </View>
      </View>

      {/* Date and Time */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.infoText}>{formattedDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>⏰</Text>
        <Text style={styles.infoText}>{formattedTime}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
    marginRight: 10,
  },
  statusContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 15,
    marginRight: 6,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
});

export default AppointmentItem;
