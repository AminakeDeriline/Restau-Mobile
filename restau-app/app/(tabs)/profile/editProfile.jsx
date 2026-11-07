import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker"; //used to pick the image from your device 
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAvatarStorageKey = (email) =>
  `profile-avatar:${email.trim().toLowerCase()}`;

export default function EditProfileScreen() {
  const router = useRouter();

  // for the avatar picture
  const [avatarUri, setAvatarUri] = useState(null);

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Preference toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingComms, setMarketingComms] = useState(false);

  // Load existing profile details from AsyncStorage when the screen loads
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if ((await AsyncStorage.getItem("isGuest")) === "true") {
          // Guests cannot edit or persist profile information.
          router.replace("/(tabs)/profile");
          return;
        }

        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setFullName(parsed.username || "Jane Doe");
          setEmail(parsed.email || "janedoe@gmail.com");
          setPhone(parsed.phone || "");
          setAvatarUri(parsed.avatarUri || null);
          if (parsed.emailNotifications !== undefined) {
            setEmailNotifications(parsed.emailNotifications);
          }
          if (parsed.marketingComms !== undefined) {
            setMarketingComms(parsed.marketingComms);
          }
        }
      } catch (error) {
        console.log("Error loading user profile:", error);
      }
    };

    loadProfile();
  }, [router]);

  //image picker function 
  const handlePickerImage = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert("Permission required", "Please allow access to your photos.");
    return;
  }

  //show how th eimage comes into the profile space 
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Square box to crop an image 
    quality: 0.8,
  });
  if (!result.canceled) {
    setAvatarUri(result.assets[0].uri);
  }
  };

  // Save updated details to AsyncStorage and navigate back to ProfileScreen
  const handleSave = async () => {
    try {
      const updatedUser = {
        username: fullName,
        email: email,
        phone: phone,
        emailNotifications: emailNotifications,
        marketingComms: marketingComms,
        avatarUri:avatarUri,
      };

      // Save updated JSON string to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem(
        getAvatarStorageKey(email),
        avatarUri || ""
      );

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Avatar Display Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }} style ={styles.avatarImage} />  
              ) : (
                <Ionicons name="person" size={54} color="#ffffff" />
              ) }
             
            </View>
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickerImage}>
              <Ionicons name="camera" size={16} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{fullName || "Jane Doe"}</Text>
          <Text style={styles.userEmail}>{email || "janedoe@gmail.com"}</Text>
          <Text style={styles.subText}>
            Update your profile information and preferences
          </Text>
        </View>

        {/* Personal Information Form */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* Full Name Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          {/* Email Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
        </View>

        {/* Preferences Toggles */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Email Notifications Switch */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Email Notifications</Text>
              <Text style={styles.toggleSub}>
                Receive updates about your reservations and offers
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#e0e0e0", true: "#f5921e" }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Marketing Communications Switch */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Marketing Communications</Text>
              <Text style={styles.toggleSub}>
                Receive promotional emails and special offers
              </Text>
            </View>
            <Switch
              value={marketingComms}
              onValueChange={setMarketingComms}
              trackColor={{ false: "#e0e0e0", true: "#f5921e" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  placeholder: {
    width: 30,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ff7a00",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#e8e8e8",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  userEmail: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  subText: {
    fontSize: 13,
    color: "#999",
    marginTop: 6,
    textAlign: "center",
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
  },
  toggleSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#ff5500",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#ff5500",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#ff5500",
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
});
