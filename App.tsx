import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WaitingListProvider } from "./src/storage/storage";
import { RootStackParamList } from "./src/navigation/types";
import { AddEditFolderScreen } from "./src/screens/AddEditFolderScreen";
import { AddEditItemScreen } from "./src/screens/AddEditItemScreen";
import { FolderScreen } from "./src/screens/FolderScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ItemDetailScreen } from "./src/screens/ItemDetailScreen";
import { PickSomethingScreen } from "./src/screens/PickSomethingScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <WaitingListProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Folder" component={FolderScreen} />
            <Stack.Screen name="AddEditFolder" component={AddEditFolderScreen} />
            <Stack.Screen name="AddEditItem" component={AddEditItemScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="PickSomething" component={PickSomethingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WaitingListProvider>
    </SafeAreaProvider>
  );
}
