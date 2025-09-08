import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useContext, useState } from 'react';
import { Alert, Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ProfileContext } from './_layout';

export default function SetupScreen() {
  const router = useRouter();
  const { setProfile } = useContext(ProfileContext);

  const [name, setName] = useState('');
  const [passport, setPassport] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Please fill in required fields: Name and Email');
      return;
    }

    const profileData = {name,passport, email, phone, nationality};
    console.log(profileData);
    

    try {
      await SecureStore.setItemAsync('profile', JSON.stringify(profileData));
      setProfile(true)
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error saving profile');
    }
  };

  return (
    <View className='flex-1 mt-10'>
    <KeyboardAwareScrollView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text className="text-3xl font-bold text-center mb-8 ">Setup Your Profile</Text>

            <Text className="mb-2 font-medium">Full Name *</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-5"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
            />

            <Text className="mb-2 font-medium">Passport / ID</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-5"
                value={passport}
                onChangeText={setPassport}
                keyboardType='phone-pad'
                placeholder="Enter passport or ID"
                maxLength={12}
            />

            <Text className="mb-2 font-medium">Email *</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-5"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
            />

            <Text className="mb-2 font-medium">Phone</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-5"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                maxLength={10}
            />

            <Text className="mb-2 font-medium">Nationality</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-5"
                value={nationality}
                onChangeText={setNationality}
                placeholder="Enter your nationality"
            />

            <View className="mt-5">
                <Button title="Save Profile" onPress={handleSave} />
            </View>
        </View>
      </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      </View>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center'
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
});
