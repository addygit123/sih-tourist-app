import pfp from '@/assets/images/pfp.jpeg'
import { Image } from 'expo-image'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  const [tourist, setTourist] = useState({})

  useEffect(() => {
    const fetch = async ()=>{
      const data = await SecureStore.getItemAsync('profile')
      console.log('data', data);
      
      if(data !== null){
        const p = JSON.parse(data!)
        setTourist(p)
      }
    }

    fetch()
  }, [])
  
  return (
    <SafeAreaView className='flex-1 items-center justify-center bg-slate-50'>
        {
          Object.keys(tourist).length === 0 ? ( 
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size={'small'}/>
          </View>) : 
          (
          <ScrollView className='bg-white rounded-md w-[95%] p-10 py-28 shadow-lg z-0' contentContainerClassName='flex gap-8 items-center justify-center '>
            <View >
              <Image source={pfp} alt='pfp' contentFit='contain' style={{width: 150, height:150, borderRadius:999, borderWidth:2, borderColor:'black'}}></Image>
            </View>
              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Name</Text>
                <Text className='text-lg '>{tourist.name}</Text>
              </View>

              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Email</Text>
                <Text className='text-lg'>{tourist.email}</Text>
              </View>


              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Contact</Text>
                <Text className='text-lg'>{tourist.phone}</Text>
              </View>

              <View className='flex flex-row gap-3 items-center justify-between w-[80%]'>
                <Text className='text-lg font-semibold'>Nationality</Text>
                <Text className='text-lg'>{tourist.nationality}</Text>
              </View>
            </ScrollView>
          )
        }
    </SafeAreaView>
  )
}

export default Profile