import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";

import { useAuth } from "../../context/AuthContext";
import { useBookmarks } from "../../context/BookmarkContext";

import {
  addComment,
  deleteComment,
  getVideoComments,
  type Comment,
} from "../../services/commentService";

import {
  getVideoLikes,
  hasUserLikedVideo,
  likeVideo,
  unlikeVideo,
} from "../../services/likeService";

import {
  followUser,
  getFollowerCount,
  isFollowing,
  unfollowUser,
} from "../../services/followService";

import {
  fetchVideos,
  type Video,
} from "../../services/videoService";

import { getVideoUrl } from "../../lib/appwrite";

export default function VideoDetailScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();

  const {
    isBookmarked,
    toggleBookmark,
  } = useBookmarks();

  /* --------------------------------------------------
     Theme
  -------------------------------------------------- */

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = isDark
    ? "#161622"
    : "#F7F7F8";

  const cardColor = isDark
    ? "#232533"
    : "#FFFFFF";

  const textColor = isDark
    ? "#FFFFFF"
    : "#111111";

  const secondaryTextColor = isDark
    ? "#A1A1AA"
    : "#555555";

  const iconColor = isDark
    ? "#FFFFFF"
    : "#111111";

  /* --------------------------------------------------
     Video state
  -------------------------------------------------- */

  const [video, setVideo] =
    useState<Video | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  /* --------------------------------------------------
     Like state
  -------------------------------------------------- */

  const [likeCount, setLikeCount] =
    useState(0);

  const [isLiked, setIsLiked] =
    useState(false);

  const [isLikeLoading, setIsLikeLoading] =
    useState(false);

  /* --------------------------------------------------
     Follow state
  -------------------------------------------------- */

  const [
    isFollowingCreator,
    setIsFollowingCreator,
  ] = useState(false);

  const [followerCount, setFollowerCount] =
    useState(0);

  const [isFollowLoading, setIsFollowLoading] =
    useState(false);

  /* --------------------------------------------------
     Comment state
  -------------------------------------------------- */

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [commentText, setCommentText] =
    useState("");

  const [isCommentLoading, setIsCommentLoading] =
    useState(false);

  const [isCommentsLoading, setIsCommentsLoading] =
    useState(false);

  /* --------------------------------------------------
     Fetch selected video
  -------------------------------------------------- */

  useEffect(() => {
    async function loadVideo() {
      try {
        setIsLoading(true);
        setError(false);

        const videos = await fetchVideos();

        const selectedVideo = videos.find(
          (item) => item.id === id
        );

        if (!selectedVideo) {
          setError(true);
          return;
        }

        setVideo(selectedVideo);
      } catch (err) {
        console.error(
          "❌ Failed to load video:",
          err
        );

        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadVideo();
    }
  }, [id]);

  /* --------------------------------------------------
     Video URL
  -------------------------------------------------- */

  const videoUrl =
    video?.videoFileId
      ? getVideoUrl(video.videoFileId)
      : null;

  /* --------------------------------------------------
     Video player
  -------------------------------------------------- */

  const player = useVideoPlayer(
    videoUrl,
    (player) => {
      player.loop = false;
    }
  );

  /* --------------------------------------------------
     Load Likes
  -------------------------------------------------- */

  useEffect(() => {
    const loadLikes = async () => {
      if (!video?.id) {
        return;
      }

      try {
        const count =
          await getVideoLikes(video.id);

        setLikeCount(count);

        if (user?.id) {
          const liked =
            await hasUserLikedVideo(
              video.id,
              user.id
            );

          setIsLiked(liked);
        }
      } catch (error) {
        console.error(
          "Failed to load likes:",
          error
        );
      }
    };

    loadLikes();
  }, [video?.id, user?.id]);

  /* --------------------------------------------------
     Like / Unlike
  -------------------------------------------------- */

  const handleLike = async () => {
    if (!user?.id) {
      Alert.alert(
        "Login required",
        "Please log in to like this video."
      );

      return;
    }

    if (!video?.id) {
      return;
    }

    try {
      setIsLikeLoading(true);

      if (isLiked) {
        await unlikeVideo(
          video.id,
          user.id
        );

        setIsLiked(false);

        setLikeCount((count) =>
          Math.max(0, count - 1)
        );
      } else {
        await likeVideo(
          video.id,
          user.id
        );

        setIsLiked(true);

        setLikeCount(
          (count) => count + 1
        );
      }
    } catch (error) {
      console.error(
        "Failed to update like:",
        error
      );

      Alert.alert(
        "Like failed",
        "Unable to update your like."
      );
    } finally {
      setIsLikeLoading(false);
    }
  };

  /* --------------------------------------------------
     Share
  -------------------------------------------------- */

  const handleShare = async () => {
    if (!video) {
      return;
    }

    try {
      await Share.share({
        title: video.title,
        message:
          `Check out "${video.title}" by ${video.creator} on Aora!\n\n` +
          `https://aora.app/video/${video.id}`,
      });
    } catch (error) {
      console.error(
        "❌ Failed to share video:",
        error
      );
    }
  };

  /* --------------------------------------------------
     Load Follow Data
  -------------------------------------------------- */

  useEffect(() => {
    const loadFollowData = async () => {
      if (!video?.userId) {
        return;
      }

      try {
        const count =
          await getFollowerCount(
            video.userId
          );

        setFollowerCount(count);

        if (user?.id) {
          const following =
            await isFollowing(
              user.id,
              video.userId
            );

          setIsFollowingCreator(following);
        }
      } catch (error) {
        console.error(
          "❌ Failed to load follow data:",
          error
        );
      }
    };

    loadFollowData();
  }, [video?.userId, user?.id]);

  /* --------------------------------------------------
     Follow / Unfollow
  -------------------------------------------------- */

  const handleFollow = async () => {
    if (!user?.id) {
      Alert.alert(
        "Login required",
        "Please log in to follow this creator."
      );

      return;
    }

    if (!video?.userId) {
      return;
    }

    if (user.id === video.userId) {
      Alert.alert(
        "Your video",
        "You cannot follow yourself."
      );

      return;
    }

    try {
      setIsFollowLoading(true);

      if (isFollowingCreator) {
        await unfollowUser(
          user.id,
          video.userId
        );

        setIsFollowingCreator(false);

        setFollowerCount((count) =>
          Math.max(0, count - 1)
        );
      } else {
        await followUser(
          user.id,
          video.userId
        );

        setIsFollowingCreator(true);

        setFollowerCount(
          (count) => count + 1
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to update follow:",
        error
      );

      Alert.alert(
        "Follow failed",
        "Unable to update your follow. Please try again."
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  /* --------------------------------------------------
     Load Comments
  -------------------------------------------------- */

  useEffect(() => {
    if (!video?.id) {
      return;
    }

    const loadComments = async () => {
      try {
        setIsCommentsLoading(true);

        const videoComments =
          await getVideoComments(
            video.id
          );

        setComments(videoComments);
      } catch (error) {
        console.error(
          "❌ Failed to load comments:",
          error
        );
      } finally {
        setIsCommentsLoading(false);
      }
    };

    loadComments();
  }, [video?.id]);

  /* --------------------------------------------------
     Add Comment
  -------------------------------------------------- */

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert(
        "Login required",
        "Please log in to comment."
      );

      return;
    }

    if (!video?.id) {
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setIsCommentLoading(true);

      const newComment =
        await addComment(
          video.id,
          user.id,
          user.name,
          commentText.trim()
        );

      setComments((current) => [
        newComment,
        ...current,
      ]);

      setCommentText("");
    } catch (error) {
      console.error(
        "❌ Failed to add comment:",
        error
      );

      Alert.alert(
        "Comment failed",
        "Unable to add your comment. Please try again."
      );
    } finally {
      setIsCommentLoading(false);
    }
  };

  /* --------------------------------------------------
     Delete Comment
  -------------------------------------------------- */

  const handleDeleteComment = async (
    commentId: string
  ) => {
    try {
      await deleteComment(commentId);

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId
        )
      );
    } catch (error) {
      console.error(
        "❌ Failed to delete comment:",
        error
      );

      Alert.alert(
        "Delete failed",
        "Unable to delete the comment."
      );
    }
  };

  /* --------------------------------------------------
     Loading screen
  -------------------------------------------------- */

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor,
        }}
      >
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
          Loading video...
        </Text>
      </View>
    );
  }

  /* --------------------------------------------------
     Error screen
  -------------------------------------------------- */

  if (error || !video) {
    return (
      <View
        className="flex-1 items-center justify-center px-5"
        style={{
          backgroundColor,
        }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color="#FFA001"
        />

        <Text
          className="mt-4 text-xl font-bold"
          style={{
            color: textColor,
          }}
        >
          Video not found
        </Text>

        <Text
          className="mt-2 text-center"
          style={{
            color: secondaryTextColor,
          }}
        >
          We couldn't find the video
          you're looking for.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-[#FFA001] px-6 py-3"
        >
          <Text className="font-semibold text-black">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* --------------------------------------------------
     Main screen
  -------------------------------------------------- */

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor,
      }}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {/* Back Button */}

        <View className="absolute left-5 top-14 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* --------------------------------------------------
            Video Player
        -------------------------------------------------- */}

        <View className="h-64 w-full bg-black">
          {video.videoFileId ? (
            <VideoView
              player={player}
              style={{
                width: "100%",
                height: "100%",
              }}
              nativeControls
              contentFit="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons
                name="videocam-outline"
                size={50}
                color="#71717A"
              />

              <Text className="mt-3 text-sm text-zinc-400">
                Video file not available
              </Text>
            </View>
          )}
        </View>

        {/* --------------------------------------------------
            Content
        -------------------------------------------------- */}

        <View className="px-5 pt-5">

          {/* Title */}

          <Text
            className="text-xl font-bold leading-7"
            style={{
              color: textColor,
            }}
          >
            {video.title}
          </Text>

          {/* Views */}

          <Text
            className="mt-2 text-sm"
            style={{
              color: secondaryTextColor,
            }}
          >
            {video.views} • {video.time}
          </Text>

          {/* --------------------------------------------------
              Creator
          -------------------------------------------------- */}

          <View className="mt-5 flex-row items-center">

            {/* Avatar */}

            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-[#FFA001]">
              <Text className="text-lg font-bold text-black">
                {video.creator
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            {/* Creator Info */}

            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{
                  color: textColor,
                }}
              >
                {video.creator}
              </Text>

              <Text
                className="text-sm"
                style={{
                  color: secondaryTextColor,
                }}
              >
                MERN Stack Developer
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{
                  color: secondaryTextColor,
                }}
              >
                {followerCount}{" "}
                {followerCount === 1
                  ? "follower"
                  : "followers"}
              </Text>
            </View>

            {/* Follow Button */}

            <TouchableOpacity
              onPress={handleFollow}
              disabled={isFollowLoading}
              activeOpacity={0.7}
              className="rounded-xl px-5 py-2.5"
              style={{
                backgroundColor:
                  isFollowingCreator
                    ? cardColor
                    : "#FFA001",
              }}
            >
              {isFollowLoading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    isFollowingCreator
                      ? iconColor
                      : "#000000"
                  }
                />
              ) : (
                <Text
                  className="font-semibold"
                  style={{
                    color:
                      isFollowingCreator
                        ? textColor
                        : "#000000",
                  }}
                >
                  {isFollowingCreator
                    ? "Following"
                    : "Follow"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* --------------------------------------------------
              Actions
          -------------------------------------------------- */}

          <View
            className="mt-6 flex-row items-center justify-between rounded-2xl px-5 py-4"
            style={{
              backgroundColor: cardColor,
            }}
          >

            {/* Like */}

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isLikeLoading}
              onPress={handleLike}
              className="items-center"
            >
              <Ionicons
                name={
                  isLiked
                    ? "heart"
                    : "heart-outline"
                }
                size={24}
                color={
                  isLiked
                    ? "#FF4D67"
                    : "#71717A"
                }
              />

              <Text
                className="mt-1 text-xs"
                style={{
                  color: isLiked
                    ? "#FF4D67"
                    : "#71717A",
                }}
              >
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* Comment shortcut */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                // Scroll position can be handled
                // naturally by the user.
              }}
              className="items-center"
            >
              <Ionicons
                name="chatbubble-outline"
                size={23}
                color={iconColor}
              />

              <Text
                className="mt-1 text-xs"
                style={{
                  color: secondaryTextColor,
                }}
              >
                {comments.length}
              </Text>
            </TouchableOpacity>

            {/* Share */}

            <TouchableOpacity
              className="items-center"
              activeOpacity={0.7}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={23}
                color={iconColor}
              />

              <Text
                className="mt-1 text-xs"
                style={{
                  color: secondaryTextColor,
                }}
              >
                Share
              </Text>
            </TouchableOpacity>

            {/* Save */}

            <TouchableOpacity
              className="items-center"
              activeOpacity={0.7}
              onPress={() =>
                toggleBookmark(video.id)
              }
            >
              <Ionicons
                name={
                  isBookmarked(video.id)
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={23}
                color={
                  isBookmarked(video.id)
                    ? "#FFA001"
                    : iconColor
                }
              />

              <Text
                className="mt-1 text-xs"
                style={{
                  color: isBookmarked(video.id)
                    ? "#FFA001"
                    : secondaryTextColor,
                }}
              >
                {isBookmarked(video.id)
                  ? "Saved"
                  : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* --------------------------------------------------
              Description
          -------------------------------------------------- */}

          <View className="mt-6">
            <Text
              className="text-lg font-semibold"
              style={{
                color: textColor,
              }}
            >
              Description
            </Text>

            <Text
              className="mt-3 leading-6"
              style={{
                color: secondaryTextColor,
              }}
            >
              {video.description}
            </Text>
          </View>

          {/* --------------------------------------------------
              Comments
          -------------------------------------------------- */}

          <View className="mt-8 w-full">

            {/* Comment Heading */}

            <Text
              className="text-xl font-semibold"
              style={{
                color: textColor,
              }}
            >
              Comments ({comments.length})
            </Text>

            {/* Comment Input */}

            <View className="mt-4 w-full">
              <View
                className={`w-full flex-row rounded-2xl ${
                  isDark
                    ? "bg-zinc-900"
                    : "bg-zinc-100"
                }`}
              >
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write a comment..."
                  placeholderTextColor={
                    isDark
                      ? "#71717A"
                      : "#A1A1AA"
                  }
                  editable={!isCommentLoading}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={`flex-1 px-4 py-3 ${
                    isDark
                      ? "text-white"
                      : "text-black"
                  }`}
                  style={{
                    minHeight: 90,
                  }}
                />

                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={
                    isCommentLoading ||
                    !commentText.trim()
                  }
                  className="mr-2 h-10 w-10 self-end items-center justify-center rounded-full"
                  style={{
                    marginBottom: 10,
                    backgroundColor:
                      isCommentLoading ||
                      !commentText.trim()
                        ? "#71717A"
                        : "#FF9C01",
                  }}
                >
                  {isCommentLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="send"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Comment List */}

            {isCommentsLoading ? (
              <View className="mt-8 items-center">
                <ActivityIndicator
                  size="small"
                  color="#FFA001"
                />

                <Text
                  className="mt-2 text-sm"
                  style={{
                    color: secondaryTextColor,
                  }}
                >
                  Loading comments...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="mt-8 items-center rounded-2xl border border-dashed border-zinc-700 px-5 py-8">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={35}
                  color="#71717A"
                />

                <Text
                  className="mt-3 text-center"
                  style={{
                    color: secondaryTextColor,
                  }}
                >
                  No comments yet.
                </Text>

                <Text
                  className="mt-1 text-center text-sm"
                  style={{
                    color: isDark
                      ? "#71717A"
                      : "#999999",
                  }}
                >
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              <View className="mt-5 w-full">
                {comments.map(
                  (comment) => (
                    <View
                      key={comment.id}
                      className={`mb-4 w-full rounded-2xl p-5 ${
                        isDark
                          ? "bg-zinc-900"
                          : "bg-white"
                      }`}
                    >
                      {/* Comment Header */}

                      <View className="flex-row items-center justify-between">

                        <View className="flex-1 flex-row items-center">

                          {/* Avatar */}

                          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFA001]">
                            <Text className="font-bold text-black">
                              {comment.userName
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </View>

                          {/* User Name */}

                          <View className="flex-1">
                            <Text
                              className="text-base font-semibold"
                              style={{
                                color: textColor,
                              }}
                            >
                              {comment.userName}
                            </Text>

                            <Text
                              className="mt-1 text-xs"
                              style={{
                                color:
                                  secondaryTextColor,
                              }}
                            >
                              {new Date(
                                comment.createdAt
                              ).toLocaleString()}
                            </Text>
                          </View>
                        </View>

                        {/* Delete */}

                        {user?.id ===
                          comment.userId && (
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteComment(
                                comment.id
                              )
                            }
                            className="ml-3 h-9 w-9 items-center justify-center rounded-full"
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Comment Text */}

                      <Text
                        className="mt-4 text-base leading-6"
                        style={{
                          color: isDark
                            ? "#D4D4D8"
                            : "#3F3F46",
                        }}
                      >
                        {comment.text}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}