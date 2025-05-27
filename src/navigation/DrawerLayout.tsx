import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BillsScreen from "../views/BillsScreen";
import CashRecordsScreen from "../views/CashBoxScreen";
import CustomersScreen from "../views/CustomersScreen";
import DashboardScreen from "../views/Dashboard/Dashboard";
import DeliveriesScreen from "../views/DeliveriesScreen";
import DisinfectantScreen from "../views/DisinfectantScreen";
import ExpenseScreen from "../views/ExpenseScreen";
import ItemsScreen from "../views/ItemsScreen";
import MaterialsScreen from "../views/MaterialsScreen";
import ProfileScreen from "../views/ProfileScreen";
import RecipeScreen from "../views/RecipeScreen";
import TransactionsScreen from "../views/TransactionsScreen";
import VendorsScreen from "../views/VendorsScreen";
import InvoicesScreen from "../views/InvoicesScreen";
const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Profiles" component={ProfileScreen} />
      <Drawer.Screen name="Customers" component={CustomersScreen} />
      <Drawer.Screen name="Vendors" component={VendorsScreen} />
      <Drawer.Screen name="CashRecords" component={CashRecordsScreen} />
      <Drawer.Screen name="Expenses" component={ExpenseScreen} />
      <Drawer.Screen name="Items" component={ItemsScreen} />
      <Drawer.Screen name="Deliveries" component={DeliveriesScreen} />
      <Drawer.Screen name="Materials" component={MaterialsScreen} />
      <Drawer.Screen name="Disinfectants" component={DisinfectantScreen} />
      <Drawer.Screen name="Recipes" component={RecipeScreen} />
      <Drawer.Screen name="Bills" component={BillsScreen} />
      <Drawer.Screen name="Transactions" component={TransactionsScreen} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} />
    </Drawer.Navigator>
  );
}

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const [showAccountsSubmenu, setShowAccountsSubmenu] = useState(false);
  const [showCashSubmenu, setShowCashSubmenu] = useState(false);
  const [showProductSubmenu, setShowProductSubmenu] = useState(false);
  const [showStockSubmenu, setShowStockSubmenu] = useState(false);
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <DrawerButton
        label="Panel"
        icon="view-dashboard"
        onPress={() => navigation.navigate("Dashboard")}
      />

      {/* Accounts Başlık */}
      <DrawerButton
        label="Accounts"
        icon="account"
        onPress={() => setShowAccountsSubmenu(!showAccountsSubmenu)}
      />
      {showAccountsSubmenu && (
        <View style={{ paddingLeft: 20 }}>
          <DrawerButton
            label="Profiller"
            icon="account-circle"
            onPress={() => navigation.navigate("Profiles")}
          />
          <DrawerButton
            label="Müşteriler"
            icon="account-group"
            onPress={() => navigation.navigate("Customers")}
          />
          <DrawerButton
            label="Satıcılar"
            icon="truck"
            onPress={() => navigation.navigate("Vendors")}
          />
        </View>
      )}

      {/* Kasa Başlık */}
      <DrawerButton
        label="Kasa"
        icon="cash"
        onPress={() => setShowCashSubmenu(!showCashSubmenu)}
      />
      {showCashSubmenu && (
        <View style={{ paddingLeft: 20 }}>
          <DrawerButton
            label="Kasa Kayıtları"
            icon="book-open-variant"
            onPress={() => navigation.navigate("CashRecords")}
          />
          <DrawerButton
            label="Harcamalar"
            icon="credit-card-remove"
            onPress={() => navigation.navigate("Expenses")}
          />
        </View>
      )}

      {/* Ürün Yönetimi Başlık */}
      <DrawerButton
        label="Ürün Yönetimi"
        icon="cube"
        onPress={() => setShowProductSubmenu(!showProductSubmenu)}
      />
      {showProductSubmenu && (
        <View style={{ paddingLeft: 20 }}>
          <DrawerButton
            label="Ürünler"
            icon="package-variant"
            onPress={() => navigation.navigate("Items")}
          />
          <DrawerButton
            label="Teslimatlar"
            icon="truck-delivery"
            onPress={() => navigation.navigate("Deliveries")}
          />
        </View>
      )}
      <DrawerButton
        label="Stok"
        icon="warehouse"
        onPress={() => setShowStockSubmenu(!showStockSubmenu)}
      />
      {showStockSubmenu && (
        <View style={{ paddingLeft: 20 }}>
          <DrawerButton
            label="Malzeme"
            icon="tools"
            onPress={() => navigation.navigate("Materials")}
          />
          <DrawerButton
            label="Dezenfektan"
            icon="spray-bottle"
            onPress={() => navigation.navigate("Disinfectants")}
          />
          <DrawerButton
            label="Tarif"
            icon="script-text-outline"
            onPress={() => navigation.navigate("Recipes")}
          />
        </View>
      )}
      <DrawerButton
        label="Faturalar" // Burada faturalar eklendi
        icon="file-document"
        onPress={() => navigation.navigate("Bills")}
      />
      <DrawerButton
        label="Siparişler" // Burada faturalar eklendi
        icon="file-document"
        onPress={() => navigation.navigate("Invoices")}
      />

      <DrawerButton
        label="Alım-Satım İşlemleri"
        icon="swap-horizontal"
        onPress={() => navigation.navigate("Transactions")}
      />
    </View>
  );
}

type DrawerButtonProps = {
  label: string;
  icon: string;
  onPress: () => void;
};

function DrawerButton({ label, icon, onPress }: DrawerButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.drawerButton}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        style={{ marginRight: 10 }}
      />
      <Text style={styles.drawerText}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
  },
  drawerText: {
    fontSize: 16,
  },
});
