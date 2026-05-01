import { useprofileStore } from "@/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

type Msg = { id: string; role: "ai" | "user" | "ui"; text: string };

const markdownStyles = {
  body: { color: "white", fontSize: 12, lineHeight: 22 },
  heading1: {
    color: "white",
    fontWeight: "bold" as const,
    fontSize: 16,
    marginBottom: 8,
  },
  heading2: {
    color: "white",
    fontWeight: "bold" as const,
    fontSize: 14,
    marginBottom: 6,
  },
  strong: { color: "white", fontWeight: "700" as const },
  em: { color: "rgba(255,255,255,0.8)" },
  bullet_list: { color: "white" },
  ordered_list: { color: "white" },
  list_item: { color: "white", marginBottom: 4 },
  table: { borderColor: "rgba(255,255,255,0.2)", marginVertical: 3 },
  thead: { backgroundColor: "rgba(255,255,255,0.1)" },
  th: { color: "white", fontWeight: "700" as const, padding: 3 },
  td: { color: "rgba(255,255,255,0.85)", padding: 3 },
  tr: { borderColor: "rgba(255,255,255,0.1)" },
  code_inline: { color: "#a855f7", backgroundColor: "rgba(168,85,247,0.15)" },
  fence: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 8,
  },
  blockquote: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderLeftColor: "#a855f7",
  },
  link: { color: "#3b82f6" },
};

const callGroq = async (messages: { role: string; content: string }[]) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        temperature: 0.7,
        max_completion_tokens: 1024,
        stream: false, //
      }),
    },
  );

  const data = await response.json();

  return data.choices[0]?.message?.content ?? "Sorry, no response.";
};

export default function Chat() {
  const { profile, lat, long } = useprofileStore();
  const [input, setInput] = useState("");
  const [lastLocation, setLastLocation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    const fetchnew = async () => {
      try {
        const loc = await Location.getCurrentPositionAsync();
        const add = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const address =
          add[0].formattedAddress ?? `${lat?.toFixed(4)}, ${long?.toFixed(4)}`;
        setLastLocation(address);

        historyRef.current = [
          {
            role: "system",
            content: `You are a helpful travel assistant. The user's name is ${profile?.name ?? "traveler"} and they are currently located at: ${address} (coordinates: ${lat}, ${long}). Help them discover places, restaurants, hotels (along with hotel booking links or hotel websites if any), things to do, and answer any travel-related questions about their current location and surroundings. Be concise and friendly.`,
          },
        ];

        setMessages([
          {
            id: "1",
            role: "ai",
            text: `Hi ${profile?.name ?? "traveler"} ✨\nI'm Raahi AI your travel assistant.\nCurrent location: ${address}.\n\nTry asking:\n✨ Show me places to visit\n🍽️ Best restaurants nearby\n📚 Tell me something about this place\n💎 Hidden gems around me`,
          },
        ]);
      } catch {
        setLastLocation(`${lat?.toFixed(4)}, ${long?.toFixed(4)}`);
      }
    };
    fetchnew();
  }, []);

  const send = async (text?: string) => {
    const val = (text ?? input).trim();
    if (!val || loading) return;
    setInput("");

    const userMsg: Msg = { id: Date.now() + "u", role: "user", text: val };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: val },
    ];

    const aiId = Date.now() + "a";
    setMessages((prev) => [
      ...prev,
      { id: aiId, role: "ai", text: "Thinking ..." },
    ]);
    setLoading(true);

    try {
      const reply = await callGroq(historyRef.current);

      setMessages((prev) =>
        prev.map((m) => (m.id === aiId ? { ...m, text: reply } : m)),
      );

      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: reply },
      ];
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, text: "Something went wrong. Try again." }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const quick = useMemo(
    () => [
      "✨ Show me places to visit",
      "🍽️ Best restaurants nearby",
      "📚 Tell me something about this place",
      "🏥 Nearby hospitals",
    ],
    [],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-black"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <LinearGradient
          colors={["#09090b", "#120b24", "#09090b"]}
          className="absolute inset-0"
        />
        <LinearGradient
          colors={[
            "rgba(168,85,247,0.35)",
            "rgba(59,130,246,0.28)",
            "rgba(99,102,241,0.18)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        <View className="px-5 pt-14 pb-4 border-b border-white/10">
          <Text className="text-white text-2xl font-semibold">Travel AI</Text>
          <Text className="text-white/60 mt-1">
            Ask anything about nearby places
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 25 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            !loading ? (
              <View className="mt-3 gap-2">
                {quick.map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => send(q)}
                    className="px-4 py-3 rounded-2xl bg-white/8 border border-white/10"
                  >
                    <Text className="text-white/90 text-sm">{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              className={
                item.role === "user"
                  ? "self-end max-w-[82%]"
                  : "self-start max-w-[92%]"
              }
            >
              <View
                className={
                  item.role === "user"
                    ? "bg-white/10 rounded-3xl rounded-br-md px-4 py-3"
                    : "bg-white/8 border border-white/10 rounded-3xl rounded-bl-md px-4 py-3"
                }
              >
                {item.role === "ai" ? (
                  <Markdown style={markdownStyles}>{item.text}</Markdown>
                ) : (
                  <Text className="text-white leading-6">{item.text}</Text>
                )}
              </View>
            </View>
          )}
        />
        <View className="w-full px-4 pb-5 pt-5 border-t border-white/10 bg-black/70">
          <View className="flex-row items-center gap-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about this area..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              className="flex-1 bg-white/8 text-white px-4 py-4 rounded-2xl border border-white/10"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => send()}
              disabled={loading}
              className="h-14 w-14 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={
                  loading ? ["#333", "#333"] : ["#a855f7", "#3b82f6", "#22d3ee"]
                }
                className="flex-1 items-center justify-center"
              >
                <Ionicons
                  name={loading ? "ellipsis-horizontal" : "send"}
                  size={20}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
