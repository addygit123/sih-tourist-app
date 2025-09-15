import { useprofileStore } from '@/profileStore';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types';
import { Platform, Text } from 'react-native';

export default function App() {
    const {lat, long , seCoords}  = useprofileStore()
    const markers = [
        {coordinates: {latitude: lat, longitude: long}, draggable: false, },
    ]
    if (Platform.OS === 'ios') {
        return <AppleMaps.View style={{ flex: 1 }} />;
    } else if (Platform.OS === 'android') {
        return <GoogleMaps.View cameraPosition={{coordinates: {latitude: lat, longitude: long}, zoom:20}} style={{ flex: 1 }} markers={markers} 
        uiSettings={{
            compassEnabled:true,
        }}
        properties={{
            mapType:GoogleMapsMapType.HYBRID,
            isBuildingEnabled:true,
            isTrafficEnabled:true,
            maxZoomPreference:20,
            minZoomPreference:18
        }}/>;
    } else {
        return <Text>Maps are only available on Android and iOS</Text>;
    }
}