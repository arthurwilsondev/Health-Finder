import type { Hospital, ServiceCategory } from '../types/hospital';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

type JsonRecord = Record<string, unknown>;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
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

export async function getHospitals(): Promise<Hospital[]> {
  const result = await request<unknown>('/hospital');

  if (!Array.isArray(result)) {
    throw new Error('A API /hospital não retornou uma lista válida.');
  }

  return result.map((item, index) => {
    const row = asRecord(item);
    const name = stringValue(row.nome ?? row.name, `Hospital ${index + 1}`);

    return {
      id: stringValue(
        row.id_hospital ?? row.idHospital ?? row.hospital_id ?? row.id,
        `${name}-${index}`
      ),
      name,
      address: stringValue(row.endereco ?? row.address, 'Endereço não informado'),
      altitude: numberValue(row.altitude),
      latitude: numberValue(row.latitude),
      longitude: numberValue(row.longitude),
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
}

export async function registerUser(nome: string, email: string, senha: string): Promise<void> {
  await request('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
  });
}
