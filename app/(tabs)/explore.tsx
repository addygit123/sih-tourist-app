import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactsContext } from "./_layout";

const Explore = () => {
  const { contacts, setContacts } = useContext(ContactsContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  useEffect(() => {
    const getContacts = async () => {
      let data = await SecureStore.getItemAsync("contacts");
      if (data !== null) {
        setContacts(JSON.parse(data));
      }
    };
    getContacts();
  }, []);

  const saveContacts = async (updated: typeof contacts) => {
    setContacts(updated);
    await SecureStore.setItemAsync("contacts", JSON.stringify(updated));
  };

  const addContact = () => {
    if (!newName || !newNumber) return;
    if (contacts.length >= 5) return alert("Max 5 contacts allowed!");
    const updated = [...contacts, { name: newName, number: newNumber }];
    saveContacts(updated);
    setNewName("");
    setNewNumber("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4 w-full">
        <Text className="text-2xl font-bold">Add Contacts</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {contacts.length === 0 ? (
          <View className="flex-1 justify-center items-center"><Text className="text-gray-500 ">No contacts added </Text></View>
        ) : (
          contacts.map((c, idx) => (
            <View key={idx} className="w-full p-4 mb-2 bg-white rounded-2xl shadow">
              <Text className="text-lg font-semibold">{c.name}</Text>
              <Text className="text-gray-600">{c.number}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setModalVisible(true)} className="m-4 p-4 rounded-2xl bg-blue-500" disabled={contacts.length >= 5} >
        <Text className="text-white text-center text-lg font-bold">
          {contacts.length >= 5 ? "Limit Reached" : "Add Contact"}
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
                onPress={addContact}
                className="px-4 py-2 rounded-lg bg-blue-500"
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
