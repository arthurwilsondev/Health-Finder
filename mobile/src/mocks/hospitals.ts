import { Hospital } from '../types/hospital';

export const serviceTypes = [
  'Urgência e Emergência',
  'Internação',
  'Terapia Intensiva',
  'Cirurgias e Procedimentos',
  'Pediatria',
  'Urologia',
];

export const hospitals: Hospital[] = [
  {
    id: 'sao-lucas',
    name: 'Hospital São Lucas da PUCRS',
    address: 'Av. Ipiranga, 6690',
    distanceKm: 2,
    travelMinutes: 2,
    waitMinutes: 20,
    entryTime: '19:35',
    exitTime: '19:55',
    trend: 'down',
    latitude: -30.0589,
    longitude: -51.1737,
  },
  {
    id: 'independencia',
    name: 'Hospital Independência',
    address: 'Av. Antônio de Carvalho, 450',
    distanceKm: 5,
    travelMinutes: 5,
    waitMinutes: 30,
    entryTime: '19:35',
    exitTime: '20:05',
    trend: 'stable',
    latitude: -30.0506,
    longitude: -51.1605,
  },
  {
    id: 'clinicas',
    name: 'Hospital de Clínicas',
    address: 'Rua Ramiro Barcelos, 2350',
    distanceKm: 8,
    travelMinutes: 8,
    waitMinutes: 40,
    entryTime: '19:35',
    exitTime: '20:15',
    trend: 'up',
    latitude: -30.0397,
    longitude: -51.2077,
  },
];
