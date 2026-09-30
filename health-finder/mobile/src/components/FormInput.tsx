import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors, fontFamily } from '../constants/theme';

export function FormInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textDark}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 40,
    borderRadius: 7,
    backgroundColor: colors.primarySoft,
    color: colors.textDark,
    paddingHorizontal: 15,
    fontFamily,
    fontWeight: '700',
    fontSize: 14,
  },
});
