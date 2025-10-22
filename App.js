import React from 'react';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth, AuthProvider } from './src/context/AuthContext';
import {View,Text,StyleSheet,} from 'react-native';
// 🧭 Screens
import AppointmentList from './src/screens/AppointmentList';
import BookAppointment from './src/screens/BookAppointment';
import ServiceList from './src/screens/ServiceList';
import ServiceDetails from './src/screens/ServiceDetails';
import Profile from './src/screens/Profile';
import DonationSummary from './src/screens/DonationSummary';
import AddStaff from './src/screens/AddStaff';
import ManageAppointments from './src/screens/ManageAppointments';
import Dashboard from './src/screens/Dashboard';
import AppointmentHistory from './src/screens/AppointmentHistory';
import PaymentHistory from './src/screens/PaymentHistory';
import AddService from './src/screens/AddService';
import EditService from './src/screens/EditService';
import ServiceDashboard from './src/screens/ServiceDashboard';
import CustomerData from './src/screens/CustomerData';
import AppointmentData from './src/screens/AppointmentData';
// Auth Screens
import Login from './src/screens/Login';
import Register from './src/screens/Register';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// 🧭 ROLE-BASED TABS
function MainTabs() {
  const { role } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faff' }}>
      {/* 🔷 App Header */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>SanctuPoint</Text>
      </View>

      {/* Tabs Below Header */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dfe8ff',
          tabBarLabelStyle: { fontWeight: 'bold', fontSize: 13 },
          tabBarStyle: {
            backgroundColor: '#007AFF',
            elevation: 5,
          },
          tabBarIndicatorStyle: { backgroundColor: '#fff', height: 3 },
          swipeEnabled: true,
        }}
      >
        {/* 👤 USER */}
        {(!role || role === 'User' || role === 'Client') && (
          <>
            <Tab.Screen name="AppointmentList" component={AppointmentList} options={{ title: 'Appointments' }} />
            <Tab.Screen name="ServiceList" component={ServiceList} options={{ title: 'Services' }} />
            <Tab.Screen name="AppointmentHistory" component={AppointmentHistory} options={{ title: 'History' }} />
            <Tab.Screen name="PaymentHistory" component={PaymentHistory} options={{ title: 'Payments' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
          </>
        )}

        {/* 🧾 STAFF */}
        {(role === 'Secretary' || role === 'Cashier' || role === 'Priest') && (
          <>
            <Tab.Screen name="ManageAppointments" component={ManageAppointments} options={{ title: 'Manage' }} />
            <Tab.Screen name="PaymentHistory" component={PaymentHistory} options={{ title: 'Payments' }} />
            <Tab.Screen name="DonationSummary" component={DonationSummary} options={{ title: 'Donations' }} />
             <Tab.Screen name="CustomerData" component={CustomerData} options={{ title: 'Customers' }} />
            <Tab.Screen name="AppointmentData" component={AppointmentData} options={{ title: 'Appointments' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
          </>
        )}

        {/* 🛠️ ADMIN */}
        {role === 'Admin' && (
          <>
            <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="AddStaff" component={AddStaff} options={{ title: 'Add Staff' }} />
            <Tab.Screen name="ManageAppointments" component={ManageAppointments} options={{ title: 'Appointments' }} />
            <Tab.Screen name="DonationSummary" component={DonationSummary} options={{ title: 'Donations' }} />
            <Tab.Screen name="ServiceDashboard" component={ServiceDashboard} options={{ title: 'Services' }} />
            <Tab.Screen name="CustomerData" component={CustomerData} options={{ title: 'Customers' }} />
            <Tab.Screen name="AppointmentData" component={AppointmentData} options={{ title: 'Appointments' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
          </>
        )}
      </Tab.Navigator>
    </View>
  );
}


// 🧱 APP NAVIGATOR
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // Could show splash screen here

  return (
    <Stack.Navigator
      initialRouteName={user ? 'MainTabs' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* 🔐 Auth Screens */}
      {!user ? (
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          {/* 🧭 Main Tabs */}
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

          {/* Booking */}
          <Stack.Screen name="BookAppointment" component={BookAppointment} options={{ title: 'Book Appointment' }} />

          {/* Services */}
          <Stack.Screen name="ServiceDetails" component={ServiceDetails} options={{ title: 'Service Details' }} />
          <Stack.Screen name="AddService" component={AddService} options={{ title: 'Add Service' }} />
          <Stack.Screen name="EditService" component={EditService} options={{ title: 'Edit Service' }} />

          {/* Admin/Analytics */}
          <Stack.Screen name="ServiceDashboard" component={ServiceDashboard} options={{ title: 'Service Dashboard' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

// 🧩 ROOT APP
function RootApp() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// 🔄 WRAP IN AUTH CONTEXT
export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
const styles = StyleSheet.create({
  appHeader: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  appTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
