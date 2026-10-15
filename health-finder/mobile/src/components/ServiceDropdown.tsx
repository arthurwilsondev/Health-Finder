import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../constants/theme';

export type ServiceDropdownProps = {
  open: boolean;
  options: string[];
  onToggle: () => void;
  onSelect: (value: string) => void;
  selectedValue?: string;
};

export function ServiceDropdown({
  open,
  options,
  onToggle,
  onSelect,
  selectedValue,
}: ServiceDropdownProps) {
  return (
    <View style={styles.host}>
      <Pressable style={styles.button} onPress={onToggle}>
        <Text style={styles.buttonText} numberOfLines={1}>
          {selectedValue || 'Buscar tipos de atendimento'}
        </Text>
        <Ionicons name={open ? 'caret-up' : 'caret-down'} size={22} color={colors.textDark} />
      </Pressable>

      {open && (
        <View style={styles.menu}>
          {options.length === 0 ? (
            <View style={styles.option}>
              <Text style={styles.optionText}>Nenhuma categoria carregada</Text>
            </View>
          ) : (
            options.map((option, index) => (
              <Pressable key={option} onPress={() => onSelect(option)} style={styles.option}>
                <Text style={styles.optionText} numberOfLines={2}>{option}</Text>
                {index < options.length - 1 && <View style={styles.divider} />}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'relative',
    zIndex: 20,
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    marginRight: 8,
    color: colors.textDark,
    fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  menu: {
    position: 'absolute',
    top: 47,
    left: 8,
    right: 8,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  option: {
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  optionText: {
    color: colors.white,
    fontFamily,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.divider,
  },
});
