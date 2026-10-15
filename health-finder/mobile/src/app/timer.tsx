import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { HospitalMap } from '../components/HospitalMap';
import { colors, fontFamily } from '../constants/theme';
import type { Hospital } from '../types/hospital';

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function TimerScreen() {
  const { hospitalName, latitude, longitude } = useLocalSearchParams<{
    hospitalName?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const timer = useMemo(() => formatElapsed(elapsed), [elapsed]);
  const selectedHospital = hospitalName || 'hospital selecionado';

  const mapHospitals = useMemo<Hospital[]>(() => {
    if (!hospitalName || !latitude || !longitude) return [];
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];

    return [{
      id: 'selected-hospital',
      name: hospitalName,
      address: '',
      latitude: lat,
      longitude: lon,
    }];
  }, [hospitalName, latitude, longitude]);

  const panelStyle = running ? styles.panelRunning : styles.panelIdle;
  const buttonStyle = running ? styles.buttonRunning : styles.buttonIdle;

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader />

      <View style={styles.content}>
        <HospitalMap hospitals={mapHospitals} />

        <View style={[styles.panel, panelStyle]}>
          <Text style={styles.title}>
            {running ? 'Finalizar cronômetro' : 'Iniciar cronômetro'}{'\n'}
            da consulta em{'\n'}
            {selectedHospital}
          </Text>

          <Text style={styles.helper}>
            O cronômetro mede o tempo a partir do momento em que você iniciar.
          </Text>

          <Pressable
            style={[styles.actionButton, buttonStyle]}
            onPress={() => setRunning((value) => !value)}
          >
            <Text style={styles.actionText}>{running ? 'Finalizar' : 'Iniciar'}</Text>
          </Pressable>

          <Text style={styles.description}>Tempo registrado nesta sessão:</Text>
          <Text style={styles.timer}>{timer}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 8 },
  content: { flex: 1, paddingHorizontal: 24, gap: 20, paddingTop: 12, paddingBottom: 20 },
  panel: {
    flex: 1,
    minHeight: 400,
    borderWidth: 5,
    borderRadius: 17,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  panelIdle: { backgroundColor: colors.surface, borderColor: colors.primary },
  panelRunning: { backgroundColor: colors.dangerSurface, borderColor: colors.danger },
  title: {
    color: colors.white,
    fontFamily,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  helper: {
    marginTop: 20,
    color: colors.white,
    fontFamily,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actionButton: {
    width: 210,
    minHeight: 76,
    marginTop: 26,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIdle: { backgroundColor: colors.primary },
  buttonRunning: { backgroundColor: colors.danger },
  actionText: { color: colors.white, fontFamily, fontSize: 23, fontWeight: '800' },
  description: { marginTop: 24, color: colors.white, fontFamily, fontSize: 14, textAlign: 'center' },
  timer: { marginTop: 20, color: colors.white, fontFamily, fontSize: 38, fontWeight: '800' },
});
