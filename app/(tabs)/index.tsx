import { useprofileStore } from '@/profileStore'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Blur, Canvas, Circle, Image, RadialGradient, useImage } from '@shopify/react-native-skia'
import * as Battery from 'expo-battery'
import * as Location from 'expo-location'
import * as Network from 'expo-network'
import * as SecureStore from 'expo-secure-store'
import * as SMS from 'expo-sms'
import * as TaskManager from 'expo-task-manager'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, DeviceEventEmitter, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native'
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

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
    const net = (await Network.getNetworkStateAsync()).isInternetReachable
    let cord = (data!.locations[0]).coords
    let newloc : Location.LocationGeocodedAddress[] | string | null = [];

    if(net){
      newloc = await Location.reverseGeocodeAsync({latitude: cord.latitude, longitude:cord.longitude})  
      newloc = newloc[0].formattedAddress
    }

    DeviceEventEmitter.emit('newlocation', [newloc, cord.latitude, cord.longitude, useprofileStore.getState().profile.id])
    
    console.log(cord.latitude, cord.longitude);
  })

const Index = () => {
  const sos = useImage(require('@/assets/images/sos.png'))
  const timer = useRef<number|null>(null)
  const [lastLocation, setLastLocation] = useState<string | null>('')
  const [tourist, setTourist] = useState('');
  const [fetchnow, setFetchNow] = useState(false)
  const [showmodal, setShowModal] = useState(false)
  const [time, setTimer] = useState(0)
  const [id, setId] = useState('')
  const {profile, setProfile, setCoords} = useprofileStore()
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window')
  const { contacts } = profile;

  const sendsms = async ()=>{
    await fetch(`https://smart-tourist-safety-w588.onrender.com/api/tourists/makeunsafe`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id})
    })

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      let {contacts} = profile
      if(contacts !== null){
        const parsed = profile.contacts.map((item: string[]) => {
          return item[1]
        })
        await SMS.sendSMSAsync(parsed, `${tourist} is in danger, last know location is : ${lastLocation}`) 
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
      const add = await Location.reverseGeocodeAsync({latitude: loc.coords.latitude, longitude: loc.coords.longitude})
      setLastLocation((add[0]).formattedAddress)
    }
    finally{
      setFetchNow(false)
    }
  }

   const getprofile = async ()=>{
      if(profile !== null){
        setTourist(profile.name)
        setId(profile.id)
      }
    }

    const fetchh = async () => {
      const loc = await Location.getCurrentPositionAsync()
      const add = await Location.reverseGeocodeAsync({latitude: loc.coords.latitude, longitude: loc.coords.longitude})
      setLastLocation((add[0]).formattedAddress)
    }


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

      await getprofile()
      await fetchh()
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

    const sub = DeviceEventEmitter.addListener('newlocation', async (data : string[]) => { //address, lat, longn, id
      setLastLocation(data[0])
      console.log('at emitter...');
      setCoords(data[1], data[2])
      const t = await SecureStore.getItemAsync('cached');
      let cache = null;
      if(t !== null){ cache = JSON.parse(t)}
      console.log('location cache : ' , cache);
      
        
      const network = (await Network.getNetworkStateAsync()).isInternetReachable
      if(network){
        const blevel = await Battery.getBatteryLevelAsync()
        console.log('network availbe..')
        
        const send = {
          id: data[3],
          lat:data[1],
          long: data[2],
          blevel,network,
          cache: cache
        }

        const res = await fetch(`https://smart-tourist-safety-w588.onrender.com/api/tourists/updatelocation`, {
          method: 'POST',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify(send)
        })

        if(cache !== null){
          await SecureStore.deleteItemAsync('cached')
        }
      }
      else{
        if(cache === null) cache = [];
        const o = [data[1], data[2]]
        cache = [...cache, o]
        cache = JSON.stringify(cache)
        console.log('updating cache...');
        
        await SecureStore.setItemAsync('cached', cache)
      }
      
      
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
      <View className="flex-1 mt-2 bg-gray-100">
        <View className='flex gap-4 justify-center'>
          <View className='w-full px-7 py-4'>
            <Text className='text-2xl '>Hello, {tourist} !</Text>
          </View>
          <View className='w-full px-7 py-2 '>
            <Text className='text-xl'>Current Location</Text>
            <View className='flex flex-row mt-5 justify-center items-center'>
              <Text className='text-md w-[90%] text-gray-500'>{lastLocation === '' ? "Updating..." : lastLocation}</Text>
              <TouchableOpacity onPress={fetchnew} className={`w-8 h-8 rounded-full bg-white flex justify-center items-center ${fetchnow === true ? 'animate-spin' : 'animate-none'}`}>
                <MaterialIcons name="refresh" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View className=' flex items-center'>
            <Canvas style={{ width: screenWidth, height: 220, }}>
            <Circle cx={screenWidth/2} cy={110} r={90}>
              <RadialGradient c={{ x: screenWidth/2, y: 110 }} r={150} colors={["red", "white"]} />
              <Blur blur={5} />
            </Circle>

            <TouchableOpacity onPress={startTimer}>
              <Image image={sos} x={screenWidth/2 - 80} y={110 - 80} width={160} height={160} fit="contain" />
            </TouchableOpacity>
          </Canvas>
          
        <TouchableOpacity
            onPress={startTimer}
            style={{
              width:160,
              height:160,
              borderRadius:999,
              position: "absolute",
              top: 110, 
              left: screenWidth / 2,
              transform: [
                { translateX: -80 }, 
                { translateY: -80 },
              ],
            }}
          >
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