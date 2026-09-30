import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalMap } from '../components/HospitalMap';
import { ServiceDropdown } from '../components/ServiceDropdown';
import { colors, fontFamily } from '../constants/theme';
import { hospitals, serviceTypes } from '../mocks/hospitals';

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<string>();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Pressable style={styles.locationBox} onPress={() => {}}>
            <Text style={styles.locationText}>Rua minha localização, 123</Text>
          </Pressable>
          <Pressable hitSlop={12} onPress={() => {}}>
            <Ionicons name="settings-sharp" size={39} color={colors.primarySoft} />
          </Pressable>
        </View>

        <ServiceDropdown
          open={open}
          options={serviceTypes}
          onToggle={() => setOpen((value) => !value)}
          onSelect={(value) => {
            setService(value);
            setOpen(false);
          }}
        />

        <View style={styles.mapWrap}>
          <HospitalMap />
        </View>

        <View style={styles.cards}>
          {hospitals.map((hospital, index) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              highlighted={index === 0}
              onPress={index === 0 ? () => router.push('/timer') : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 40, paddingTop: 22, paddingBottom: 20, gap: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingLeft: 40 },
  locationBox: {
    flex: 1,
    height: 47,
    backgroundColor: colors.primarySoft,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  locationText: { color: colors.textDark, fontFamily, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  mapWrap: { marginTop: 0 },
  cards: { gap: 20 },
});
