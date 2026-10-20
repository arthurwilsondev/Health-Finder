import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { FormInput } from '../components/FormInput';
import { colors, fontFamily } from '../constants/theme';
import { createHospital, deleteHospital, getHospitals, isAdmin } from '../services/api';
import type { Hospital } from '../types/hospital';

function parseOptionalNumber(value: string): number | undefined | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null; // null = inválido
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function AdminScreen() {
  const allowed = isAdmin();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quem não é admin não deve ver esta tela (o backend também bloqueia as ações).
  useEffect(() => {
    if (!allowed) router.replace('/home');
  }, [allowed]);

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      setHospitals(await getHospitals());
    } catch (error) {
      setHospitals([]);
      setListError(
        error instanceof Error ? error.message : 'Não foi possível carregar os hospitais.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) void loadHospitals();
  }, [allowed, loadHospitals]);

  async function handleCreate() {
    if (!nome.trim() || !endereco.trim() || !latitude.trim() || !longitude.trim() || !altitude.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha nome, endereço, latitude, longitude e altitude.',
      );
      return;
    }

    const lat = parseOptionalNumber(latitude);
    const lng = parseOptionalNumber(longitude);
    const alt = parseOptionalNumber(altitude);

    if (lat == null || lng == null || alt == null) {
      Alert.alert(
        'Valor inválido',
        'Latitude, longitude e altitude devem ser números. Use ponto como separador decimal.',
      );
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert(
        'Coordenadas inválidas',
        'A latitude deve estar entre -90 e 90 e a longitude entre -180 e 180.',
      );
      return;
    }

    setSubmitting(true);
    try {
      await createHospital({
        nome: nome.trim(),
        endereco: endereco.trim(),
        latitude: lat,
        longitude: lng,
        altitude: alt,
      });
      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setAltitude('');
      Alert.alert('Hospital cadastrado', 'O hospital foi adicionado com sucesso.');
      await loadHospitals();
    } catch (error) {
      Alert.alert(
        'Não foi possível cadastrar',
        error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar o hospital.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(hospital: Hospital) {
    Alert.alert(
      'Excluir hospital',
      `Excluir "${hospital.name}"? Os tempos registrados para ele também serão apagados. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void handleDelete(hospital),
        },
      ],
    );
  }

  async function handleDelete(hospital: Hospital) {
    setDeletingId(hospital.id);
    try {
      await deleteHospital(hospital.id);
      setHospitals((current) => current.filter((item) => item.id !== hospital.id));
    } catch (error) {
      Alert.alert(
        'Não foi possível excluir',
        error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o hospital.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!allowed) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Administrar hospitais</Text>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Adicionar hospital</Text>
            <Field label="Nome">
              <FormInput
                placeholder="Nome do hospital"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                editable={!submitting}
              />
            </Field>
            <Field label="Endereço">
              <FormInput
                placeholder="Rua, número, bairro"
                value={endereco}
                onChangeText={setEndereco}
                editable={!submitting}
              />
            </Field>
            <Field label="Latitude">
              <FormInput
                placeholder="-30.0550"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
            </Field>
            <Field label="Longitude">
              <FormInput
                placeholder="-51.1758"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
            </Field>
            <Field label="Altitude (metros)">
              <FormInput
                placeholder="10"
                value={altitude}
                onChangeText={setAltitude}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
            </Field>

            <Pressable
              style={[styles.primaryButton, submitting && styles.disabled]}
              onPress={handleCreate}
              disabled={submitting}
            >
              <Text style={styles.primaryText}>
                {submitting ? 'Cadastrando...' : 'Adicionar'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitleOutside}>Hospitais cadastrados</Text>

          {loading ? (
            <Text style={styles.status}>Carregando hospitais...</Text>
          ) : listError ? (
            <View style={styles.messageBox}>
              <Text style={styles.error}>{listError}</Text>
              <Pressable style={styles.retryButton} onPress={() => void loadHospitals()}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : hospitals.length === 0 ? (
            <Text style={styles.status}>Nenhum hospital cadastrado.</Text>
          ) : (
            <View style={styles.list}>
              {hospitals.map((hospital) => {
                const deleting = deletingId === hospital.id;
                return (
                  <View key={hospital.id} style={styles.row}>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName}>{hospital.name}</Text>
                      <Text style={styles.rowAddress}>{hospital.address}</Text>
                    </View>
                    <Pressable
                      style={[styles.deleteButton, deleting && styles.disabled]}
                      onPress={() => confirmDelete(hospital)}
                      disabled={deleting || deletingId !== null}
                    >
                      <Text style={styles.deleteText}>{deleting ? '...' : 'Excluir'}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1, paddingTop: 8 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  panel: {
    borderWidth: 4,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    gap: 14,
  },
  field: { gap: 6 },
  label: {
    color: colors.primarySoft,
    fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.white,
    fontFamily,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  sectionTitleOutside: {
    color: colors.white,
    fontFamily,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 190,
    minHeight: 52,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  primaryText: { color: colors.textDark, fontFamily, fontSize: 18, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 14,
  },
  rowInfo: { flex: 1, gap: 4 },
  rowName: { color: colors.white, fontFamily, fontSize: 15, fontWeight: '800' },
  rowAddress: { color: colors.primarySoft, fontFamily, fontSize: 12 },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteText: { color: colors.white, fontFamily, fontSize: 13, fontWeight: '800' },
  status: {
    color: colors.white,
    fontFamily,
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
  },
  messageBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 14,
  },
  error: { color: '#FFB5B5', fontFamily, fontSize: 13 },
  retryButton: {
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: colors.textDark, fontFamily, fontWeight: '800' },
});
