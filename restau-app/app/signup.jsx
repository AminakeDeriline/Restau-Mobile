import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Background from "./Background/Background";
import API from "../services/api";

export default function Index() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await API.post("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      console.log("Sign up response:", response.data);

      router.replace("/login");
    } catch (error) {
      console.error("Sign up failed:", error);
      const message =
        error?.response?.data?.message ||
        "Something went wrong while creating your account. Please try again.";
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
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contain}>
              <View style={styles.content}>
                <Text style={styles.headerTitle}>Sign Up</Text>
                <Text style={styles.Text1}>
                  Create your account to get started
                </Text>
              </View>

              {serverError ? (
                <View style={styles.serverErrorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#C0392B" />
                  <Text style={styles.serverErrorText}>{serverError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Username</Text>
              <View
                style={[
                  styles.input,
                  errors.username ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#F67D20"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor="#aaa"
                  style={styles.box}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors((prev) => ({ ...prev, username: "" }));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username ? (
                <Text style={styles.fieldError}>{errors.username}</Text>
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

              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[styles.input, errors.phone ? styles.inputError : null]}
              >
                <Ionicons
                  name="call-outline"
                  size={22}
                  color="#F67D20"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Enter your phone number"
                  placeholderTextColor="#aaa"
                  style={styles.box}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }
                  }}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone ? (
                <Text style={styles.fieldError}>{errors.phone}</Text>
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
                onPress={handleSignUp}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.button}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            </View>

            {/** LOGIN LINK */}
            <View style={styles.loginRow}>
              <Text style={styles.loginRowText}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginRowLink}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* GUEST BUTTON */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/Homescreen")}
              style={{ marginTop: 20 }}
            >
              <Text style={styles.guest}>
                Continue as{" "}
                <Text style={{ color: "#F67D20", fontWeight: "bold" }}>
                  Guest
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
  
  welcomText: {
    fontSize: 30,
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
    //marginTop: 12,
    lineHeight: 26,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "62%",
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
    marginBottom: 12,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginRowText: {
    fontSize: 16,
    color: "#666",
  },
  loginRowLink: {
    fontSize: 16,
    color: "#F67D20",
    fontWeight: "bold",
  },
  guest: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 15,
  },
  box: {
    flex: 1,
    marginLeft: 15,
    height: "100%",
  },
});