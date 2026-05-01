import { useprofileStore } from "@/profileStore";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const OverlayText = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <View className="absolute bottom-0 w-full px-6 p-10 mb-10" style={{ width }}>
    <BlurView
      intensity={70}
      tint="systemThickMaterialDark"
      className="w-full h-full p-5"
      style={{
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <Text className="text-white text-4xl font-extrabold mb-3">{title}</Text>
      <Text className="text-white text-base leading-6 opacity-95">
        {subtitle}
      </Text>
    </BlurView>
  </View>
);

const DoneButton = ({ ...props }) => {
  return (
    <TouchableOpacity {...props} activeOpacity={0.85}>
      <View className="px-3 py-2 mr-1 rounded-full bg-white/20 border border-white/25">
        <Text className="text-white font-bold text-sm">Get Started</Text>
      </View>
    </TouchableOpacity>
  );
};
export default function OnboardingScreen() {
  const { setOnboarded } = useprofileStore();
  const handleDone = () => {
    setOnboarded();
    router.navigate("/setup");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["bottom"]}
    >
      <Onboarding
        DoneButtonComponent={DoneButton}
        onDone={handleDone}
        bottomBarHeight={50}
        bottomBarHighlight={false}
        imageContainerStyles={{
          paddingBottom: 0,
          paddingTop: 0,
          paddingHorizontal: 0,
          marginBottom: 0,
        }}
        showNext={false}
        showSkip={false}
        pages={[
          {
            backgroundColor: "#000",
            image: (
              <Image
                contentFit="cover"
                className="w-full h-full"
                style={{ width, height }}
                source={require("../assets/images/s2.jpg")}
              />
            ),
            title: (
              <OverlayText
                title="Plan Smarter Trips"
                subtitle="AI generated itineraries, routes and travel ideas instantly."
              />
            ),
            subtitle: <></>,
          },
          {
            backgroundColor: "#000",
            image: (
              <Image
                contentFit="cover"
                className="w-full h-full"
                style={{ width, height }}
                source={require("../assets/images/s1.jpg")}
              />
            ),
            title: (
              <OverlayText
                title="Stay Safe Anywhere"
                subtitle="SOS alerts, emergency contacts and real-time support."
              />
            ),
            subtitle: <></>,
          },
          {
            backgroundColor: "#000",
            image: (
              <Image
                contentFit="cover"
                className="w-full h-full"
                style={{ width, height }}
                source={require("../assets/images/s3.jpg")}
              />
            ),
            title: (
              <OverlayText
                title="Travel Fearlessly"
                subtitle="Explore confidently with planning + safety in one app."
              />
            ),
            subtitle: <></>,
          },
        ]}
      />
    </SafeAreaView>
  );
}
