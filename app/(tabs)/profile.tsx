import pfp from "@/assets/images/pfp.jpeg";
import { useprofileStore } from "@/profileStore";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { profile, setLogout, setProfile, setPfp, dp } = useprofileStore();

  const out = () => {
    setLogout(false);
    setProfile(null);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const updateDb = async (uri: string) => {
    let formdata = new FormData();

    formdata.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: "test",
    });

    formdata.append("upload_preset", "sample-img");
    formdata.append("cloud_name", "dqcqijw3c");

    try {
      let res = await fetch(
        "https://api.cloudinary.com/v1_1/dqcqijw3c/image/upload",
        {
          method: "POST",
          body: formdata,
        },
      );

      let data = await res.json();
      console.log(data.secure_url);
    } catch (err) {
      console.error("failed:", err);
      return null;
    }
  };

  const opencamera = async () => {
    setModalVisible(false);

    if (!status?.granted) {
      requestPermission();
      opencamera();
    } else {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled) {
        setPfp(result.assets[0].uri);
        updateDb(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    setModalVisible(false);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPfp(result.assets[0].uri);
      updateDb(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1020]">
      <LinearGradient
        colors={["#0D1020", "#15192D", "#17162C", "#0D1020"]}
        className="absolute inset-0"
      />

      {Object.keys(profile).length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#A78BFA" />
        </View>
      ) : (
        <ScrollView
          className="w-[95%] self-center mt-3 rounded-3xl bg-white/5 border border-white/10"
          contentContainerClassName="items-center gap-8 px-5 py-8"
        >
          <View className="w-full flex-row justify-end">
            <TouchableOpacity
              className="rounded-full overflow-hidden"
              onPress={out}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1", "#3B82F6"]}
                className="p-3 rounded-full"
              >
                <MaterialCommunityIcons name="logout" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View>
            <Image
              source={dp === "" ? pfp : dp}
              alt="pfp"
              contentFit="cover"
              style={{
                width: 150,
                height: 150,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="absolute bottom-0 right-0 rounded-full overflow-hidden"
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1", "#3B82F6"]}
                className="p-3 rounded-full"
              >
                <MaterialIcons name="add-reaction" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="w-full gap-4">
            <View className="flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <Text className="text-white/60 font-semibold">Name</Text>
              <Text className="text-white text-base">{profile.name}</Text>
            </View>

            <View className="flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <Text className="text-white/60 font-semibold">Profile Id</Text>
              <Text className="text-white text-base">{profile.id}</Text>
            </View>

            <View className="flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <Text className="text-white/60 font-semibold">Contact</Text>
              <Text className="text-white text-base">{profile.phone}</Text>
            </View>

            <View className="flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <Text className="text-white/60 font-semibold">Nationality</Text>
              <Text className="text-white text-base">
                {profile.nationality}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="w-full rounded-3xl bg-[#171A30] border border-white/10 p-5 gap-4">
            <TouchableOpacity
              className="rounded-2xl overflow-hidden"
              onPress={opencamera}
            >
              <LinearGradient colors={["#8B5CF6", "#6366F1"]} className="py-4">
                <Text className="text-white text-center font-semibold">
                  Open Camera
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-2xl overflow-hidden"
              onPress={pickImage}
            >
              <LinearGradient colors={["#6366F1", "#3B82F6"]} className="py-4">
                <Text className="text-white text-center font-semibold">
                  Open Gallery
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="py-3 rounded-2xl bg-white/5 border border-white/10"
            >
              <Text className="text-red-300 text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default Profile;
