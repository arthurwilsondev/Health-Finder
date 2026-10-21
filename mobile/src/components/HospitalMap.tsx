import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../constants/theme';
import type { Hospital } from '../types/hospital';
import * as Location from 'expo-location';
import { calculateDistanceKm } from '../app/timer';
import { useEffect, useState } from 'react';

type Props = {
  hospitals: Hospital[];
  distance?: number;
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

export function HospitalMap({ hospitals, distance }: Props) {
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


  // Dentro do componente HospitalMap:
  const [hospitaisFiltrados, setHospitaisFiltrados] =
    useState<Hospital[]>([]);

  useEffect(() => {
    let ativo = true;

    async function filtrarHospitais() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setHospitaisFiltrados([]);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const hospitaisValidos = hospitals.filter(
          (hospital) =>
            typeof hospital.latitude === 'number' &&
            typeof hospital.longitude === 'number'
        );

        const resultados = hospitaisValidos.map((hospital) => {
          const distanciaHospital = calculateDistanceKm(
            position.coords.latitude,
            position.coords.longitude,
            hospital.latitude!,
            hospital.longitude!
          );

          return {
            hospital,
            distancia: distanciaHospital,
          };
        });

        const filtrados = resultados
          .filter(({ distancia }) => distancia <= (distance ?? 0))
          .map(({ hospital }) => hospital);

        if (ativo) {
          setHospitaisFiltrados(filtrados);
        }
      } catch (error) {
        console.error('Erro ao filtrar hospitais:', error);

        if (ativo) {
          setHospitaisFiltrados([]);
        }
      }
    }

    filtrarHospitais();

    return () => {
      ativo = false;
    };
  }, [hospitals, distance]);

  console.log(distance);
  

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
        {hospitaisFiltrados.map((hospital) => (
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
