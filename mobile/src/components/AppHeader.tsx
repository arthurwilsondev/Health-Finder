import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../constants/theme';
import { isAdmin } from '../services/api';

type Props = {
  showHome?: boolean;
};

export function AppHeader({ showHome = true }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const admin = isAdmin();

  return (
    <View style={styles.container}>
      {showHome ? (
        <Pressable hitSlop={12} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={34} color={colors.primarySoft} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Pressable
        hitSlop={12}
        onPress={() => {
          if (admin) setMenuOpen((value) => !value);
        }}
      >
        <Ionicons name="settings-sharp" size={36} color={colors.primarySoft} />
      </Pressable>

      {admin && menuOpen && (
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/admin');
            }}
          >
            <Ionicons name="business-outline" size={20} color={colors.white} />
            <Text style={styles.menuText}>Administrar hospitais</Text>
          </Pressable>
        </View>
      )}
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
    zIndex: 50,
  },
  placeholder: {
    width: 34,
  },
  menu: {
    position: 'absolute',
    top: 46,
    right: 20,
    zIndex: 60,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuText: {
    color: colors.white,
    fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
});
