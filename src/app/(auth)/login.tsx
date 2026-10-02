import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const backgroundColor = isDark ? "#161622" : "#F7F7F8";
    const cardColor = isDark ? "#232533" : "#FFFFFF";

    const textColor = isDark ? "#FFFFFF" : "#111111";
    const secondaryTextColor = isDark
        ? "#A1A1AA"
        : "#555555";
    const mutedTextColor = isDark ? "#71717A" : "#777777";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert(
                "Missing email",
                "Please enter your email address."
            );
            return;
        }

        if (!password.trim()) {
            Alert.alert(
                "Missing password",
                "Please enter your password."
            );
            return;
        }

        const success = await login(email, password);

        if (success) {
            router.replace("/(tabs)");
        } else {
            Alert.alert(
                "Login failed",
                "Invalid email or password. Please try again."
            );
        }
    };


    return (
        <View
            className="flex-1 justify-center px-6"
            style={{ backgroundColor }}
        >
            <View className="mb-10 items-center">
                <View className="h-20 w-20 items-center justify-center rounded-3xl bg-[#FFA001]">
                    <Ionicons
                        name="play"
                        size={38}
                        color="#111111"
                    />
                </View>

                <Text
                    className="mt-5 text-3xl font-bold"
                    style={{ color: textColor }}
                >
                    Welcome to Aora
                </Text>

                <Text
                    className="mt-2 text-center text-sm"
                    style={{ color: secondaryTextColor }}
                >
                    Sign in to continue watching and sharing
                    videos.
                </Text>
            </View>

            <View
                className="rounded-3xl p-5"
                style={{ backgroundColor: cardColor }}
            >
                <Text
                    className="mb-2 text-sm font-semibold"
                    style={{ color: textColor }}
                >
                    Email
                </Text>

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={mutedTextColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                        color: textColor,
                        backgroundColor,
                    }}
                    className="rounded-2xl px-4 py-4 text-base"
                />

                <Text
                    className="mb-2 mt-5 text-sm font-semibold"
                    style={{ color: textColor }}
                >
                    Password
                </Text>

                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={mutedTextColor}
                    secureTextEntry
                    style={{
                        color: textColor,
                        backgroundColor,
                    }}
                    className="rounded-2xl px-4 py-4 text-base"
                />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    className="mt-6 items-center rounded-2xl bg-[#FFA001] py-4"
                >
                    <Text className="text-base font-bold text-black">
                        Sign In
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="mt-6 flex-row items-center justify-center">
                <Text
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                >
                    Don't have an account?
                </Text>

                <TouchableOpacity
                    className="ml-2"
                    activeOpacity={0.7}
                    onPress={() => router.push("./signup")}
                >
                    <Text className="text-sm font-bold text-[#FFA001]">
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
