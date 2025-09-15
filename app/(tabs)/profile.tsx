import pfp from '@/assets/images/pfp.jpeg'
import { useprofileStore } from '@/profileStore'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  const {profile ,setLogout, setProfile} = useprofileStore()
  const out = ()=>{
    setLogout(false)
    setProfile(null)
  }

  return (
    <SafeAreaView className='flex-1 items-center  justify-center bg-slate-50'>
        {
          Object.keys(profile).length === 0 ? ( 
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size={'small'}/>
          </View>) : 
          (
          <ScrollView className='bg-white  rounded-md w-[98%] p-5 py-28 shadow-lg z-0' contentContainerClassName='flex gap-8 items-center justify-center '>
            <View className='flex absolute right-0 -top-safe-offset-32 items-center justify-end'>
              <TouchableOpacity  className=' flex items-center justify-center p-2 rounded-full bg-red-400' onPress={out}>
                <MaterialCommunityIcons name="logout" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View >
              <Image source={pfp} alt='pfp' contentFit='contain' style={{width: 150, height:150, borderRadius:999, borderWidth:2, borderColor:'black'}}></Image>
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
    </SafeAreaView>
  )
}

export default Profile