import React from "react";
import { StyleSheet, View } from "react-native";
import AdminNavbarLinks from "./AdminNavbarLinks";

const Layout = ({ children }) => {
  return (
    <View style={styles.container}>
      <AdminNavbarLinks />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
});

export default Layout;
