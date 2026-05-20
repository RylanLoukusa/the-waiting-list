import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { WaitingListProvider } from "./src/storage/storage";
import { RootStackParamList } from "./src/navigation/types";
import { AddEditFolderScreen } from "./src/screens/AddEditFolderScreen";
import { AddEditItemScreen } from "./src/screens/AddEditItemScreen";
import { FolderScreen } from "./src/screens/FolderScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ItemDetailScreen } from "./src/screens/ItemDetailScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PickSomethingScreen } from "./src/screens/PickSomethingScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { session, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Folder" component={FolderScreen} />
            <Stack.Screen name="AddEditFolder" component={AddEditFolderScreen} />
            <Stack.Screen name="AddEditItem" component={AddEditItemScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="PickSomething" component={PickSomethingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WaitingListProvider>
          <AppNavigator />
        </WaitingListProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
