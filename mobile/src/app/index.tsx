import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { FormInput } from '../components/FormInput';
import { colors, fontFamily } from '../constants/theme';
import { login } from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Informe seu e-mail e sua senha.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, senha);
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof Error ? error.message : 'Ocorreu um erro ao realizar o login.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader showHome={false} />

        <View style={styles.center}>
          <View style={styles.panel}>
            <Text style={styles.title}>Entrar no Health Finder</Text>

            <FormInput
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />
            <FormInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!submitting}
            />

            <Pressable
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={submitting}
            >
              <Text style={styles.primaryText}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <View style={styles.inlineRow}>
              <Text style={styles.bottomText}>Ainda não tem conta? </Text>
              <Pressable disabled={submitting} onPress={() => router.push('/register')}>
                <Text style={styles.underline}>Criar aqui</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 70 },
  panel: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 25,
    gap: 28,
  },
  title: {
    color: colors.white,
    fontFamily,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 190,
    minHeight: 58,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryText: { color: colors.textDark, fontFamily, fontSize: 20, fontWeight: '800' },
  inlineRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  bottomText: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14 },
  underline: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
});
