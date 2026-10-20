import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../constants/theme';
import type { Hospital } from '../types/hospital';

type Props = {
  hospitals: Hospital[];
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#14273c' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b7c1c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#14273c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#29445f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e334a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1f33' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#193148' }] },
];

export function HospitalMap({ hospitals }: Props) {
  const mappedHospitals = hospitals.filter(
    (hospital) =>
      typeof hospital.latitude === 'number' &&
      typeof hospital.longitude === 'number'
  );

  const firstHospital = mappedHospitals[0];
  const initialRegion = firstHospital
    ? {
        latitude: firstHospital.latitude!,
        longitude: firstHospital.longitude!,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }
    : {
        latitude: -30.055,
        longitude: -51.183,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };

  return (
    <View style={styles.wrapper}>
      <MapView
        key={firstHospital?.id ?? 'empty-hospital-map'}
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        initialRegion={initialRegion}
        toolbarEnabled={false}
        rotateEnabled={false}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
      >
        {mappedHospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude!,
              longitude: hospital.longitude!,
            }}
            title={hospital.name}
            description={hospital.address}
            pinColor="#E44B3C"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 255,
    borderWidth: 2,
    borderColor: colors.mapBorder,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#14273c',
  },
});
