import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { HospitalCard } from "../components/HospitalCard";
import { HospitalMap } from "../components/HospitalMap";
import { ServiceDropdown } from "../components/ServiceDropdown";
import { colors, fontFamily } from "../constants/theme";
import { getHospitals, getServiceCategories } from "../services/api";
import type { Hospital, ServiceCategory } from "../types/hospital";

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<
    ServiceCategory | undefined
  >();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setReloadKey((key) => key + 1);
    }, []),
  );

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setHospitalError("");
      setCategoryError("");

      const [hospitalResult, categoryResult] = await Promise.allSettled([
        getHospitals(selectedService?.id),
        getServiceCategories(),
      ]);

      if (!active) return;

      if (hospitalResult.status === "fulfilled") {
        setHospitals(hospitalResult.value);
      } else {
        setHospitals([]);
        setHospitalError(
          hospitalResult.reason instanceof Error
            ? hospitalResult.reason.message
            : "Não foi possível carregar os hospitais.",
        );
      }

      if (categoryResult.status === "fulfilled") {
        setServiceTypes(categoryResult.value);
      } else {
        setServiceTypes([]);
        setCategoryError(
          categoryResult.reason instanceof Error
            ? categoryResult.reason.message
            : "Não foi possível carregar os tipos de atendimento.",
        );
      }

      setLoading(false);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [reloadKey, selectedService?.id]);

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader showHome={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.pageTitle}>Hospitais</Text>
          <Text style={styles.subtitle}>
            Média calculada com os tempos registrados pelos usuários
          </Text>
        </View>

        <ServiceDropdown
          open={open}
          selectedValue={selectedService?.name}
          options={[
            "Todos os hospitais",
            ...serviceTypes.map((service) => service.name),
          ]}
          onToggle={() => setOpen((value) => !value)}
          onSelect={(name) => {
            setSelectedService(
              name === "Todos os hospitais"
                ? undefined
                : serviceTypes.find((service) => service.name === name),
            );
            setOpen(false);
          }}
        />

        {!!categoryError && <Text style={styles.warning}>{categoryError}</Text>}

        {selectedService ? (
          <Text style={styles.info}>
            Média exibida para o atendimento: {selectedService.name}. A lista
            está em ordem alfabética.
          </Text>
        ) : (
          <Text style={styles.info}>
            Média geral de cada hospital. A lista está em ordem alfabética.
          </Text>
        )}

        <View style={styles.mapWrap}>
          <HospitalMap hospitals={hospitals} />
        </View>

        {loading ? (
          <Text style={styles.status}>Carregando dados do backend...</Text>
        ) : hospitalError ? (
          <View style={styles.messageBox}>
            <Text style={styles.error}>{hospitalError}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => setReloadKey((value) => value + 1)}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : hospitals.length === 0 ? (
          <Text style={styles.status}>
            {selectedService
              ? `Nenhum hospital está associado a ${selectedService.name}. Cadastre as associações no banco de dados.`
              : "Nenhum hospital foi cadastrado no backend."}
          </Text>
        ) : (
          <View style={styles.cards}>
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onPress={() =>
                  router.push({
                    pathname: "/timer",
                    params: {
                      hospitalId: String(hospital.id),
                      hospitalName: hospital.name,
                      latitude:
                        hospital.latitude === undefined
                          ? ""
                          : String(hospital.latitude),
                      longitude:
                        hospital.longitude === undefined
                          ? ""
                          : String(hospital.longitude),
                    },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 20,
  },
  heading: { gap: 5, alignItems: "center" },
  pageTitle: {
    color: colors.white,
    fontFamily,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: { color: colors.primarySoft, fontFamily, fontSize: 13 },
  mapWrap: { marginTop: 0 },
  cards: { gap: 16 },
  status: {
    color: colors.white,
    fontFamily,
    fontSize: 14,
    textAlign: "center",
    padding: 12,
  },
  messageBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 14,
  },
  error: { color: "#FFB5B5", fontFamily, fontSize: 13 },
  warning: { color: "#FFD8A3", fontFamily, fontSize: 12 },
  info: { color: colors.primarySoft, fontFamily, fontSize: 12, lineHeight: 18 },
  retryButton: {
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: colors.textDark, fontFamily, fontWeight: "800" },
});