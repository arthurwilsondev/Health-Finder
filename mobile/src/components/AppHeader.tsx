import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  showHome?: boolean;
};

export function AppHeader({ showHome = true }: Props) {
  return (
    <View style={styles.container}>
      {showHome ? (
        <Pressable hitSlop={12} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={34} color={colors.primarySoft} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Pressable hitSlop={12} onPress={() => {}}>
        <Ionicons name="settings-sharp" size={36} color={colors.primarySoft} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: {
    width: 34,
  },
});
