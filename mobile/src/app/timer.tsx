
import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from 'expo-location';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { HospitalMap } from '../components/HospitalMap';
import { colors, fontFamily } from '../constants/theme';
import type { Hospital } from '../types/hospital';
import { recordWaitTime } from '../services/api';

const MAX_DISTANCE_KM = 3;

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');

  const seconds = (totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${(Math.floor(totalSeconds / 60) % 60)
      .toString()
      .padStart(2, '0')}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function TimerScreen() {
  const params = useLocalSearchParams<{
    hospitalId?: string;
    hospitalName?: string;
    latitude?: string;
    longitude?: string;
    categoriaId?: string;
  }>();

  const hospitalName = params.hospitalName;
  const hospitalId = params.hospitalId;
  const categoriaId = params.categoriaId;

  const hospitalLatitude = Number(params.latitude);
  const hospitalLongitude = Number(params.longitude);

  const hasValidCoordinates =
    params.latitude !== undefined &&
    params.longitude !== undefined &&
    params.latitude.trim() !== '' &&
    params.longitude.trim() !== '' &&
    Number.isFinite(hospitalLatitude) &&
    hospitalLatitude >= -90 &&
    hospitalLatitude <= 90 &&
    Number.isFinite(hospitalLongitude) &&
    hospitalLongitude >= -180 &&
    hospitalLongitude <= 180;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    'Você precisa estar próximo do hospital para iniciar.',
  );

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const timer = useMemo(() => formatElapsed(elapsed), [elapsed]);
  const selectedHospital = hospitalName || 'hospital selecionado';

  const mapHospitals = useMemo<Hospital[]>(() => {
    if (!hospitalName || !hasValidCoordinates) return [];

    return [
      {
        id: hospitalId || 'selected-hospital',
        name: hospitalName,
        address: '',
        latitude: hospitalLatitude,
        longitude: hospitalLongitude,
      },
    ];
  }, [
    hospitalId,
    hospitalName,
    hasValidCoordinates,
    hospitalLatitude,
    hospitalLongitude,
  ]);

  async function handleTimerPress() {
    if (running) {
      setRunning(false);
      setSaving(true);

      try {
        if (!hospitalId) {
          Alert.alert(
            'Hospital não identificado',
            'Não foi possível identificar o hospital para salvar o tempo.',
          );
          return;
        }

        await recordWaitTime(
          hospitalId,
          elapsed,
          categoriaId || undefined,
        );

        Alert.alert(
          'Tempo registrado',
          `Tempo registrado: ${timer}.`,
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } catch (error) {
        console.error('Erro ao salvar o tempo:', error);

        Alert.alert(
          'Erro ao salvar',
          'Não foi possível salvar o tempo no servidor. Verifique sua conexão e tente novamente.',
        );
      } finally {
        setSaving(false);
      }

      return;
    }

    if (checkingLocation) return;

    if (!hasValidCoordinates) {
      Alert.alert(
        'Coordenadas indisponíveis',
        'Volte à lista e selecione um hospital com coordenadas cadastradas.',
      );
      return;
    }

    setCheckingLocation(true);
    setLocationStatus('Verificando sua localização...');

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationStatus('Permissão de localização não concedida.');

        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso à localização do celular para iniciar o cronômetro.',
        );
        return;
      }

      const provider = await Location.getProviderStatusAsync();

      if (!provider.locationServicesEnabled) {
        setLocationStatus('O GPS está desativado.');

        Alert.alert(
          'Ative a localização',
          'Ative a localização do celular e tente novamente.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const distance = calculateDistanceKm(
        position.coords.latitude,
        position.coords.longitude,
        hospitalLatitude,
        hospitalLongitude,
      );

      setDistanceKm(distance);

      if (distance > MAX_DISTANCE_KM) {
        setLocationStatus(
          `Você está a ${distance.toFixed(2)} km do hospital.`,
        );

        Alert.alert(
          'Você está longe do hospital',
          `Distância aproximada: ${distance.toFixed(2)} km.\n\nVocê precisa estar a até ${MAX_DISTANCE_KM} km do hospital para iniciar o cronômetro.`,
        );

        return;
      }

      setElapsed(0);
      setRunning(true);

      setLocationStatus(
        `Localização validada: ${distance.toFixed(2)} km do hospital.`,
      );
    } catch (error) {
      console.error('Erro ao verificar localização:', error);

      setLocationStatus('Não foi possível obter sua localização.');

      Alert.alert(
        'Erro de localização',
        'Não conseguimos obter sua posição atual. Verifique o GPS e tente novamente.',
      );
    } finally {
      setCheckingLocation(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Acompanhar atendimento</Text>

        <View style={styles.mapContainer}>
          <HospitalMap hospitals={mapHospitals} />
        </View>

        <View
          style={[
            styles.panel,
            running ? styles.panelRunning : styles.panelIdle,
          ]}
        >
          <Text style={styles.title}>
            {running ? 'Atendimento em andamento' : 'Cronômetro da consulta'}
          </Text>

          <Text style={styles.hospitalName}>
            {selectedHospital}
          </Text>

          <Text style={styles.helper}>
            {running
              ? 'O tempo está sendo contado. Finalize quando terminar o atendimento.'
              : 'Para iniciar, você precisa estar a até 3 km do hospital.'}
          </Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{locationStatus}</Text>

            {distanceKm !== null && (
              <Text style={styles.distanceText}>
                Distância: {distanceKm.toFixed(2)} km
              </Text>
            )}
          </View>

          <Text style={styles.description}>
            Tempo registrado nesta sessão
          </Text>

          <Text
            accessibilityLiveRegion="polite"
            style={[styles.timer, running && styles.timerRunning]}
          >
            {timer}
          </Text>

          <Pressable
            style={[
              styles.actionButton,
              running ? styles.buttonRunning : styles.buttonIdle,
              (checkingLocation || saving) && styles.buttonDisabled,
            ]}
            onPress={handleTimerPress}
            disabled={checkingLocation || saving}
          >
            <Text style={styles.actionText}>
              {checkingLocation
                ? 'Verificando GPS...'
                : saving
                  ? 'Salvando tempo...'
                  : running
                    ? 'Finalizar atendimento'
                    : 'Iniciar cronômetro'}
            </Text>
          </Pressable>

          <Text style={styles.footerNote}>
            {running
              ? 'Mantenha esta tela aberta para acompanhar o tempo.'
              : 'A contagem começa somente após a validação da localização.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 8,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },

  pageTitle: {
    color: colors.white,
    fontFamily,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  mapContainer: {
    minHeight: 240,
  },

  panel: {
    width: '100%',
    borderWidth: 4,
    borderRadius: 17,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 16,
  },

  panelIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },

  panelRunning: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.danger,
  },

  title: {
    color: colors.white,
    fontFamily,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  hospitalName: {
    color: colors.white,
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  helper: {
    marginTop: 4,
    color: colors.white,
    fontFamily,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  statusBox: {
    width: '100%',
    backgroundColor: colors.surfaceDark,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },

  statusText: {
    color: colors.white,
    fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },

  distanceText: {
    color: colors.primarySoft,
    fontFamily,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  description: {
    marginTop: 6,
    color: colors.white,
    fontFamily,
    fontSize: 15,
    textAlign: 'center',
  },

  timer: {
    color: colors.white,
    fontFamily,
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  timerRunning: {
    color: colors.white,
  },

  actionButton: {
    width: '100%',
    minHeight: 58,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  buttonIdle: {
    backgroundColor: colors.primary,
  },

  buttonRunning: {
    backgroundColor: colors.danger,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  actionText: {
    color: colors.white,
    fontFamily,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  footerNote: {
    color: colors.white,
    fontFamily,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
