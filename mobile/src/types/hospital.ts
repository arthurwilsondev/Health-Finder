export type Hospital = {
  id: string;
  name: string;
  address: string;
  altitude?: number;
  latitude?: number;
  longitude?: number;
  averageWaitSeconds?: number;
  recordedWaits?: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
};