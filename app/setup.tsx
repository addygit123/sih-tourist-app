import { useprofileStore } from '@/profileStore';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SetupScreen() {
  const {setProfile, setLogin} = useprofileStore()

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');

  const getTourist = async () => {
    setLoading(true)
    if (!pass || !id) {
      Alert.alert('Please fill in required fields: Id and Password');
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`https://smart-tourist-safety-w588.onrender.com/api/tourists/getatourist`, {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify({id})
      })
      let { data } = await res.json()
      console.log(data);
      
      if(data.legth === 0){
        Alert.alert("Invalid Id or Tourist is not registered!")
      }
      else {
        let profile = {
          name: data[0].name,
          passport: data[0].passportId,
          nationality: data[0].nationality,
          phone: data[0].touristPhone,
          id: data[0].touristId,
          contacts : [[data[0].emergencyContact.name, data[0].emergencyContact.phone]],
          pnr: data[0].ticketInfo.pnr,
        }
        
        setLogin(true)
        setProfile(profile)
      }
    }
    catch(e) {
      console.log(e);
      Alert.alert("Something went wrong!")
    }
    finally{
      setLoading(false)
    }
  };
return (
   <KeyboardAwareScrollView contentContainerClassName='flex-1 justify-center relative  items-center'>

        <View className=' w-full  relative justify-center items-center '>
          <Image
            style={{ width: "100%", height: "100%", position:'absolute', backgroundColor:'red'}}
            contentFit="cover"
            blurRadius={1}
          />
            
            <Text className="text-3xl font-bold text-center mb-8 ">Log In</Text>

            <View className='px-8 w-full'>
              <Text className="mb-2 font-medium">Toursit Id </Text>
              <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-5"
                  value={id}
                  onChangeText={setId}
                  placeholder="Enter your Tourist Id"
              />

              <Text className="mb-2 font-medium">Password </Text>
              <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-5"
                  value={pass}
                  onChangeText={setPass}
                  keyboardType='phone-pad'
                  placeholder="Enter password"
              />

              <TouchableOpacity onPress={getTourist} className='self-center w-32 rounded-lg mt-5 bg-blue-500 p-2 flex justify-center items-center'>
                {loading ===true ? <ActivityIndicator size='small'  color={'white'}/> : <Text className='text-lg text-white'>Log In</Text>}
              </TouchableOpacity>
            </View>

        </View>
      </KeyboardAwareScrollView>
  )
}


 
