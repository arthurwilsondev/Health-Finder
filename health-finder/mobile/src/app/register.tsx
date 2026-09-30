import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { FormInput } from '../components/FormInput';
import { colors, fontFamily } from '../constants/theme';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader />

      <View style={styles.center}>
        <View style={styles.panel}>
          <Text style={styles.title}>Criar conta</Text>
          <FormInput placeholder="Nome de usuario" />
          <FormInput placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <FormInput placeholder="Senha" secureTextEntry />

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/home')}>
            <Text style={styles.primaryText}>Criar</Text>
          </Pressable>

          <View style={styles.inlineRow}>
            <Text style={styles.bottomText}>Já tem conta? </Text>
            <Pressable onPress={() => router.replace('/')}>
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
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 70 },
  panel: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 35,
  },
  title: { color: colors.white, fontFamily, fontSize: 24, fontWeight: '800', textAlign: 'center' },
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
  },
  primaryText: { color: colors.white, fontFamily, fontSize: 24, fontWeight: '800' },
  inlineRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: -18 },
  bottomText: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14 },
  underline: { color: colors.white, fontFamily, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
});
