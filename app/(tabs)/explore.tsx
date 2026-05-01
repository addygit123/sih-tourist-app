import { useprofileStore } from "@/profileStore";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Explore = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const { profile, addContact, remContact } = useprofileStore();

  const adContact = () => {
    if (!newName || !newNumber) return;
    if (profile.contacts.length >= 5) return alert("Max 5 contacts allowed!");
    const newitem = [newName, newNumber];
    addContact(newitem);
    setNewName("");
    setNewNumber("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1020]">
      <LinearGradient
        colors={["#0D1020", "#15192D", "#17162C", "#0D1020"]}
        className="absolute inset-0"
      />

      <View className="px-6 py-4 border-b border-white/10">
        <Text className="text-3xl font-bold text-white">Add Contacts</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {profile.contacts.length === 0 ? (
          <View className="flex-1 justify-center items-center pt-20">
            <Text className="text-white/50">No contacts added</Text>
          </View>
        ) : (
          profile.contacts.map((c: string[], idx: number) => (
            <View
              key={idx}
              className="flex-row justify-between items-center w-full p-4 mb-3 bg-white/5 border border-white/10 rounded-3xl"
            >
              <View>
                <Text className="text-lg font-semibold text-white">{c[0]}</Text>
                <Text className="text-white/55 mt-1">{c[1]}</Text>
              </View>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-red-400/10 items-center justify-center"
                onPress={() => remContact(c[1])}
              >
                <FontAwesome name="trash-o" color="#F87171" size={18} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={profile.contacts.length >= 5}
        className="mx-5 mb-5 rounded-2xl overflow-hidden"
      >
        <LinearGradient
          colors={
            profile.contacts.length >= 5
              ? ["#374151", "#374151"]
              : ["#8B5CF6", "#6366F1", "#3B82F6"]
          }
          className="py-4"
        >
          <Text className="text-white text-center text-lg font-bold">
            {profile.contacts.length >= 5 ? "Limit Reached" : "Add Contact"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="w-full rounded-3xl bg-[#171A30] border border-white/10 p-6">
            <Text className="text-xl font-bold mb-4 text-white">
              Add New Contact
            </Text>

            <TextInput
              placeholder="Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newName}
              onChangeText={setNewName}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-3 text-white"
            />

            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="phone-pad"
              value={newNumber}
              onChangeText={setNewNumber}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-white"
            />

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 py-3 rounded-2xl bg-white/8 border border-white/10"
              >
                <Text className="text-white text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={adContact}
                className="flex-1 rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#6366F1", "#3B82F6"]}
                  className="py-3"
                >
                  <Text className="text-white text-center font-semibold">
                    Save
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
