import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { fetchMyVideos, type Video } from "../../services/videoService";
import {
  getFollowerCount,
  getFollowingCount,
} from "../../services/followService";

export default function ProfileScreen() {
  const router = useRouter();

  const { user, logout } = useAuth();

  /* Theme */

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

  /* State */

  const [myVideos, setMyVideos] =
    useState<Video[]>([]);

  const [followerCount, setFollowerCount] =
    useState(0);

  const [followingCount, setFollowingCount] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  /* Load Profile Data */

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const [
          videos,
          followers,
          following,
        ] = await Promise.all([
          fetchMyVideos(user.id),
          getFollowerCount(user.id),
          getFollowingCount(user.id),
        ]);

        setMyVideos(videos);
        setFollowerCount(followers);
        setFollowingCount(following);
      } catch (error) {
        console.error(
          "❌ Failed to load profile data:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  /* Logout */

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();

            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  /* No User */

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor,
        }}
      >
        <Text
          style={{
            color: textColor,
          }}
        >
          Please login to view your profile.
        </Text>
      </View>
    );
  }

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
          paddingBottom: 40,
        }}
      >
        {/* Header */}

        <View className="items-center px-5 pt-12">

          {/* Avatar */}

          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#FFA001]">
            <Text className="text-4xl font-bold text-black">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          {/* Name */}

          <Text
            className="mt-4 text-2xl font-bold"
            style={{
              color: textColor,
            }}
          >
            {user.name}
          </Text>

          {/* Role */}

          <Text
            className="mt-1 text-sm"
            style={{
              color: secondaryTextColor,
            }}
          >
            MERN Stack Developer
          </Text>

          {/* Email */}

          <Text
            className="mt-2 text-sm"
            style={{
              color: secondaryTextColor,
            }}
          >
            {user.email}
          </Text>

          {/* Bio */}

          <Text
            className="mt-4 px-5 text-center leading-6"
            style={{
              color: secondaryTextColor,
            }}
          >
            Building modern web and mobile
            applications with React, React Native
            and Node.js.
          </Text>
        </View>

        {/* Statistics */}

        <View
          className="mx-5 mt-8 flex-row rounded-2xl px-4 py-5"
          style={{
            backgroundColor: cardColor,
          }}
        >
          {/* Videos */}

          <View className="flex-1 items-center">
            <Text
              className="text-xl font-bold"
              style={{
                color: textColor,
              }}
            >
              {myVideos.length}
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{
                color: secondaryTextColor,
              }}
            >
              Videos
            </Text>
          </View>

          {/* Divider */}

          <View className="w-px bg-zinc-700" />

          {/* Followers */}

          <View className="flex-1 items-center">
            <Text
              className="text-xl font-bold"
              style={{
                color: textColor,
              }}
            >
              {followerCount}
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{
                color: secondaryTextColor,
              }}
            >
              Followers
            </Text>
          </View>

          {/* Divider */}

          <View className="w-px bg-zinc-700" />

          {/* Following */}

          <View className="flex-1 items-center">
            <Text
              className="text-xl font-bold"
              style={{
                color: textColor,
              }}
            >
              {followingCount}
            </Text>

            <Text
              className="mt-1 text-xs"
              style={{
                color: secondaryTextColor,
              }}
            >
              Following
            </Text>
          </View>
        </View>

        {/* Loading */}

        {isLoading && (
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
              Loading profile...
            </Text>
          </View>
        )}

        {/* My Videos */}

        {!isLoading && (
          <View className="mt-8 px-5">

            <View className="flex-row items-center justify-between">
              <Text
                className="text-xl font-bold"
                style={{
                  color: textColor,
                }}
              >
                My Videos
              </Text>

              <Text
                className="text-sm"
                style={{
                  color: secondaryTextColor,
                }}
              >
                {myVideos.length} videos
              </Text>
            </View>

            {myVideos.length === 0 ? (
              <View
                className="mt-5 items-center rounded-2xl px-5 py-10"
                style={{
                  backgroundColor: cardColor,
                }}
              >
                <Ionicons
                  name="videocam-outline"
                  size={45}
                  color="#71717A"
                />

                <Text
                  className="mt-3 text-base font-semibold"
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
                  Upload your first video
                  to see it here.
                </Text>
              </View>
            ) : (
              <View className="mt-5">
                {myVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/video/[id]",
                        params: {
                          id: video.id,
                        },
                      })
                    }
                    className="mb-4 rounded-2xl p-4"
                    style={{
                      backgroundColor:
                        cardColor,
                    }}
                  >
                    <View className="flex-row items-center">

                      {/* Video Icon */}

                      <View className="h-16 w-24 items-center justify-center rounded-xl bg-zinc-800">
                        <Ionicons
                          name="play-circle-outline"
                          size={35}
                          color="#FFA001"
                        />
                      </View>

                      {/* Video Info */}

                      <View className="ml-4 flex-1">
                        <Text
                          numberOfLines={2}
                          className="text-base font-semibold"
                          style={{
                            color: textColor,
                          }}
                        >
                          {video.title}
                        </Text>

                        <Text
                          className="mt-2 text-xs"
                          style={{
                            color:
                              secondaryTextColor,
                          }}
                        >
                          {video.views} •{" "}
                          {video.time}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#71717A"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Account */}

        <View className="mt-8 px-5">
          <Text
            className="mb-3 text-lg font-bold"
            style={{
              color: textColor,
            }}
          >
            Account
          </Text>

          <View
            className="rounded-2xl"
            style={{
              backgroundColor: cardColor,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color={secondaryTextColor}
              />

              <Text
                className="ml-4 flex-1 text-base"
                style={{
                  color: textColor,
                }}
              >
                Edit Profile
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#71717A"
              />
            </TouchableOpacity>

            <View className="mx-5 h-px bg-zinc-700" />

            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              activeOpacity={0.7}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={secondaryTextColor}
              />

              <Text
                className="ml-4 flex-1 text-base"
                style={{
                  color: textColor,
                }}
              >
                Settings
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#71717A"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}

        <View className="mt-6 px-5">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center justify-center rounded-2xl py-4"
            style={{
              backgroundColor: "#EF4444",
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text className="ml-2 font-semibold text-white">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}

        <Text
          className="mt-6 text-center text-xs"
          style={{
            color: secondaryTextColor,
          }}
        >
          Aora • Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}