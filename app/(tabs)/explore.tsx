import { useprofileStore } from "@/profileStore";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Explore = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const {profile, addContact, remContact} = useprofileStore()

  const adContact = () => {
    if (!newName || !newNumber) return;
    if (profile.contacts.length >= 5) return alert("Max 5 contacts allowed!");
    const newitem = [newName, newNumber]
    addContact(newitem)
    setNewName("");
    setNewNumber("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 gap-1 bg-gray-100">
       <View className="p-4 px-6 w-full bg-white">
         <Text className="text-3xl font-bold" >Add Contacts</Text>
       </View>
      <ScrollView className="flex-1 p-4">
        {profile.contacts.length === 0 ? (
          <View className="flex-1 justify-center items-center"><Text className="text-gray-500 ">No contacts added </Text></View>
        ) : (
          profile.contacts.map((c: string[], idx: number) => (
            <View key={idx} className="flex flex-row justify-between items-center w-full p-4 mb-2 bg-white rounded-2xl shadow">
              <View className="flex flex-col">
                <Text className="text-lg font-semibold">{c[0]}</Text>
                <Text className="text-gray-600">{c[1]}</Text>
              </View>
              <TouchableOpacity className="flex justify-center items-center" onPress={() => remContact(c[1])}>
                <FontAwesome name="trash-o" color={'red'} size={18} className="p-1"></FontAwesome>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setModalVisible(true)} className="m-5 p-4 rounded-2xl bg-purple-500" disabled={profile.contacts.length >= 5} >
        <Text className="text-white text-center text-lg font-bold">
          {profile.contacts.length >= 5 ? "Limit Reached" : "Add Contact"}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-4/5">
            <Text className="text-xl font-bold mb-4">Add New Contact</Text>
            <TextInput
              placeholder="Name"
              value={newName}
              onChangeText={setNewName}
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />
            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newNumber}
              onChangeText={setNewNumber}
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 rounded-lg bg-gray-400"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={adContact}
                className="px-4 py-2 rounded-lg bg-purple-500"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
