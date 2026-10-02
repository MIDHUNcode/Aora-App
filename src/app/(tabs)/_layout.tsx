import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const backgroundColor = isDark ? "#161622" : "#FFFFFF";
    const borderColor = isDark ? "#232533" : "#E5E5E7";

    const activeColor = "#FFA001";
    const inactiveColor = isDark ? "#A1A1AA" : "#666666";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarStyle: {
                    backgroundColor,
                    borderTopColor: borderColor,
                },

                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: "Home" }}
            />

            <Tabs.Screen
                name="search"
                options={{ title: "Search" }}
            />

            <Tabs.Screen
                name="create"
                options={{ title: "Create" }}
            />

            <Tabs.Screen
                name="bookmark"
                options={{ title: "Bookmark" }}
            />

            <Tabs.Screen
                name="profile"
                options={{ title: "Profile" }}
            />
        </Tabs>
    );
}