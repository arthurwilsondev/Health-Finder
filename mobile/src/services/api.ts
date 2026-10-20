import type { Hospital, ServiceCategory } from '../types/hospital';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

type JsonRecord = Record<string, unknown>;

let accessToken: string | null = null;
let adminSession = false;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Só controla o que a interface mostra. A autorização de verdade é feita no backend.
export function isAdmin(): boolean {
  return adminSession;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Não foi possível conectar à API (${API_BASE_URL}). Confira se o backend está ligado e se EXPO_PUBLIC_API_URL aponta para o endereço correto.`
    );
  }

  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const data = payload && typeof payload === 'object' ? payload as JsonRecord : {};
    const message =
      (typeof data.mensagem === 'string' && data.mensagem) ||
      (typeof data.erro === 'string' && data.erro) ||
      (typeof data.error === 'string' && data.error) ||
      (typeof payload === 'string' && payload) ||
      `A API respondeu com erro ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? value as JsonRecord : {};
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function numberValue(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function getHospitals(categoriaId?: string): Promise<Hospital[]> {
  const query = categoriaId ? `?categoriaId=${encodeURIComponent(categoriaId)}` : '';
  const result = await request<unknown>(`/hospital${query}`);

  if (!Array.isArray(result)) {
    throw new Error('A API /hospital não retornou uma lista válida.');
  }

  return result.map((item, index) => {
    const row = asRecord(item);
    const name = stringValue(row.nome ?? row.name, `Hospital ${index + 1}`);
    const rawLatitude = numberValue(row.latitude);
    const rawLongitude = numberValue(row.longitude);
    const coordinatesAreValid =
      rawLatitude !== undefined &&
      rawLongitude !== undefined &&
      !(rawLatitude === 0 && rawLongitude === 0) &&
      rawLatitude >= -90 && rawLatitude <= 90 &&
      rawLongitude >= -180 && rawLongitude <= 180;

    // Coordenadas (0, 0) são usadas com frequência como placeholder em registros
    // ainda não georreferenciados; não devem virar marcadores na costa da África.
    return {
      id: stringValue(
        row.id_hospital ?? row.idHospital ?? row.hospital_id ?? row.id,
        `${name}-${index}`
      ),
      name,
      address: stringValue(row.endereco ?? row.address, 'Endereço não informado'),
      altitude: numberValue(row.altitude),
      latitude: coordinatesAreValid ? rawLatitude : undefined,
      longitude: coordinatesAreValid ? rawLongitude : undefined,
      averageWaitSeconds: numberValue(row.media_tempo_segundos),
      recordedWaits: numberValue(row.quantidade_registros) ?? 0,
    };
  });
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const result = await request<unknown>('/atendimentoCategoria');

  if (!Array.isArray(result)) {
    throw new Error('A API /atendimentoCategoria não retornou uma lista válida.');
  }

  return result.map((item, index) => {
    const row = asRecord(item);
    const name = stringValue(row.nome ?? row.name, `Atendimento ${index + 1}`);

    return {
      id: stringValue(
        row.id_atendimento_categoria ?? row.idAtendimento ?? row.id_categoria ?? row.id,
        `${name}-${index}`
      ),
      name,
    };
  });
}

export async function login(email: string, senha: string): Promise<void> {
  const result = await request<JsonRecord>('/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), senha }),
  });

  if (typeof result.token !== 'string' || !result.token) {
    throw new Error('O backend não retornou um token de autenticação.');
  }

  setAccessToken(result.token);
  adminSession = result.admin === true;
}

export async function registerUser(nome: string, email: string, senha: string): Promise<void> {
  await request('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
  });
}

export type HospitalWaitStats = {
  averageWaitSeconds?: number;
  recordedWaits: number;
};

export async function recordWaitTime(
  hospitalId: string,
  tempoSegundos: number,
  categoriaId?: string,
): Promise<void> {
  const numericHospitalId = Number(hospitalId);
  const numericCategoryId = categoriaId ? Number(categoriaId) : null;

  if (!Number.isSafeInteger(numericHospitalId) || numericHospitalId < 1) {
    throw new Error('Não foi possível identificar o hospital para salvar o tempo.');
  }

  await request('/tempos-espera', {
    method: 'POST',
    body: JSON.stringify({
      hospitalId: numericHospitalId,
      categoriaId: numericCategoryId,
      tempoSegundos,
    }),
  });
}

export type NewHospital = {
  nome: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
};

// --- Funções de administrador (o backend exige token de admin) ---

export async function createHospital(hospital: NewHospital): Promise<void> {
  await request('/hospital', {
    method: 'POST',
    body: JSON.stringify(hospital),
  });
}

export async function deleteHospital(hospitalId: string): Promise<void> {
  const numericId = Number(hospitalId);

  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    throw new Error('ID de hospital inválido.');
  }

  await request(`/hospital/${numericId}`, { method: 'DELETE' });
}
