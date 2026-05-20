const { config } = require("dotenv");
const appJson = require("./app.json");

config();

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const googleIosUrlScheme = googleIosClientId.endsWith(".apps.googleusercontent.com")
  ? `com.googleusercontent.apps.${googleIosClientId.slice(0, -".apps.googleusercontent.com".length)}`
  : "";

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      package: "com.rylanloukusa.thewaitinglist",
    },
    plugins: [
      googleIosUrlScheme
        ? ["@react-native-google-signin/google-signin", { iosUrlScheme: googleIosUrlScheme }]
        : "@react-native-google-signin/google-signin",
    ],
    extra: {
      eas: {
        projectId: "1fc21b11-d445-439e-8ac1-87d440b50c21",
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: googleIosClientId,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    },
  },
};
