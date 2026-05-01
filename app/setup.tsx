import { useprofileStore } from "@/profileStore";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SetupScreen() {
  const { setProfile, setLogin } = useprofileStore();

  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const getTourist = async () => {
    setLoading(true);
    if (!pass || !id) {
      Alert.alert("Please fill in required fields: Id and Password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://smart-tourist-safety-mgx9.onrender.com/api/tourists/getatourist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );
      let { data } = await res.json();
      console.log(data);

      if (data.legth === 0) {
        Alert.alert("Invalid Id or Tourist is not registered!");
      } else {
        let profile = {
          name: data[0].name,
          passport: data[0].passportId,
          nationality: data[0].nationality,
          phone: data[0].touristPhone,
          id: data[0].touristId,
          contacts: [
            [data[0].emergencyContact.name, data[0].emergencyContact.phone],
          ],
          pnr: data[0].ticketInfo.pnr,
        };

        setLogin(true);
        setProfile(profile);
        router.navigate("/(tabs)");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <KeyboardAwareScrollView contentContainerClassName="flex-1 justify-center items-center px-6">
        <BlurView
          intensity={50}
          tint="systemChromeMaterialDark"
          className="w-full rounded-[28px] overflow-hidden p-6 border border-white/15"
        >
          <Text className="text-white text-4xl font-bold text-center mb-8">
            Log In
          </Text>

          <Text className="mb-2 text-white font-semibold">Tourist ID</Text>

          <TextInput
            className="bg-white/90 rounded-xl px-6 p-4 mb-5 font-medium"
            value={id}
            onChangeText={setId}
            placeholder="Enter your Tourist Id"
          />

          <Text className="mb-2 text-white font-semibold">Password</Text>

          <View className="relative">
            <TextInput
              className=" bg-white/90 rounded-xl px-6 p-4 mb-5 font-medium"
              value={pass}
              onChangeText={setPass}
              placeholder="Enter password"
              secureTextEntry={!showPass}
            />

            <TouchableOpacity
              className="absolute top-4 right-4"
              onPress={() => {
                setShowPass((prev) => !prev);
              }}
            >
              {showPass && <FontAwesome5 name="eye" size={20} color="gray" />}
              {!showPass && (
                <FontAwesome5 name="eye-slash" size={20} color="gray" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={getTourist}
            className="mt-5 rounded-xl bg-purple-600 py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Log In</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
