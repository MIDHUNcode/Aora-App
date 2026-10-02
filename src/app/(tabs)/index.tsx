import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { useBookmarks } from "../../context/BookmarkContext";

import {
    fetchVideos,
    type Video,
} from "../../services/videoService";

import {
    getFollowingUserIds,
} from "../../services/followService";

import {
    getVideoLikes,
    hasUserLikedVideo,
    likeVideo,
    unlikeVideo,
} from "../../services/likeService";

import {
    getVideoCommentCount,
} from "../../services/commentService";

import { getThumbnailUrl } from "../../lib/appwrite";

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();

    const { user } = useAuth();

    const {
        isBookmarked,
        toggleBookmark,
    } = useBookmarks();

    const isDark = colorScheme === "dark";

    const textColor = isDark
        ? "#FFFFFF"
        : "#111111";

    const secondaryTextColor = isDark
        ? "#A1A1AA"
        : "#555555";

    const mutedTextColor = isDark
        ? "#71717A"
        : "#777777";

    const backgroundColor = isDark
        ? "#161622"
        : "#F7F7F8";

    const cardColor = isDark
        ? "#232533"
        : "#FFFFFF";

    const borderColor = isDark
        ? "#292938"
        : "#E5E5E7";

    const [videos, setVideos] =
        useState<Video[]>([]);

    const [followingUserIds, setFollowingUserIds] =
        useState<string[]>([]);

    const [activeFeed, setActiveFeed] =
        useState<"discover" | "following">(
            "discover"
        );

    const [isLoading, setIsLoading] =
        useState(true);

    const [isFollowingLoading, setIsFollowingLoading] =
        useState(false);

    const [error, setError] =
        useState(false);

    /*
     * Like state
     */
    const [likeCounts, setLikeCounts] =
        useState<Record<string, number>>({});

    const [likedVideos, setLikedVideos] =
        useState<Record<string, boolean>>({});

    const [likeLoading, setLikeLoading] =
        useState<Record<string, boolean>>({});

    /*
     * Comment state
     */
    const [commentCounts, setCommentCounts] =
        useState<Record<string, number>>({});

    /*
     * Load videos
     */
    useEffect(() => {
        const loadVideos = async () => {
            try {
                setIsLoading(true);
                setError(false);

                const formattedVideos =
                    await fetchVideos();

                setVideos(formattedVideos);
            } catch (error) {
                console.error(
                    "Failed to load videos:",
                    error
                );

                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadVideos();
    }, []);

    /*
     * Load followed creators
     */
    useEffect(() => {
        const loadFollowingUsers = async () => {
            if (!user?.id) {
                setFollowingUserIds([]);
                return;
            }

            try {
                setIsFollowingLoading(true);

                const ids =
                    await getFollowingUserIds(
                        user.id
                    );

                setFollowingUserIds(ids);
            } catch (error) {
                console.error(
                    "❌ Failed to load following users:",
                    error
                );

                setFollowingUserIds([]);
            } finally {
                setIsFollowingLoading(false);
            }
        };

        loadFollowingUsers();
    }, [user?.id]);

    /*
     * Load like data
     */
    useEffect(() => {
        const loadLikeData = async () => {
            if (videos.length === 0) {
                return;
            }

            try {
                const counts: Record<
                    string,
                    number
                > = {};

                const liked: Record<
                    string,
                    boolean
                > = {};

                await Promise.all(
                    videos.map(async (video) => {
                        const count =
                            await getVideoLikes(
                                video.id
                            );

                        counts[video.id] = count;

                        if (user?.id) {
                            const isLiked =
                                await hasUserLikedVideo(
                                    video.id,
                                    user.id
                                );

                            liked[video.id] =
                                isLiked;
                        } else {
                            liked[video.id] =
                                false;
                        }
                    })
                );

                setLikeCounts(counts);
                setLikedVideos(liked);
            } catch (error) {
                console.error(
                    "❌ Failed to load like data:",
                    error
                );
            }
        };

        loadLikeData();
    }, [videos, user?.id]);

    /*
     * Load comment counts
     */
    useEffect(() => {
        const loadCommentCounts = async () => {
            if (videos.length === 0) {
                return;
            }

            try {
                const counts: Record<
                    string,
                    number
                > = {};

                await Promise.all(
                    videos.map(async (video) => {
                        const count =
                            await getVideoCommentCount(
                                video.id
                            );

                        counts[video.id] =
                            count;
                    })
                );

                setCommentCounts(counts);
            } catch (error) {
                console.error(
                    "❌ Failed to load comment counts:",
                    error
                );
            }
        };

        loadCommentCounts();
    }, [videos]);

    /*
     * Like / Unlike
     */
    const handleLike = async (
        videoId: string
    ) => {
        if (!user?.id) {
            Alert.alert(
                "Login required",
                "Please log in to like videos."
            );

            return;
        }

        if (likeLoading[videoId]) {
            return;
        }

        try {
            setLikeLoading((current) => ({
                ...current,
                [videoId]: true,
            }));

            const isLiked =
                likedVideos[videoId] || false;

            if (isLiked) {
                await unlikeVideo(
                    videoId,
                    user.id
                );

                setLikedVideos((current) => ({
                    ...current,
                    [videoId]: false,
                }));

                setLikeCounts((current) => ({
                    ...current,
                    [videoId]: Math.max(
                        0,
                        (current[videoId] || 0) - 1
                    ),
                }));
            } else {
                await likeVideo(
                    videoId,
                    user.id
                );

                setLikedVideos((current) => ({
                    ...current,
                    [videoId]: true,
                }));

                setLikeCounts((current) => ({
                    ...current,
                    [videoId]:
                        (current[videoId] || 0) + 1,
                }));
            }
        } catch (error) {
            console.error(
                "❌ Failed to update like:",
                error
            );

            Alert.alert(
                "Like failed",
                "Unable to update your like. Please try again."
            );
        } finally {
            setLikeLoading((current) => ({
                ...current,
                [videoId]: false,
            }));
        }
    };

    /*
     * Filter videos
     */
    const displayedVideos =
        activeFeed === "discover"
            ? videos
            : videos.filter(
                  (video) =>
                      video.userId &&
                      followingUserIds.includes(
                          video.userId
                      )
              );

    return (
        <View
            className="flex-1"
            style={{
                backgroundColor,
            }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
                <View>
                    <Text
                        className="text-3xl font-bold"
                        style={{
                            color: textColor,
                        }}
                    >
                        Aora
                    </Text>

                    <Text
                        className="mt-1 text-sm"
                        style={{
                            color: secondaryTextColor,
                        }}
                    >
                        Discover something new
                    </Text>
                </View>

                {/* Search */}
                <TouchableOpacity
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{
                        backgroundColor: cardColor,
                    }}
                    onPress={() =>
                        router.push("/search")
                    }
                >
                    <Text
                        className="text-xl"
                        style={{
                            color: textColor,
                        }}
                    >
                        ⌕
                    </Text>
                </TouchableOpacity>
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
                        style={{
                            color: secondaryTextColor,
                        }}
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
                        style={{
                            color: textColor,
                        }}
                    >
                        Unable to load videos.
                    </Text>

                    <Text
                        className="mt-2 text-center text-sm"
                        style={{
                            color: secondaryTextColor,
                        }}
                    >
                        Please check your internet
                        connection and try again.
                    </Text>
                </View>
            )}

            {/* Feed */}
            {!isLoading && !error && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 30,
                    }}
                >
                    <Text
                        className="mb-4 mt-2 text-xl font-semibold"
                        style={{
                            color: textColor,
                        }}
                    >
                        Videos
                    </Text>

                    {/* Feed Filter */}
                    <View className="mb-5 flex-row">
                        {/* Discover */}
                        <TouchableOpacity
                            onPress={() =>
                                setActiveFeed(
                                    "discover"
                                )
                            }
                            activeOpacity={0.8}
                            className="mr-3 rounded-xl px-5 py-3"
                            style={{
                                backgroundColor:
                                    activeFeed ===
                                    "discover"
                                        ? "#FFA001"
                                        : cardColor,
                            }}
                        >
                            <Text
                                className="font-semibold"
                                style={{
                                    color:
                                        activeFeed ===
                                        "discover"
                                            ? "#000000"
                                            : textColor,
                                }}
                            >
                                Discover
                            </Text>
                        </TouchableOpacity>

                        {/* Following */}
                        <TouchableOpacity
                            onPress={() =>
                                setActiveFeed(
                                    "following"
                                )
                            }
                            activeOpacity={0.8}
                            className="rounded-xl px-5 py-3"
                            style={{
                                backgroundColor:
                                    activeFeed ===
                                    "following"
                                        ? "#FFA001"
                                        : cardColor,
                            }}
                        >
                            <Text
                                className="font-semibold"
                                style={{
                                    color:
                                        activeFeed ===
                                        "following"
                                            ? "#000000"
                                            : textColor,
                                }}
                            >
                                Following
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Following Loading */}
                    {activeFeed === "following" &&
                        isFollowingLoading && (
                            <View className="items-center py-10">
                                <ActivityIndicator
                                    size="small"
                                    color="#FFA001"
                                />

                                <Text
                                    className="mt-3 text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    Loading your following feed...
                                </Text>
                            </View>
                        )}

                    {/* Empty Following */}
                    {activeFeed === "following" &&
                        !isFollowingLoading &&
                        displayedVideos.length ===
                            0 && (
                            <View
                                className="items-center rounded-2xl px-6 py-10"
                                style={{
                                    backgroundColor:
                                        cardColor,
                                }}
                            >
                                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#FFA001]">
                                    <Ionicons
                                        name="people-outline"
                                        size={30}
                                        color="#000000"
                                    />
                                </View>

                                <Text
                                    className="text-center text-lg font-semibold"
                                    style={{
                                        color: textColor,
                                    }}
                                >
                                    No videos yet
                                </Text>

                                <Text
                                    className="mt-2 text-center text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    Follow creators to see
                                    their videos here.
                                </Text>

                                <TouchableOpacity
                                    className="mt-5 rounded-xl px-5 py-3"
                                    style={{
                                        backgroundColor:
                                            "#FFA001",
                                    }}
                                    onPress={() =>
                                        setActiveFeed(
                                            "discover"
                                        )
                                    }
                                >
                                    <Text className="font-semibold text-black">
                                        Discover Creators
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    {/* Empty Discover */}
                    {activeFeed === "discover" &&
                        displayedVideos.length ===
                            0 && (
                            <View
                                className="items-center rounded-2xl px-6 py-10"
                                style={{
                                    backgroundColor:
                                        cardColor,
                                }}
                            >
                                <Text
                                    className="text-lg font-semibold"
                                    style={{
                                        color: textColor,
                                    }}
                                >
                                    No videos available
                                </Text>

                                <Text
                                    className="mt-2 text-center text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    Be the first to publish
                                    a video on Aora.
                                </Text>
                            </View>
                        )}

                    {/* Videos */}
                    {!isFollowingLoading &&
                        displayedVideos.map(
                            (video) => (
                                <View
                                    key={video.id}
                                    className="mb-6"
                                >
                                    {/* Video Card */}
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() =>
                                            router.push({
                                                pathname:
                                                    "/video/[id]",
                                                params: {
                                                    id: video.id,
                                                },
                                            })
                                        }
                                    >
                                        {/* Thumbnail */}
                                        <View
                                            className="overflow-hidden rounded-2xl"
                                            style={{
                                                backgroundColor:
                                                    cardColor,
                                            }}
                                        >
                                            <Image
                                                source={{
                                                    uri: video.thumbnailFileId
                                                        ? getThumbnailUrl(
                                                              video.thumbnailFileId
                                                          )
                                                        : video.image,
                                                }}
                                                className="h-52 w-full"
                                                resizeMode="cover"
                                            />

                                            {/* Play */}
                                            <View className="absolute inset-0 items-center justify-center">
                                                <View className="h-14 w-14 items-center justify-center rounded-full bg-black/60">
                                                    <Text className="ml-1 text-2xl text-white">
                                                        ▶
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Video Information */}
                                        <View className="mt-3 flex-row">
                                            {/* Creator Avatar */}
                                            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#FFA001]">
                                                <Text className="font-bold text-black">
                                                    {video.creator
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </Text>
                                            </View>

                                            <View className="flex-1">
                                                <Text
                                                    className="text-base font-semibold"
                                                    style={{
                                                        color: textColor,
                                                    }}
                                                    numberOfLines={
                                                        2
                                                    }
                                                >
                                                    {
                                                        video.title
                                                    }
                                                </Text>

                                                <Text
                                                    className="mt-1 text-sm"
                                                    style={{
                                                        color: secondaryTextColor,
                                                    }}
                                                >
                                                    {
                                                        video.creator
                                                    }
                                                </Text>

                                                <Text
                                                    className="mt-1 text-xs"
                                                    style={{
                                                        color: mutedTextColor,
                                                    }}
                                                >
                                                    {
                                                        video.views
                                                    }{" "}
                                                    •{" "}
                                                    {
                                                        video.time
                                                    }
                                                </Text>
                                            </View>

                                            {/* More */}
                                            <TouchableOpacity
                                                className="px-2"
                                                activeOpacity={
                                                    0.7
                                                }
                                            >
                                                <Text
                                                    className="text-xl"
                                                    style={{
                                                        color: secondaryTextColor,
                                                    }}
                                                >
                                                    •••
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Actions */}
                                    <View
                                        className="mt-3 flex-row border-b pb-4"
                                        style={{
                                            borderBottomColor:
                                                borderColor,
                                        }}
                                    >
                                        {/* Like */}
                                        <TouchableOpacity
                                            className="mr-6 flex-row items-center"
                                            activeOpacity={
                                                0.7
                                            }
                                            disabled={
                                                likeLoading[
                                                    video.id
                                                ]
                                            }
                                            onPress={() =>
                                                handleLike(
                                                    video.id
                                                )
                                            }
                                        >
                                            {likeLoading[
                                                video.id
                                            ] ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#FFA001"
                                                />
                                            ) : (
                                                <Ionicons
                                                    name={
                                                        likedVideos[
                                                            video
                                                                .id
                                                        ]
                                                            ? "heart"
                                                            : "heart-outline"
                                                    }
                                                    size={
                                                        19
                                                    }
                                                    color={
                                                        likedVideos[
                                                            video
                                                                .id
                                                        ]
                                                            ? "#FFA001"
                                                            : textColor
                                                    }
                                                />
                                            )}

                                            <Text
                                                className="ml-1 text-sm"
                                                style={{
                                                    color: likedVideos[
                                                        video.id
                                                    ]
                                                        ? "#FFA001"
                                                        : secondaryTextColor,
                                                }}
                                            >
                                                {likeCounts[
                                                    video.id
                                                ] || 0}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Comment */}
                                        <TouchableOpacity
                                            className="mr-6 flex-row items-center"
                                            activeOpacity={
                                                0.7
                                            }
                                            onPress={() =>
                                                router.push({
                                                    pathname:
                                                        "/video/[id]",
                                                    params: {
                                                        id: video.id,
                                                    },
                                                })
                                            }
                                        >
                                            <Ionicons
                                                name="chatbubble-outline"
                                                size={18}
                                                color={
                                                    textColor
                                                }
                                            />

                                            <Text
                                                className="ml-1 text-sm"
                                                style={{
                                                    color: secondaryTextColor,
                                                }}
                                            >
                                                {commentCounts[
                                                    video.id
                                                ] || 0}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Bookmark */}
                                        <TouchableOpacity
                                            className="flex-row items-center"
                                            activeOpacity={
                                                0.7
                                            }
                                            onPress={() =>
                                                toggleBookmark(
                                                    video.id
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    isBookmarked(
                                                        video.id
                                                    )
                                                        ? "bookmark"
                                                        : "bookmark-outline"
                                                }
                                                size={19}
                                                color={
                                                    isBookmarked(
                                                        video.id
                                                    )
                                                        ? "#FFA001"
                                                        : textColor
                                                }
                                            />

                                            <Text
                                                className="ml-1 text-sm"
                                                style={{
                                                    color: isBookmarked(
                                                        video.id
                                                    )
                                                        ? "#FFA001"
                                                        : secondaryTextColor,
                                                }}
                                            >
                                                {isBookmarked(
                                                    video.id
                                                )
                                                    ? "Saved"
                                                    : "Save"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        )}
                </ScrollView>
            )}
        </View>
    );
}