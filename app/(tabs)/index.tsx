import sos from '@/assets/images/sos.png'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import * as SMS from 'expo-sms'
import * as TaskManager from 'expo-task-manager'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Alert, DeviceEventEmitter, Modal, Text, TouchableOpacity, View } from 'react-native'
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ContactsContext } from './_layout'

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

  TaskManager.defineTask('getnewlocation', async ({data , error}) => {
    console.log('working...');
    
    if(error){
      console.log(error);
      Location.stopLocationUpdatesAsync('getnewlocation')
      return;
    }

    let cord = (data!.locations[0]).coords
    const loc = await Location.reverseGeocodeAsync({latitude: cord.latitude, longitude:cord.longitude})
    const p = await SecureStore.getItemAsync('profile')
    let profile = JSON.parse(p!)
    let newdata =  {...profile, 'lastlocation': loc[0].formattedAddress}
    newdata = JSON.stringify(newdata)
    await SecureStore.setItemAsync('profile', newdata)
    DeviceEventEmitter.emit('newlocation', loc[0].formattedAddress)
    
    console.log(cord.latitude, cord.longitude);
  })

const Index = () => {
  const timer = useRef<number|null>(null)
  const [lastLocation, setLastLocation] = useState<string | null>('')
  const [tourist, setTourist] = useState('');
  const [fetchnow, setFetchNow] = useState(false)
  const [showmodal, setShowModal] = useState(false)
  const [time, setTimer] = useState(0)

  const { contacts } = useContext(ContactsContext);

  const sendsms = async ()=>{
    //isme abhi server ko status update krna bacha h
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      let data = await SecureStore.getItemAsync('contacts')
      if(data !== null){
        let newdata = JSON.parse(data)
        let parsed = newdata!.map((item : {'name' :string, 'number': string}) => {
          return item.number
        })

        await SMS.sendSMSAsync(parsed, `${tourist} is in danger, last know location is : ${lastLocation}`)
        console.log('parsed', parsed);
        
      }
      else{
        Alert.alert('NNo emergency contacts available')
      }
    } else {
      Alert.alert('No sms available..')
    }
  }


  const startTimer = () => {
    if(contacts.length === 0){
      Alert.alert("No emergency contacts available")
      return;
    }
    setShowModal(true)
    setTimer(5)

    timer.current = setInterval(() => {
      setTimer((prev) => {
        if(prev === 1){
          sendsms()
          setShowModal(false)
          clearInterval(timer.current!)
          timer.current = 0;
          return 0;
        }

        else return prev - 1
      })
    }, 1000)
  }

  const canceltimer = () => {
    if(timer.current){
      clearInterval(timer.current)
    }
    setShowModal(false)
    setTimer(0)
  }

  const fetchnew = async () => {
    setFetchNow(true)
    try {
      const loc = await Location.getCurrentPositionAsync()
      const p = await SecureStore.getItemAsync('profile')
      const data = await JSON.parse(p!)
      const add = await Location.reverseGeocodeAsync({latitude: loc.coords.latitude, longitude: loc.coords.longitude})
      let newdata = {...data, 'lastlocation': (add[0]).formattedAddress}
      newdata = JSON.stringify(newdata)
      await SecureStore.setItemAsync('profile', newdata)
      setLastLocation((add[0]).formattedAddress)
    }
    finally{
      setFetchNow(false)
    }
  }

   const getprofile = async ()=>{
      const p = await SecureStore.getItemAsync('profile')
      if(p !== null){
        const data = JSON.parse(p)
        setTourist(data.name)
      }
    }

    const fetch = async () => {
      console.log('helo');
      
      const loc = await Location.getCurrentPositionAsync()
      const p = await SecureStore.getItemAsync('profile')
      const data = await JSON.parse(p!)
      const add = await Location.reverseGeocodeAsync({latitude: loc.coords.latitude, longitude: loc.coords.longitude})
      let newdata = {...data, 'lastlocation': (add[0]).formattedAddress}
      newdata = JSON.stringify(newdata)
      await SecureStore.setItemAsync('profile', newdata)
      setLastLocation((add[0]).formattedAddress)
    }
    //  (async () => {

    //   request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((status) => {
    //     console.log(status);
    //     if(status === RESULTS.GRANTED){
    //       request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION).then((status) => {
    //         console.log(status);
    //       })

    //       request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION).then((status) => {
    //         console.log(status);
    //       })
    //     }
        
    //   })
    
    //   })();
      

  useEffect(() => {

    const setup = async () => {
      let { status:fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== 'granted') {
        Alert.alert('location was denied');
        return;
      }

      let { status:bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== 'granted') {
        Alert.alert('background location was denied');
      }

      await fetch()
      await getprofile()
      await Location.startLocationUpdatesAsync('getnewlocation', {
        deferredUpdatesDistance:5,
        foregroundService: {
          notificationTitle: 'Tracking Location',
          notificationBody: 'Location is being used in background',
          notificationColor: '#0000FF'
        }
      });
      console.log('task started')
    }
    setup()

    const sub = DeviceEventEmitter.addListener('newlocation', (data : string) =>{
      setLastLocation(data)
    })

    return () => {
      console.log('leaving');
      
      return sub.remove()
    }

  }, [])
  
  
  return (
   <SafeAreaView className="flex-1 gap-2 bg-gray-100">
      <View className="p-4 px-6 w-full bg-white">
        <Text className="text-3xl font-bold" >Tourist App</Text>
      </View>
      <View className="flex-1 bg-gray-100">
        <View className='flex gap-4 justify-center'>
          <View className='w-full px-7 py-4'>
            <Text className='text-2xl '>Hello, {tourist} !</Text>
          </View>
          <View className='w-full px-7 py-2 '>
            <Text className='text-xl'>Current Location</Text>
            <View className='flex flex-row mt-6 justify-center items-center'>
              <Text className='text-md w-[90%] text-gray-500'>{lastLocation === '' ? "Updating..." : lastLocation}</Text>
              <TouchableOpacity onPress={fetchnew} className={`w-8 h-8 rounded-full bg-white flex justify-center items-center ${fetchnow === true ? 'animate-spin' : 'animate-none'}`}>
                <MaterialIcons name="refresh" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View className=' flex mt-12 items-center'>
            <TouchableOpacity onPress={startTimer}>
              <Image source={sos} alt='sos' style={{ width: 180, height: 180,  borderRadius: 999, borderWidth: 8, borderColor: 'red', }} contentFit="cover"></Image>
            </TouchableOpacity>
          </View>
          <View className='w-full mt-4 p-4 '>
            <Text className='text-md text-center font-bold'>{contacts.length === 0 ? 'Add Emergency Contacts' : contacts.length + " contacts will be notified"}</Text>
          </View>
        </View>
      </View>

     <Modal transparent visible={showmodal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-4/5">
            <View className='flex flex-row justify-between items-center'>
              <Text className='text-lg font-semibold text-amber-400'>Sending Alert in {time}s</Text>
              <TouchableOpacity onPress={canceltimer}>
                <Text className='text-lg text-red-500'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  </SafeAreaView>

  )
}

export default Index