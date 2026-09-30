import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../constants/theme';
import { Hospital } from '../types/hospital';

type Props = {
  hospital: Hospital;
  highlighted?: boolean;
  onPress?: () => void;
};

export function HospitalCard({ hospital, highlighted = false, onPress }: Props) {
  const trendIcon = hospital.trend === 'down' ? 'arrow-down' : hospital.trend === 'up' ? 'arrow-up' : null;
  const trendColor = hospital.trend === 'up' ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, highlighted && styles.highlighted]}
    >
      <View style={styles.waitBox}>
        <Text style={styles.waitCaption}>Tempo de{`\n`}atendimento</Text>
        <View style={styles.waitValueRow}>
          <Text style={styles.waitValue}>{hospital.waitMinutes} min</Text>
          {trendIcon && <Ionicons name={trendIcon} size={20} color={trendColor} />}
        </View>
        <Text style={styles.times}>Entrada {hospital.entryTime}{`\n`}Saída  {hospital.exitTime}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{hospital.name}</Text>
        <Text style={styles.detail} numberOfLines={1}>{hospital.address}</Text>
        <Text style={styles.detail}>Distância {hospital.distanceKm}km - Tempo {hospital.travelMinutes}min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 165,
    borderRadius: 17,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  waitBox: {
    width: 103,
    minHeight: 137,
    borderRadius: 11,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  waitCaption: {
    color: colors.white,
    fontFamily,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  waitValueRow: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitValue: {
    color: colors.white,
    fontFamily,
    fontSize: 16,
  },
  times: {
    color: colors.white,
    fontFamily,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  name: {
    color: colors.white,
    fontFamily,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  detail: {
    color: colors.white,
    fontFamily,
    fontSize: 15,
  },
});
