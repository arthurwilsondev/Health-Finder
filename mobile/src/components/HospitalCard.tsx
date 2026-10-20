import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../constants/theme';
import type { Hospital } from '../types/hospital';

type Props = {
  hospital: Hospital;
  onPress?: () => void;
};

function formatWait(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  if (minutes > 0) return `${minutes}min ${seconds.toString().padStart(2, '0')}s`;
  return `${seconds}s`;
}

export function HospitalCard({ hospital, onPress }: Props) {
  const hasCoordinates =
    typeof hospital.latitude === 'number' &&
    typeof hospital.longitude === 'number';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.locationBox}>
        <Text style={styles.locationCaption}>LOCALIZAÇÃO</Text>
        {hasCoordinates ? (
          <>
            <Text style={styles.coordinate}>Lat. {hospital.latitude!.toFixed(4)}</Text>
            <Text style={styles.coordinate}>Long. {hospital.longitude!.toFixed(4)}</Text>
          </>
        ) : (
          <Text style={styles.coordinate}>Sem coordenadas</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{hospital.name}</Text>
        <Text style={styles.detail}>{hospital.address}</Text>
        <View style={styles.averageBox}>
          <Text style={styles.averageLabel}>MÉDIA DE ESPERA</Text>
          {typeof hospital.averageWaitSeconds === 'number' && hospital.recordedWaits
            ? (
              <>
                <Text style={styles.averageValue}>{formatWait(hospital.averageWaitSeconds)}</Text>
                <Text style={styles.averageCount}>
                  {hospital.recordedWaits} {hospital.recordedWaits === 1 ? 'registro' : 'registros'}
                </Text>
              </>
            )
            : (
              <Text style={styles.averageEmpty}>Ainda sem registros</Text>
            )}
        </View>
        {typeof hospital.altitude === 'number' && (
          <Text style={styles.detail}>Altitude: {hospital.altitude} m</Text>
        )}
        {onPress && <Text style={styles.actionHint}>Toque para iniciar o cronômetro</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 135,
    borderRadius: 17,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  locationBox: {
    width: 112,
    minHeight: 105,
    borderRadius: 11,
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    gap: 5,
  },
  locationCaption: {
    color: colors.primarySoft,
    fontFamily,
    fontWeight: '800',
    fontSize: 10,
    textAlign: 'center',
  },
  coordinate: {
    color: colors.white,
    fontFamily,
    fontSize: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 9,
  },
  name: {
    color: colors.white,
    fontFamily,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
  },
  detail: {
    color: colors.white,
    fontFamily,
    fontSize: 14,
  },
  averageBox: {
    marginTop: 3,
    padding: 9,
    borderRadius: 9,
    backgroundColor: colors.surfaceDark,
    gap: 3,
  },
  averageLabel: {
    color: colors.primarySoft,
    fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  averageValue: {
    color: colors.white,
    fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  averageCount: {
    color: colors.primarySoft,
    fontFamily,
    fontSize: 11,
  },
  averageEmpty: {
    color: colors.white,
    fontFamily,
    fontSize: 12,
  },
  actionHint: {
    color: colors.primarySoft,
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
});