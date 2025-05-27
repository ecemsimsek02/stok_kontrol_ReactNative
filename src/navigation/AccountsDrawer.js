import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomersScreen from '../views/CustomersScreen';
import ProfileScreen from '../views/ProfileScreen';
import VendorsScreen from '../views/VendorsScreen';

const Drawer = createDrawerNavigator();

const AccountsDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerLabelStyle: { marginLeft: -15 },
      }}
    >
      <Drawer.Screen
        name="Profiles"
        component={ProfileScreen}
        options={{
          drawerLabel: 'Profiller',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="account" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          drawerLabel: 'Müşteriler',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Vendors"
        component={VendorsScreen}
        options={{
          drawerLabel: 'Satıcılar',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="truck" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default AccountsDrawer;