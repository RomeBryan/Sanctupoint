import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // 👈 added for role checking

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ServiceList = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('A-Z');

  const { role } = useAuth(); // 🔐 check user role

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('service_name', { ascending: true });
    if (error) console.error(error);
    else {
      setServices(data);
      setFilteredServices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    const subscription = supabase
      .channel('service-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchServices)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterServices(text, selectedFilter);
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
    filterServices(searchQuery, filter);
  };

  const filterServices = (query, filter) => {
    let filtered = [...services];

    // Search filter
    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.service_name.toLowerCase().includes(lower) ||
          (s.description && s.description.toLowerCase().includes(lower))
      );
    }

    // Sort filter
    switch (filter) {
      case 'A-Z':
        filtered.sort((a, b) => a.service_name.localeCompare(b.service_name));
        break;
      case 'Z-A':
        filtered.sort((a, b) => b.service_name.localeCompare(a.service_name));
        break;
      case 'Lowest Price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Highest Price':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    setFilteredServices(filtered);
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading services...</Text>
      </View>
    );

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ServiceDetails', { service: item })}
      onLongPress={() =>
        role === 'Admin' || role === 'Secretary' || role === 'Priest'
          ? navigation.navigate('EditService', { service: item })
          : null
      }
    >
      <Text style={styles.name}>{item.service_name}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {item.description}
      </Text>
      {item.price && <Text style={styles.price}>₱{item.price}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services</Text>

      {/* Search and Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
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
            <Text style={styles.modalTitle}>Sort / Filter</Text>
            {['A-Z', 'Z-A', 'Lowest Price', 'Highest Price'].map((option) => (
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

      {/* ✅ Show Add Button Only for Staff/Admin */}
      {(role === 'Admin' || role === 'Secretary' || role === 'Priest') && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddService')}
        >
          <Text style={styles.addText}>+ Add New Service</Text>
        </TouchableOpacity>
      )}

      {/* Grid List */}
      {filteredServices.length === 0 ? (
        <Text style={styles.empty}>No matching services found.</Text>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderService}
          keyExtractor={(item) => item.service_id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
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
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  addText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  row: { justifyContent: 'space-between', paddingHorizontal: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftColor: '#007AFF',
    borderLeftWidth: 4,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  desc: { color: '#555', marginTop: 4, fontSize: 13 },
  price: { color: '#333', fontWeight: 'bold', marginTop: 6, fontSize: 14 },
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

export default ServiceList;
