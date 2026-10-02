import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { ID, storage, tablesDB } from "../../lib/appwrite";

type VideoInfo = {
    uri: string;
    fileName?: string | null;
    fileSize?: number | null;
    duration?: number;
    width?: number;
    height?: number;
    mimeType?: string | null;
};

function formatFileSize(bytes?: number | null) {
    if (!bytes) {
        return "Unknown size";
    }

    const mb = bytes / (1024 * 1024);

    return `${mb.toFixed(2)} MB`;
}

function formatDuration(seconds?: number) {
    if (!seconds) {
        return "Unknown duration";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

/* Video Preview Component */
function VideoPreview({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = false;
    });

    return (
        <View className="overflow-hidden rounded-2xl bg-black">
            <VideoView
                player={player}
                style={{
                    width: "100%",
                    height: 220,
                }}
                contentFit="contain"
                nativeControls
            />
        </View>
    );
}

export default function CreateScreen() {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [video, setVideo] = useState<VideoInfo | null>(null);
    const [category, setCategory] = useState("Technology");
    const [isPublishing, setIsPublishing] = useState(false);

    /* Theme */
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const backgroundColor = isDark ? "#161622" : "#F7F7F8";
    const cardColor = isDark ? "#232533" : "#FFFFFF";
    const borderColor = isDark ? "#343545" : "#E5E5E7";

    const textColor = isDark ? "#FFFFFF" : "#111111";
    const secondaryTextColor = isDark ? "#A1A1AA" : "#555555";
    const mutedTextColor = isDark ? "#71717A" : "#777777";

    /* Select Video */
    const handleSelectVideo = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                "Permission required",
                "Please allow photo and video access to select a video."
            );

            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["videos"],
            allowsEditing: false,
            quality: 1,
        });

        if (result.canceled) {
            return;
        }

        const selectedVideo = result.assets[0];

        setVideo({
            uri: selectedVideo.uri,
            fileName: selectedVideo.fileName,
            fileSize: selectedVideo.fileSize,
            duration: selectedVideo.duration
                ? selectedVideo.duration / 1000
                : undefined,
            width: selectedVideo.width,
            height: selectedVideo.height,
            mimeType: selectedVideo.mimeType,
        });
    };

    /* Remove Video */
    const handleRemoveVideo = () => {
        setVideo(null);
    };

    /* Publish */
    const handlePublish = async () => {
        if (!video) {
            Alert.alert(
                "No video",
                "Please select a video before publishing."
            );

            return;
        }

        if (!title.trim()) {
            Alert.alert(
                "Missing title",
                "Please enter a video title."
            );

            return;
        }

        try {
            setIsPublishing(true);

            /*
             * Step 1:
             * Upload the actual video file to Appwrite Storage.
             */
            const fileName =
                video.fileName ||
                `video-${Date.now()}.mp4`;

            const fileType =
                video.mimeType || "video/mp4";

            const fileSize = video.fileSize || 0;

            console.log("📤 Uploading video...");

            const uploadedFile = await storage.createFile({
                bucketId: "videos",
                fileId: ID.unique(),
                file: {
                    name: fileName,
                    type: fileType,
                    size: fileSize,
                    uri: video.uri,
                },
            });

            console.log(
                "✅ Video uploaded:",
                uploadedFile.$id
            );

            /*
             * Step 2:
             * Create video metadata row in Appwrite TablesDB.
             *
             * We currently use a fallback image because
             * Expo Go's generated thumbnail URI cannot be
             * read by the React Native Appwrite uploader.
             */
            const videoId = ID.unique();

            console.log("📝 Saving video metadata...");

            await tablesDB.createRow({
                databaseId: "aora-db",
                tableId: "videos",
                rowId: ID.unique(),
                data: {
                    videoId,
                    userId: user?.id || "",
                    title: title.trim(),
                    creator: user?.name || "Aora User",
                    views: "0 views",
                    time: "Just now",
                    image:
                        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000",
                    description:
                        description.trim() ||
                        "No description provided.",
                    category,
                    videoFileId: uploadedFile.$id,
                },
            });

            console.log("✅ Video metadata saved");

            Alert.alert(
                "Published successfully",
                "Your video has been uploaded and published."
            );

            /* Reset form */
            setTitle("");
            setDescription("");
            setCategory("Technology");
            setVideo(null);
        } catch (error) {
            console.error(
                "❌ Video publishing failed:",
                error
            );

            Alert.alert(
                "Upload failed",
                "Something went wrong while uploading your video. Please try again."
            );
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <View
            className="flex-1"
            style={{ backgroundColor }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <View className="pb-6 pt-14">
                    <Text
                        className="text-3xl font-bold"
                        style={{ color: textColor }}
                    >
                        Create
                    </Text>

                    <Text
                        className="mt-1 text-sm"
                        style={{ color: secondaryTextColor }}
                    >
                        Upload and share your video
                    </Text>
                </View>

                {/* Video Section */}
                {video ? (
                    <View>
                        <VideoPreview uri={video.uri} />

                        {/* Change / Remove */}
                        <View className="mt-3 flex-row">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSelectVideo}
                                className="mr-3 flex-1 flex-row items-center justify-center rounded-xl py-3"
                                style={{
                                    backgroundColor: cardColor,
                                }}
                            >
                                <Ionicons
                                    name="swap-horizontal"
                                    size={19}
                                    color={textColor}
                                />

                                <Text
                                    className="ml-2 font-semibold"
                                    style={{
                                        color: textColor,
                                    }}
                                >
                                    Change Video
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleRemoveVideo}
                                className="flex-row items-center justify-center rounded-xl px-5 py-3"
                                style={{
                                    backgroundColor: cardColor,
                                }}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={19}
                                    color="#ff6b6b"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* File Information */}
                        <View
                            className="mt-4 rounded-2xl p-4"
                            style={{
                                backgroundColor: cardColor,
                            }}
                        >
                            <Text
                                className="mb-3 text-base font-semibold"
                                style={{
                                    color: textColor,
                                }}
                            >
                                Video Information
                            </Text>

                            <View
                                className="flex-row justify-between border-b pb-3"
                                style={{
                                    borderBottomColor: borderColor,
                                }}
                            >
                                <Text
                                    className="text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    File
                                </Text>

                                <Text
                                    className="ml-4 flex-1 text-right text-sm"
                                    style={{
                                        color: textColor,
                                    }}
                                    numberOfLines={1}
                                >
                                    {video.fileName ||
                                        "Selected video"}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-3">
                                <Text
                                    className="text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    Size
                                </Text>

                                <Text
                                    className="text-sm"
                                    style={{
                                        color: textColor,
                                    }}
                                >
                                    {formatFileSize(
                                        video.fileSize
                                    )}
                                </Text>
                            </View>

                            <View
                                className="flex-row justify-between border-t pt-3"
                                style={{
                                    borderTopColor: borderColor,
                                }}
                            >
                                <Text
                                    className="text-sm"
                                    style={{
                                        color: secondaryTextColor,
                                    }}
                                >
                                    Duration
                                </Text>

                                <Text
                                    className="text-sm"
                                    style={{
                                        color: textColor,
                                    }}
                                >
                                    {formatDuration(
                                        video.duration
                                    )}
                                </Text>
                            </View>

                            {video.width &&
                                video.height ? (
                                <View
                                    className="mt-3 flex-row justify-between border-t pt-3"
                                    style={{
                                        borderTopColor:
                                            borderColor,
                                    }}
                                >
                                    <Text
                                        className="text-sm"
                                        style={{
                                            color: secondaryTextColor,
                                        }}
                                    >
                                        Resolution
                                    </Text>

                                    <Text
                                        className="text-sm"
                                        style={{
                                            color: textColor,
                                        }}
                                    >
                                        {video.width} ×{" "}
                                        {video.height}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : (
                    /* Empty Upload Area */
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSelectVideo}
                        className="h-52 items-center justify-center overflow-hidden rounded-2xl border"
                        style={{
                            backgroundColor: cardColor,
                            borderColor,
                        }}
                    >
                        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFA001]">
                            <Ionicons
                                name="cloud-upload-outline"
                                size={32}
                                color="#111111"
                            />
                        </View>

                        <Text
                            className="mt-4 text-lg font-semibold"
                            style={{
                                color: textColor,
                            }}
                        >
                            Select a video
                        </Text>

                        <Text
                            className="mt-1 text-sm"
                            style={{
                                color: secondaryTextColor,
                            }}
                        >
                            Choose a video from your device
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Publishing Account */}
                <View
                    className="mb-5 rounded-2xl p-4"
                    style={{
                        backgroundColor: cardColor,
                        borderWidth: 1,
                        borderColor,
                    }}
                >
                    <Text
                        className="text-xs"
                        style={{
                            color: mutedTextColor,
                        }}
                    >
                        Publishing as
                    </Text>

                    <View className="mt-2 flex-row items-center">
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFA001]">
                            <Text className="font-bold text-black">
                                {(user?.name || "A")
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>

                        <View className="flex-1">
                            <Text
                                className="font-semibold"
                                style={{
                                    color: textColor,
                                }}
                            >
                                {user?.name || "Aora User"}
                            </Text>

                            <Text
                                className="text-xs"
                                style={{
                                    color: secondaryTextColor,
                                }}
                                numberOfLines={1}
                            >
                                {user?.email || ""}
                            </Text>
                        </View>

                        <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#FFA001"
                        />
                    </View>
                </View>

                {/* Title */}
                <View className="mt-6">
                    <Text
                        className="mb-2 text-sm font-semibold"
                        style={{
                            color: textColor,
                        }}
                    >
                        Video Title
                    </Text>

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter your video title"
                        placeholderTextColor={
                            mutedTextColor
                        }
                        style={{
                            color: textColor,
                            backgroundColor: cardColor,
                        }}
                        className="rounded-2xl px-4 py-4 text-base"
                        maxLength={100}
                    />

                    <Text
                        className="mt-1 text-right text-xs"
                        style={{
                            color: mutedTextColor,
                        }}
                    >
                        {title.length}/100
                    </Text>
                </View>

                {/* Description */}
                <View className="mt-4">
                    <Text
                        className="mb-2 text-sm font-semibold"
                        style={{
                            color: textColor,
                        }}
                    >
                        Description
                    </Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell viewers about your video..."
                        placeholderTextColor={
                            mutedTextColor
                        }
                        multiline
                        textAlignVertical="top"
                        style={{
                            color: textColor,
                            backgroundColor: cardColor,
                        }}
                        className="h-32 rounded-2xl px-4 py-4 text-base"
                        maxLength={500}
                    />

                    <Text
                        className="mt-1 text-right text-xs"
                        style={{
                            color: mutedTextColor,
                        }}
                    >
                        {description.length}/500
                    </Text>
                </View>

                {/* Category */}
                <View className="mt-5">
                    <Text
                        className="mb-3 text-sm font-semibold"
                        style={{
                            color: textColor,
                        }}
                    >
                        Category
                    </Text>

                    <View className="flex-row flex-wrap">
                        {[
                            "Technology",
                            "Education",
                            "Coding",
                            "Entertainment",
                        ].map((item) => {
                            const selected =
                                category === item;

                            return (
                                <TouchableOpacity
                                    key={item}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setCategory(item)
                                    }
                                    className="mb-2 mr-2 rounded-xl px-4 py-2.5"
                                    style={{
                                        backgroundColor:
                                            selected
                                                ? "#FFA001"
                                                : cardColor,
                                    }}
                                >
                                    <Text
                                        className="text-sm font-medium"
                                        style={{
                                            color: selected
                                                ? "#111111"
                                                : textColor,
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Publish */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePublish}
                    disabled={isPublishing}
                    className="mt-7 items-center rounded-2xl bg-[#FFA001] py-4"
                    style={{
                        opacity: isPublishing ? 0.6 : 1,
                    }}
                >
                    <Text className="text-base font-bold text-black">
                        {isPublishing
                            ? "Publishing..."
                            : "Publish Video"}
                    </Text>
                </TouchableOpacity>

                {/* Information */}
                <Text
                    className="mt-3 text-center text-xs leading-5"
                    style={{
                        color: mutedTextColor,
                    }}
                >
                    Your video will be uploaded and processed
                    before it becomes visible to other users.
                </Text>
            </ScrollView>
        </View>
    );
}