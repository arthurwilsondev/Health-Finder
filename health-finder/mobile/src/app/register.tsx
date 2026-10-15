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
import { registerUser } from '../services/api';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(nome, email, senha);
      Alert.alert(
        'Conta criada',
        'Seu cadastro foi enviado ao backend. Entre com seu e-mail e senha.',
        [{ text: 'Ir para o login', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível criar a conta',
        error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar.'
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
            <Text style={styles.title}>Criar conta</Text>
            <FormInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              editable={!submitting}
            />
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
              onPress={handleRegister}
              disabled={submitting}
            >
              <Text style={styles.primaryText}>
                {submitting ? 'Cadastrando...' : 'Criar'}
              </Text>
            </Pressable>

            <View style={styles.inlineRow}>
              <Text style={styles.bottomText}>Já tem conta? </Text>
              <Pressable disabled={submitting} onPress={() => router.replace('/')}>
                <Text style={styles.underline}>Entrar aqui</Text>
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
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 50 },
  panel: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 25,
  },
  title: { color: colors.white, fontFamily, fontSize: 24, fontWeight: '800', textAlign: 'center' },
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
