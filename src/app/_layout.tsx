import "../global.css";

import {
    Stack,
    SplashScreen,
    useRouter,
    useSegments,
} from "expo-router";

import { useFonts } from "expo-font";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { BookmarkProvider } from "../context/BookmarkContext";

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const firstSegment = segments[0];

        const inAuthGroup = firstSegment === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/login");
            return;
        }

        if (isAuthenticated && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [isAuthenticated, isLoading, segments, router]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../../assets/fonts/Poppins-ExtraBold.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <BookmarkProvider>
                <AppNavigator />
            </BookmarkProvider>
        </AuthProvider>
    );
}