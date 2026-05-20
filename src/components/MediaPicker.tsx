import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AppButton } from "./AppButton";

interface MediaPickerProps {
  onMediaSelected: (uri: string, type: "image" | "video") => void;
  initialUri?: string;
  style?: any;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ onMediaSelected, initialUri, style }) => {
  const [selectedUri, setSelectedUri] = useState<string | undefined>(initialUri);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();

  const pickImage = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setSelectedUri(uri);
        setMediaType("image");
        onMediaSelected(uri, "image");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setIsLoading(false);
    }
  }, [onMediaSelected]);

  const pickVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setSelectedUri(uri);
        setMediaType("video");
        onMediaSelected(uri, "video");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video");
    } finally {
      setIsLoading(false);
    }
  }, [onMediaSelected]);

  const clearMedia = useCallback(() => {
    setSelectedUri(undefined);
    setMediaType(undefined);
  }, []);

  return (
    <View style={style}>
      {selectedUri && mediaType === "image" && <Image source={{ uri: selectedUri }} style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 12 }} />}

      {selectedUri && mediaType === "video" && (
        <View style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 12, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>Video: {selectedUri.split("/").pop()}</Text>
        </View>
      )}

      {isLoading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} />}

      {!selectedUri && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <AppButton label="Pick Image" onPress={pickImage} variant="secondary" style={{ flex: 1 }} />
          <AppButton label="Pick Video" onPress={pickVideo} variant="secondary" style={{ flex: 1 }} />
        </View>
      )}

      {selectedUri && (
        <AppButton label="Clear & Pick Again" onPress={clearMedia} variant="secondary" style={{ marginBottom: 12 }} />
      )}
    </View>
  );
};
