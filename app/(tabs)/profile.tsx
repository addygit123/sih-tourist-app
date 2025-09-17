import pfp from '@/assets/images/pfp.jpeg'
import { useprofileStore } from '@/profileStore'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


const Profile = () => {
  const {profile ,setLogout, setProfile, setPfp, dp} = useprofileStore()
  const out = ()=>{
    setLogout(false)
    setProfile(null)
  }
  const [modalVisible, setModalVisible]= useState(false)
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const updateDb = async (uri : string) => {
    let formdata = new FormData()
    formdata.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: "test"
    })
    formdata.append("upload_preset", "sample-img");
    formdata.append("cloud_name", "dqcqijw3c");

     try {
      let res = await fetch("https://api.cloudinary.com/v1_1/dqcqijw3c/image/upload", {
        method: "POST",
        body: formdata,
      });

        let data = await res.json();
        console.log(data.secure_url);
        //now update thr main db
      } catch (err) {
        console.error("failed:", err);
        return null;
      }
  }

  console.log('permissin', status);
  
  const opencamera = async () => {
    setModalVisible(false)
    if(!status?.granted){
      console.log('here');
      requestPermission()
      opencamera()
    }
    else {
      let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images',],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      cameraType: ImagePicker.CameraType.front,
    });

    console.log(result);
    if (!result.canceled) {
      setPfp(result.assets[0].uri);
      updateDb(result.assets[0].uri)
    }
    }
  }

  const pickImage = async () => {
    setModalVisible(false)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images',],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setPfp(result.assets[0].uri);
      updateDb(result.assets[0].uri)
    }
  };

  return (
    <SafeAreaView className='flex-1 items-center  justify-center bg-slate-50'>
        {
          Object.keys(profile).length === 0 ? ( 
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size={'small'}/>
          </View>) : 
          (
          <ScrollView className='bg-white  rounded-md w-[95%] m-auto p-5 py-28 shadow-lg z-0' contentContainerClassName='flex gap-8 items-center justify-center '>
            <View className='flex absolute right-0 -top-safe-offset-32 items-center justify-end'>
              <TouchableOpacity  className=' flex items-center justify-center p-2 rounded-full bg-purple-500' onPress={out}>
                <MaterialCommunityIcons name="logout" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View >
              <Image source={dp === '' ? pfp : dp} alt='pfp' contentFit='contain' style={{width: 150, height:150, borderRadius:999, borderWidth:2, borderColor:'black'}}></Image>
              <TouchableOpacity onPress={() => setModalVisible(true)}  className='bg-purple-500 flex p-2 justify-center items-center absolute bottom-0 right-0 rounded-full overflow-clip'>
                <MaterialIcons name='add-reaction' size={22} color={'white'}></MaterialIcons>
              </TouchableOpacity>
            </View>
              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Name</Text>
                <Text className='text-lg '>{profile.name}</Text>
              </View>

              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>profile Id</Text>
                <Text className='text-lg'>{profile.id}</Text>
              </View>


              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Contact</Text>
                <Text className='text-lg'>{profile.phone}</Text>
              </View>

              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Nationality</Text>
                <Text className='text-lg'>{profile.nationality}</Text>
              </View>
            </ScrollView>
          )
        }


         <Modal transparent visible={modalVisible} animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="bg-white p-4 flex flex-col gap-4 items-center justify-center rounded-2xl w-4/5"> 
                      <View className='flex flex-row gap-2'>
                        <TouchableOpacity className='p-1 ' onPress={opencamera}><Text className='text-lg font-semibold'>Open Camera</Text></TouchableOpacity>
                        <TouchableOpacity className='p-1 ' onPress={pickImage}><Text className='text-lg font-semibold'>Open Gallery</Text></TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => setModalVisible(false)} ><Text className='text-red-400 text-lg font-semibold'>Cancel</Text></TouchableOpacity>
                  </View>
                </View>
          </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default Profile