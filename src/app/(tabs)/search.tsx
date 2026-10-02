import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useEffect, useMemo, useState } from "react";

import {
    fetchVideos,
    type Video,
} from "../../services/videoService";

export default function SearchScreen() {
    const router = useRouter();

    /* Theme */
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const backgroundColor = isDark ? "#161622" : "#F7F7F8";
    const cardColor = isDark ? "#232533" : "#FFFFFF";

    const textColor = isDark ? "#FFFFFF" : "#111111";
    const secondaryTextColor = isDark ? "#A1A1AA" : "#555555";
    const mutedTextColor = isDark ? "#71717A" : "#777777";

    const [searchText, setSearchText] = useState("");
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    /* Load videos from Appwrite */
    useEffect(() => {
        const loadVideos = async () => {
            try {
                setIsLoading(true);
                setError(false);

                const data = await fetchVideos();

                setVideos(data);
            } catch (error) {
                console.error(
                    "Failed to load search videos:",
                    error
                );

                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadVideos();
    }, []);

    /* Filter videos */
    const filteredVideos = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        if (!query) {
            return videos;
        }

        return videos.filter(
            (video) =>
                video.title.toLowerCase().includes(query) ||
                video.creator.toLowerCase().includes(query)
        );
    }, [searchText, videos]);

    return (
        <View
            className="flex-1"
            style={{ backgroundColor }}
        >
            {/* Header */}
            <View className="px-5 pb-4 pt-14">
                <Text
                    className="text-3xl font-bold"
                    style={{ color: textColor }}
                >
                    Search
                </Text>

                <Text
                    className="mt-1 text-sm"
                    style={{ color: secondaryTextColor }}
                >
                    Find videos and creators
                </Text>
            </View>

            {/* Search Box */}
            <View
                className="mx-5 mb-5 flex-row items-center rounded-2xl px-4"
                style={{ backgroundColor: cardColor }}
            >
                <Text
                    className="mr-3 text-xl"
                    style={{ color: secondaryTextColor }}
                >
                    ⌕
                </Text>

                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search videos..."
                    placeholderTextColor={mutedTextColor}
                    className="flex-1 py-4 text-base"
                    style={{ color: textColor }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Clear Search */}
                {searchText.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchText("")}
                        className="ml-2"
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-lg"
                            style={{ color: secondaryTextColor }}
                        >
                            ✕
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Loading */}
            {isLoading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color="#FFA001"
                    />

                    <Text
                        className="mt-3 text-sm"
                        style={{ color: secondaryTextColor }}
                    >
                        Loading videos...
                    </Text>
                </View>
            )}

            {/* Error */}
            {!isLoading && error && (
                <View className="flex-1 items-center justify-center px-6">
                    <Text
                        className="text-center text-base"
                        style={{ color: textColor }}
                    >
                        Unable to load videos.
                    </Text>

                    <Text
                        className="mt-2 text-center text-sm"
                        style={{ color: secondaryTextColor }}
                    >
                        Please check your internet connection and try again.
                    </Text>
                </View>
            )}

            {/* Video List */}
            {!isLoading && !error && (
                <FlatList
                    data={filteredVideos}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 30,
                    }}
                    ListHeaderComponent={
                        <Text
                            className="mb-4 text-lg font-semibold"
                            style={{ color: textColor }}
                        >
                            {searchText
                                ? `${filteredVideos.length} result${
                                      filteredVideos.length !== 1
                                          ? "s"
                                          : ""
                                  }`
                                : "Latest Videos"}
                        </Text>
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Text className="text-4xl">
                                🔍
                            </Text>

                            <Text
                                className="mt-4 text-lg font-semibold"
                                style={{ color: textColor }}
                            >
                                No videos found
                            </Text>

                            <Text
                                className="mt-2 text-center text-sm"
                                style={{
                                    color: secondaryTextColor,
                                }}
                            >
                                Try searching for another video or creator.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="mb-5 flex-row"
                            onPress={() =>
                                router.push({
                                    pathname: "/video/[id]",
                                    params: {
                                        id: item.id,
                                    },
                                })
                            }
                        >
                            {/* Thumbnail */}
                            <Image
                                source={{ uri: item.image }}
                                className="h-24 w-36 rounded-xl"
                                resizeMode="cover"
                            />

                            {/* Video Information */}
                            <View className="ml-3 flex-1 justify-center">
                                <Text
                                    className="text-base font-semibold leading-5"
                                    style={{ color: textColor }}
                                    numberOfLines={2}
                                >
                                    {item.title}
                                </Text>

                                <Text
                                    className="mt-2 text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    {item.creator}
                                </Text>

                                <Text
                                    className="mt-1 text-xs"
                                    style={{
                                        color: mutedTextColor,
                                    }}
                                >
                                    {item.views}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}