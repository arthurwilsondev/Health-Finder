export type WaitTrend = 'down' | 'up' | 'stable';

export type Hospital = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  travelMinutes: number;
  waitMinutes: number;
  entryTime: string;
  exitTime: string;
  trend: WaitTrend;
  latitude: number;
  longitude: number;
};
