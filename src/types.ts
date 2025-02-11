export interface DeviceData {
  id: string;
  projectName: string;
  location: string;
  equipment: string;
  dischargeType: string;
  dischargeSeverity: number;
  dischargeFrequency: number;
  diagnosisTime: string;
  status: 'normal' | 'level1' | 'level2' | 'level3';
}

export interface ChartData {
  timestamp: number;
  value: number;
}

export interface CollectorInfo {
  type: string;
  id: string;
  location: string;
}