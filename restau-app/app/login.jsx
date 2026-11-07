import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Background from "./Background/Background";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAvatarStorageKey = (email) =>
  `profile-avatar:${email.trim().toLowerCase()}`;

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });
      console.log("Login response:", response.data);

      // A real login must leave guest mode and remove the guest notification cache.
      await AsyncStorage.multiRemove(["isGuest", "notifications"]);

      // Save the authentication token for authenticated requests.
      await AsyncStorage.setItem("token", response.data.token);

      // Save only the profile fields needed by the profile screen.
      const loggedInUser = response.data.user;
      const storedUser = await AsyncStorage.getItem("user");
      const previousUser = storedUser ? JSON.parse(storedUser) : {};
      const avatarKey = getAvatarStorageKey(loggedInUser.email);
      const savedAvatar = await AsyncStorage.getItem(avatarKey);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          username: loggedInUser.username,
          email: loggedInUser.email,
          phone: loggedInUser.phone,
          avatarUri:
            savedAvatar ||
            (previousUser.email === loggedInUser.email
              ? previousUser.avatarUri
              : null) ||
            null,
        })
      );

      // Navigate to home screen
      router.replace("/(tabs)/Homescreen");
    } catch (error) {
      console.error("Login failed:", error);
      const message =
        error?.response?.data?.message ||
        "Incorrect email or password. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Background>
        {/**Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        {/**Title and subtitle */}
        <View style={styles.general}>
          <Text style={styles.welcomText}>Welcome to</Text>
          <Text style={styles.colorText}>DineEasy</Text>
          <Text style={styles.subtitle}>
            Reserve your table and enjoy amazing meals, anytime.
          </Text>
        </View>

        {/**Featured Cards */}
        <View style={styles.card}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.contain}>
            <View style={styles.content}>
              <Text style={styles.headerTitle}>Login</Text>
              <Text style={styles.Text1}>
                Login with your email to continue
                <Text> to DineEasy</Text>
              </Text>
            </View>

            {serverError ? (
              <View style={styles.serverErrorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#C0392B"
                />
                <Text style={styles.serverErrorText}>{serverError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Address</Text>
            <View
              style={[styles.input, errors.email ? styles.inputError : null]}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color="#F67D20"
                style={styles.icon}
              />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                style={styles.box}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}

            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.input,
                errors.password ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#F67D20"
                style={styles.icon}
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
                style={styles.box}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginbtn,
                isSubmitting ? styles.loginbtnDisabled : null,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.button}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/** SIGN UP LINK */}
            <View style={styles.signupRow}>
              <Text style={styles.signupRowText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signupRowLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* GUEST BUTTON */}
            <TouchableOpacity
              onPress={async () => {
                // Do not let Guest inherit the previous user's identity or token.
                await AsyncStorage.multiRemove([
                  "user",
                  "token",
                  "notifications",
                  "@restau/order-history",
                  "@restau/reservation-history",
                ]);
                await AsyncStorage.setItem("isGuest", "true");
                DeviceEventEmitter.emit("guest-session-started");
                router.replace("/(tabs)/Homescreen");
              }}
              style={{ marginTop: 20 }}
            >
              <Text style={styles.guest}>
                Continue as{" "}
                <Text style={{ color: "#F67D20", fontWeight: "bold" }}>
                  Guest
                </Text>
              </Text>
            </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Background>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
    resizeMode: "contain",
  },
  general: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  welcomText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  colorText: {
    fontSize: 40,
    color: "#ff6b35",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#f0f0f0",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "58%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 16,
    zIndex: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  content: {
    alignItems: "center",
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 25,
  },
  Text1: {
    paddingTop: 6,
    color: "#666",
    textAlign: "center",
  },
  serverErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEA",
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    marginBottom: 4,
    gap: 8,
  },
  serverErrorText: {
    color: "#C0392B",
    fontSize: 13,
    flex: 1,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  icon: {
    paddingLeft: 5,
  },
  fieldError: {
    color: "#E74C3C",
    fontSize: 12,
    marginTop: 4,
  },
  contain: {
    marginHorizontal: 4,
  },
  box: {
    flex: 1,
    marginLeft: 15,
    height: "100%",
  },
  loginbtn: {
    width: "100%",
    height: 44,
    marginTop: 20,
    backgroundColor: "#F67D20",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginbtnDisabled: {
    opacity: 0.7,
  },
  button: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  guest: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    color: "#888",
    paddingHorizontal: 15,
    fontSize: 14,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupRowText: {
    fontSize: 16,
    color: "#666",
  },
  signupRowLink: {
    fontSize: 16,
    color: "#F67D20",
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 32,
  },
});