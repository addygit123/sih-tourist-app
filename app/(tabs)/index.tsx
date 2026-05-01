import { useprofileStore } from "@/profileStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Blur,
  Canvas,
  Circle,
  Image,
  RadialGradient,
  useImage,
} from "@shopify/react-native-skia";
import * as Battery from "expo-battery";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SMS from "expo-sms";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useRef, useState } from "react";
import type { EmitterSubscription } from "react-native";
import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import RNShake from "react-native-shake";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

TaskManager.defineTask("getnewlocation", async ({ data, error }) => {
  console.log("working...");

  if (error) {
    console.log(error);
    Location.stopLocationUpdatesAsync("getnewlocation");
    return;
  }
  const net = (await Network.getNetworkStateAsync()).isInternetReachable;
  let cord = data!.locations[0].coords;
  let newloc: Location.LocationGeocodedAddress[] | string | null = [];

  if (net) {
    newloc = await Location.reverseGeocodeAsync({
      latitude: cord.latitude,
      longitude: cord.longitude,
    });
    newloc = newloc[0].formattedAddress;
  }

  DeviceEventEmitter.emit("newlocation", [
    newloc,
    cord.latitude,
    cord.longitude,
    useprofileStore.getState().profile.id,
  ]);

  console.log(cord.latitude, cord.longitude);
});

const Index = () => {
  const sos = useImage(require("@/assets/images/sos.png"));
  const timer = useRef<number | null>(null);
  const [lastLocation, setLastLocation] = useState<string | null>("");
  const [tourist, setTourist] = useState("");
  const [fetchnow, setFetchNow] = useState(false);
  const [showmodal, setShowModal] = useState(false);
  const [time, setTimer] = useState(0);
  const [id, setId] = useState("");
  const { profile, setProfile, setCoords } = useprofileStore();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const contacts = profile?.contacts ?? [];
  const isTimerActive = useRef(false);

  const sendsms = async () => {
    await fetch(
      `https://smart-tourist-safety-mgx9.onrender.com/api/tourists/makeunsafe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      },
    );

    const isAvailable = await SMS.isAvailableAsync();

    if (isAvailable) {
      let { contacts } = profile;
      if (contacts !== null) {
        const parsed = profile.contacts.map((item: string[]) => {
          return item[1];
        });
        await SMS.sendSMSAsync(
          parsed,
          `${tourist} is in danger, last know location is : ${lastLocation}`,
        );
      } else {
        Alert.alert("NNo emergency contacts available");
      }
    } else {
      Alert.alert("No sms available..");
    }
  };

  const startTimer = () => {
    console.log(":;;;;;;;; NUMBER OF HITS ;;;;;;");

    if (isTimerActive.current) return;
    Vibration.vibrate();
    if (contacts.length === 0) {
      Alert.alert("No emergency contacts available");
      return;
    }
    setShowModal(true);
    isTimerActive.current = true;
    setTimer(5);

    timer.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          sendsms();
          setShowModal(false);
          clearInterval(timer.current!);
          isTimerActive.current = false;
          timer.current = 0;
          Vibration.cancel();
          return 0;
        } else return prev - 1;
      });
    }, 1000);
  };

  const startTimerRef = useRef(startTimer);

  useEffect(() => {
    startTimerRef.current = startTimer;
  });

  const canceltimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    setShowModal(false);
    isTimerActive.current = false;
    setTimer(0);
  };

  const fetchnew = async () => {
    setFetchNow(true);
    try {
      const loc = await Location.getCurrentPositionAsync();
      const add = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setLastLocation(add[0].formattedAddress);
    } finally {
      setFetchNow(false);
    }
  };

  const getprofile = async () => {
    if (profile !== null) {
      setTourist(profile.name);
      setId(profile.id);
    }
  };

  const fetchh = async () => {
    const loc = await Location.getCurrentPositionAsync();
    const add = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    setLastLocation(add[0].formattedAddress);
  };

  useEffect(() => {
    const setup = async () => {
      let { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") {
        Alert.alert("location was denied");
        return;
      }

      let { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") {
        Alert.alert("background location was denied");
      }

      await getprofile();
      await fetchh();
      await Location.startLocationUpdatesAsync("getnewlocation", {
        deferredUpdatesDistance: 5,
        foregroundService: {
          notificationTitle: "Tracking Location",
          notificationBody: "Location is being used in background",
          notificationColor: "#0000FF",
        },
      });
      console.log("task started");
    };
    setup();

    const subscription: EmitterSubscription = RNShake.addListener(() => {
      console.log("::::::::::: Shake detected! ::::::::::::::::::::::::");
      startTimerRef.current();
    });

    const sub = DeviceEventEmitter.addListener(
      "newlocation",
      async (data: string[]) => {
        //address, lat, longn, id
        setLastLocation(data[0]);
        console.log("at emitter...");
        setCoords(data[1], data[2]);
        const t = await SecureStore.getItemAsync("cached");
        let cache = null;
        if (t !== null) {
          cache = JSON.parse(t);
        }
        console.log("location cache : ", cache);

        const network = (await Network.getNetworkStateAsync())
          .isInternetReachable;
        if (network) {
          const blevel = await Battery.getBatteryLevelAsync();
          console.log("network availbe..");

          const send = {
            id: data[3],
            lat: data[1],
            long: data[2],
            blevel,
            network,
            cache: cache,
          };

          const res = await fetch(
            `https://smart-tourist-safety-mgx9.onrender.com/api/tourists/updatelocation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(send),
            },
          );

          if (cache !== null) {
            await SecureStore.deleteItemAsync("cached");
          }
        } else {
          if (cache === null) cache = [];
          const o = [data[1], data[2]];
          cache = [...cache, o];
          cache = JSON.stringify(cache);
          console.log("updating cache...");

          await SecureStore.setItemAsync("cached", cache);
        }
      },
    );

    return () => {
      console.log("leaving");
      subscription.remove();

      return sub.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#5c51f7]">
      <LinearGradient
        colors={["#1A1C37", "#25204D", "#1E1B3A", "#15172B"]}
        className="absolute inset-0"
      />
      <View className="absolute top-0 -left-10 w-56 h-56 rounded-full bg-purple-400/8 blur-3xl" />

      <View className="absolute top-32 -right-10 w-56 h-56 rounded-full bg-blue-400/8 blur-3xl" />

      <View className="absolute bottom-20 left-10 w-44 h-44 rounded-full bg-indigo-400/6 blur-3xl" />

      <View className="px-6 pt-4 pb-5 border-b border-white/10">
        <Text className="text-white text-3xl font-bold tracking-tight">
          Raahi AI
        </Text>
        <Text className="text-white/60 mt-1">
          Explore safely, travel smarter ✨
        </Text>
      </View>

      <View className="flex-1 px-5 pt-5">
        <View className="mb-5">
          <Text className="text-white/70 text-sm">Welcome back</Text>
          <Text className="text-white text-3xl font-semibold mt-1">
            Hello, {tourist} 👋
          </Text>
        </View>

        <View className="rounded-3xl border border-purple-400/25 bg-white/5 px-5 py-4 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-purple-300 font-semibold text-sm tracking-wide">
              CURRENT LOCATION
            </Text>

            <TouchableOpacity
              onPress={fetchnew}
              className="w-10 h-10 rounded-full bg-white/8 border border-white/10 items-center justify-center"
            >
              <MaterialIcons name="refresh" size={20} color="#C084FC" />
            </TouchableOpacity>
          </View>

          <Text className="text-white/80 leading-6 text-[15px]">
            {lastLocation === "" ? "Updating location..." : lastLocation}
          </Text>
        </View>

        <View className="items-center justify-center mt-2">
          <View className="absolute w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />
          <View className="absolute w-52 h-52 rounded-full bg-blue-500/20 blur-3xl" />

          <View className="relative items-center justify-center">
            <Canvas style={{ width: screenWidth, height: 240 }}>
              <Circle cx={screenWidth / 2} cy={120} r={92}>
                <RadialGradient
                  c={{ x: screenWidth / 2, y: 120 }}
                  r={150}
                  colors={["#A855F7", "#3B82F6", "rgba(255,255,255,0.1)"]}
                />
                <Blur blur={8} />
              </Circle>

              <Image
                image={sos}
                x={screenWidth / 2 - 82}
                y={120 - 82}
                width={164}
                height={164}
                fit="contain"
              />
            </Canvas>

            <TouchableOpacity
              onPress={startTimer}
              style={{
                width: 164,
                height: 164,
                borderRadius: 999,
                position: "absolute",
                top: 120,
                left: screenWidth / 2,
                transform: [{ translateX: -82 }, { translateY: -82 }],
              }}
            />
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-4">
          <Text className="text-center text-white/85 font-medium">
            {contacts.length === 0
              ? "⚠️ Add Emergency Contacts"
              : `✅ ${contacts.length} contacts will be notified`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/chat")}
        className="absolute bottom-8 right-6 bg-[#6d3bf6] rounded-full p-2"
      >
        <ExpoImage
          style={{
            width: 70,
            height: 70,
            borderRadius: 999,
          }}
          source={require("../../assets/images/bot2.gif")}
        />
      </TouchableOpacity>

      <Modal transparent visible={showmodal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="w-full rounded-3xl bg-[#171A30] border border-white/10 p-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-purple-300">
                Sending Alert in {time}s
              </Text>

              <TouchableOpacity onPress={canceltimer}>
                <Text className="text-red-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Index;
