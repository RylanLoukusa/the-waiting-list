import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

type VideoPreviewContentFit = "contain" | "cover" | "fill";

interface VideoPreviewProps {
  uri: string;
  contentFit?: VideoPreviewContentFit;
  nativeControls?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ uri, contentFit = "contain", nativeControls = true, style }) => {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={nativeControls}
        contentFit={contentFit}
        fullscreenOptions={{ enable: true }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
