import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { HospitalMap } from '../components/HospitalMap';
import { colors, fontFamily } from '../constants/theme';

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function TimerScreen() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const timer = useMemo(() => formatElapsed(elapsed), [elapsed]);

  const panelStyle = running ? styles.panelRunning : styles.panelIdle;
  const buttonStyle = running ? styles.buttonRunning : styles.buttonIdle;

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader />

      <View style={styles.content}>
        <HospitalMap />

        <View style={[styles.panel, panelStyle]}>
          <Text style={styles.title}>
            {running ? 'Finalizar cronometro' : 'Iniciar cronometro'}{`\n`}
            da consulta em{`\n`}
            Hospital São Lucas
          </Text>

          <Text style={styles.helper}>Isso nos ajuda a manter{`\n`}nosso aplicativo preciso</Text>

          <Pressable
            style={[styles.actionButton, buttonStyle]}
            onPress={() => setRunning((value) => !value)}
          >
            <Text style={styles.actionText}>{running ? 'Finalizar' : 'Iniciar'}</Text>
          </Pressable>

          <Text style={styles.description}>Sua consulta está demorando cerca de:</Text>
          <Text style={styles.timer}>{timer}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 8 },
  content: { paddingHorizontal: 40, gap: 30, paddingTop: 12 },
  panel: {
    minHeight: 515,
    borderWidth: 5,
    borderRadius: 17,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 28,
  },
  panelIdle: { backgroundColor: colors.surface, borderColor: colors.primary },
  panelRunning: { backgroundColor: colors.dangerSurface, borderColor: colors.danger },
  title: {
    color: colors.white,
    fontFamily,
    fontSize: 28,
    lineHeight: 41,
    fontWeight: '800',
    textAlign: 'center',
  },
  helper: { marginTop: 28, color: colors.white, fontFamily, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  actionButton: {
    width: 220,
    height: 94,
    marginTop: 28,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIdle: { backgroundColor: colors.primary },
  buttonRunning: { backgroundColor: colors.danger },
  actionText: { color: colors.white, fontFamily, fontSize: 24, fontWeight: '800' },
  description: { marginTop: 34, color: colors.white, fontFamily, fontSize: 15, textAlign: 'center' },
  timer: { marginTop: 36, color: colors.white, fontFamily, fontSize: 38, fontWeight: '800' },
});
