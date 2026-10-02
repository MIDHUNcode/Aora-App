import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";

import { useBookmarks } from "../../context/BookmarkContext";
import { fetchVideos, type Video } from "../../services/videoService";

export default function BookmarkScreen() {
    const router = useRouter();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const backgroundColor = isDark ? "#161622" : "#F7F7F8";
    const cardColor = isDark ? "#232533" : "#FFFFFF";

    const textColor = isDark ? "#FFFFFF" : "#111111";
    const secondaryTextColor = isDark ? "#A1A1AA" : "#555555";
    const mutedTextColor = isDark ? "#71717A" : "#777777";

    const {
        bookmarkedIds,
        isBookmarked,
        toggleBookmark,
    } = useBookmarks();

    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    /* Fetch videos from Appwrite */
    useEffect(() => {
        async function loadVideos() {
            try {
                setIsLoading(true);
                setError(false);

                const data = await fetchVideos();

                setVideos(data);
            } catch (err) {
                console.error(
                    "❌ Failed to load bookmarked videos:",
                    err
                );
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadVideos();
    }, []);

    /* Filter Appwrite videos using bookmarked IDs */
    const bookmarkedVideos = videos.filter((video) =>
        bookmarkedIds.includes(video.id)
    );

    return (
        <View
            className="flex-1"
            style={{ backgroundColor }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 30,
                }}
            >
                {/* Header */}
                <View className="pb-6 pt-14">
                    <Text
                        className="text-3xl font-bold"
                        style={{ color: textColor }}
                    >
                        Bookmarks
                    </Text>

                    <Text
                        className="mt-1 text-sm"
                        style={{ color: secondaryTextColor }}
                    >
                        Videos you saved for later
                    </Text>
                </View>

                {/* Loading */}
                {isLoading ? (
                    <View className="items-center py-24">
                        <ActivityIndicator
                            size="large"
                            color="#FFA001"
                        />

                        <Text
                            className="mt-3 text-sm"
                            style={{ color: secondaryTextColor }}
                        >
                            Loading bookmarks...
                        </Text>
                    </View>
                ) : error ? (
                    /* Error */
                    <View className="items-center py-24 px-5">
                        <Ionicons
                            name="alert-circle-outline"
                            size={45}
                            color="#FFA001"
                        />

                        <Text
                            className="mt-4 text-lg font-semibold"
                            style={{ color: textColor }}
                        >
                            Unable to load bookmarks
                        </Text>

                        <Text
                            className="mt-2 text-center text-sm"
                            style={{ color: secondaryTextColor }}
                        >
                            Please check your connection and try again.
                        </Text>
                    </View>
                ) : bookmarkedVideos.length === 0 ? (
                    /* Empty State */
                    <View className="items-center py-24">
                        <View
                            className="h-20 w-20 items-center justify-center rounded-full"
                            style={{ backgroundColor: cardColor }}
                        >
                            <Ionicons
                                name="bookmark-outline"
                                size={38}
                                color="#FFA001"
                            />
                        </View>

                        <Text
                            className="mt-5 text-lg font-semibold"
                            style={{ color: textColor }}
                        >
                            No bookmarks yet
                        </Text>

                        <Text
                            className="mt-2 px-8 text-center text-sm leading-5"
                            style={{ color: secondaryTextColor }}
                        >
                            Save videos you want to watch later and
                            they will appear here.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Bookmark Count */}
                        <View
                            className="mb-5 rounded-2xl p-4"
                            style={{ backgroundColor: cardColor }}
                        >
                            <Text
                                className="text-sm"
                                style={{ color: secondaryTextColor }}
                            >
                                Saved Videos
                            </Text>

                            <Text
                                className="mt-1 text-2xl font-bold"
                                style={{ color: textColor }}
                            >
                                {bookmarkedVideos.length}
                            </Text>
                        </View>

                        {/* Saved Videos */}
                        {bookmarkedVideos.map((video) => (
                            <View
                                key={video.id}
                                className="mb-5"
                            >
                                <View className="flex-row">
                                    {/* Video */}
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        className="flex-row flex-1"
                                        onPress={() =>
                                            router.push({
                                                pathname: "/video/[id]",
                                                params: {
                                                    id: video.id,
                                                },
                                            })
                                        }
                                    >
                                        <Image
                                            source={{
                                                uri: video.image,
                                            }}
                                            className="h-24 w-36 rounded-xl"
                                            resizeMode="cover"
                                        />

                                        <View className="ml-3 flex-1 justify-center">
                                            <Text
                                                className="text-base font-semibold leading-5"
                                                style={{
                                                    color: textColor,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {video.title}
                                            </Text>

                                            <Text
                                                className="mt-2 text-sm"
                                                style={{
                                                    color: secondaryTextColor,
                                                }}
                                            >
                                                {video.creator}
                                            </Text>

                                            <Text
                                                className="mt-1 text-xs"
                                                style={{
                                                    color: mutedTextColor,
                                                }}
                                            >
                                                {video.views}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Remove Bookmark */}
                                    <View className="justify-center">
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() =>
                                                toggleBookmark(video.id)
                                            }
                                            className="p-2"
                                        >
                                            <Ionicons
                                                name={
                                                    isBookmarked(video.id)
                                                        ? "bookmark"
                                                        : "bookmark-outline"
                                                }
                                                size={22}
                                                color="#FFA001"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}