import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../constants/theme';
import { hospitals } from '../mocks/hospitals';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#14273c' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b7c1c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#14273c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#29445f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e334a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1f33' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#193148' }] },
];

const userPoint = {
  latitude: -30.0708,
  longitude: -51.1876,
};

export function HospitalMap() {
  return (
    <View style={styles.wrapper}>
      <MapView
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: -30.055,
          longitude: -51.183,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        toolbarEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
      >
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{ latitude: hospital.latitude, longitude: hospital.longitude }}
            title={hospital.name}
            pinColor="#E44B3C"
          />
        ))}

        <Marker coordinate={userPoint} pinColor={colors.primary} title="Sua localização" />

        <Polyline
          coordinates={[
            userPoint,
            { latitude: -30.064, longitude: -51.182 },
            { latitude: -30.061, longitude: -51.176 },
            { latitude: hospitals[0].latitude, longitude: hospitals[0].longitude },
          ]}
          strokeColor={colors.primary}
          strokeWidth={5}
        />
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
