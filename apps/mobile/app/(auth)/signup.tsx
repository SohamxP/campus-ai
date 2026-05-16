import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {router} from "expo-router";
import { signup } from "../../api/auth";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      const data = await signup({
        full_name: fullName,
        email,
        password,
      });
      console.log("Signup success:", data);
      Alert.alert("Success", "Account created successfully");
      router.replace("/(auth)/login");
    } catch (error: any) {
  console.log("FULL SIGNUP ERROR:", JSON.stringify(error, null, 2));
  console.log("ERROR RESPONSE:", error?.response?.data);
  console.log("ERROR MESSAGE:", error?.message);

  Alert.alert(
    "Signup Failed",
    error?.response?.data?.message || error?.message || "Something went wrong"
  );
}
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Create Account
      </Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={{
          borderWidth: 1,
          padding: 14,
          borderRadius: 10,
        }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          padding: 14,
          borderRadius: 10,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 14,
          borderRadius: 10,
        }}
      />
      <TouchableOpacity
        onPress={handleSignup}
        style={{
          backgroundColor: "black",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}