import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { MediaMetadata } from "../types/models";
import { getSignedMediaUrl } from "../lib/supabaseStorage";

interface MediaDisplayProps {
  media?: MediaMetadata;
  style?: any;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, style }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!media?.storagePath) return;

    setIsLoading(true);
    getSignedMediaUrl(media.storagePath)
      .then((url) => {
        setSignedUrl(url);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [media?.storagePath]);

  if (!media) return null;

  // External TikTok URL
  if (media.tiktokUrl) {
    return (
      <TouchableOpacity onPress={() => Linking.openURL(media.tiktokUrl!)} style={[{ marginVertical: 12 }, style]}>
        <View style={{ backgroundColor: "#000", borderRadius: 8, padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>🎵 Watch on TikTok</Text>
          <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>{media.tiktokUrl}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Stored media (image/video)
  if (media.storagePath && signedUrl) {
    if (media.mediaType === "image") {
      return <Image source={{ uri: signedUrl }} style={[{ width: "100%", height: 300, borderRadius: 8 }, style]} />;
    }

    if (media.mediaType === "video") {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(signedUrl)} style={[{ marginVertical: 12 }, style]}>
          <View style={{ backgroundColor: "#000", borderRadius: 8, height: 200, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 48 }}>▶️</Text>
            <Text style={{ color: "#aaa", fontSize: 12, marginTop: 8 }}>Tap to play video</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  if (isLoading) {
    return <ActivityIndicator size="large" style={[{ marginVertical: 12 }, style]} />;
  }

  return null;
};
