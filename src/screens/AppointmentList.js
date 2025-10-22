import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AppointmentItem from '../components/AppointmentItem';

const AppointmentList = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const fadeAnim = useState(new Animated.Value(0))[0];

  // 🔹 Fetch appointments from Supabase
  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
    } else {
      setAppointments(data);
      setFilteredAppointments(data);
    }

    setLoading(false);
    setRefreshing(false);
    fadeIn();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // 🔹 Initial load + real-time subscription
  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Realtime event:', payload.eventType);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 🔹 Reload when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchAppointments);
    return unsubscribe;
  }, [navigation]);

  // 🔹 Search & Filter logic
  const handleSearch = (text) => {
    setSearchQuery(text);
    filterAppointments(text, selectedFilter);
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
    filterAppointments(searchQuery, filter);
  };

  const filterAppointments = (query, filter) => {
    let filtered = [...appointments];

    // Search by name, service, or notes
    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.client_name && a.client_name.toLowerCase().includes(lower)) ||
          (a.service_name && a.service_name.toLowerCase().includes(lower)) ||
          (a.notes && a.notes.toLowerCase().includes(lower))
      );
    }

    // Filter by status or date
    const now = new Date();
    switch (filter) {
      case 'Upcoming':
        filtered = filtered.filter((a) => new Date(a.date) >= now);
        break;
      case 'Past':
        filtered = filtered.filter((a) => new Date(a.date) < now);
        break;
      case 'Pending':
        filtered = filtered.filter((a) => a.status?.toLowerCase() === 'pending');
        break;
      case 'Completed':
        filtered = filtered.filter((a) => a.status?.toLowerCase() === 'completed');
        break;
      default:
        break;
    }

    setFilteredAppointments(filtered);
  };

  // 🔹 Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // 🔹 Loading indicator
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Appointments</Text>
            {['All', 'Upcoming', 'Past', 'Pending', 'Completed'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedFilter === option && styles.optionSelected,
                ]}
                onPress={() => applyFilter(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFilter === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setFilterVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book New Appointment */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Text style={styles.bookText}>+ Book New Appointment</Text>
      </TouchableOpacity>

      {/* Appointments List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#ccc" />
            <Text style={styles.empty}>No matching appointments found.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.appointment_id.toString()}
            renderItem={({ item }) => <AppointmentItem appointment={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 10,
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  empty: { textAlign: 'center', color: '#888', marginTop: 8, fontSize: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  optionButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionSelected: { backgroundColor: '#e6f0ff' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextSelected: { color: '#007AFF', fontWeight: 'bold' },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
});

export default AppointmentList;
