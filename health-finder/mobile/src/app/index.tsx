import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { FormInput } from '../components/FormInput';
import { colors, fontFamily } from '../constants/theme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader />

      <View style={styles.center}>
        <View style={styles.panel}>
          <Text style={styles.title}>Entrar no health finder</Text>

          <FormInput placeholder="Nome de usuario ou Email" autoCapitalize="none" />
          <FormInput placeholder="Senha" secureTextEntry />

          <Pressable style={styles.forgot} onPress={() => {}}>
            <Text style={styles.link}>Recuperar senha</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/home')}>
            <Text style={styles.primaryText}>Entrar</Text>
          </Pressable>

          <View style={styles.inlineRow}>
            <Text style={styles.bottomText}>Ainda não tem conta? </Text>
            <Pressable onPress={() => router.push('/register')}>
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
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 90 },
  panel: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 36,
    paddingTop: 30,
    paddingBottom: 25,
    gap: 35,
  },
  title: {
    color: colors.white,
    fontFamily,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  forgot: { alignSelf: 'flex-end', marginTop: -24 },
  link: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14 },
  primaryButton: {
    width: 190,
    height: 64,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  primaryText: { color: colors.white, fontFamily, fontSize: 24, fontWeight: '800' },
  inlineRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: -16 },
  bottomText: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14 },
  underline: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
});
