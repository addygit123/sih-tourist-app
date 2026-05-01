import { useprofileStore } from "@/profileStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { login, onboarded } = useprofileStore();
  console.log("index", login, onboarded);

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!login) return <Redirect href="/setup" />;
  return <Redirect href="/(tabs)" />;
}
