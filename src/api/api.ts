import axios from 'axios';

// Use HTTPS for the API endpoint
const API_BASE_URL = 'https://pdda.shuwantech.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // Important: Allow credentials and handle CORS
  withCredentials: false // Set to false for cross-origin requests without credentials
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    console.log('Received response:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new Error(error.response.data.detail || 'Server error');
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response received');
      throw new Error('API服务器无法访问 - 请确保服务器支持HTTPS');
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      throw new Error('Request configuration error');
    }
  }
);

export interface EquipmentStatus {
  entity_id: string | null;
  entity_name: string | null;
  entity_description: string | null;
  monitored_equipment_id: string | null;
  monitored_equipment_name: string | null;
  monitored_equipment_description: string | null;
  monitored_equipment_status: string | null;
  discharge_type: string | null;
  discharge_severity: string | null;
  discharge_frequency: string | null;
  diagnosis_time: string | null;
  report_query: string | null;
}

export interface EquipmentStatusResponse {
  items: EquipmentStatus[];
}

export interface DeviceStatus {
  entity_id: string | null;
  entity_name: string | null;
  entity_description: string | null;
  monitored_equipment_id: string;
  monitored_equipment_name: string;
  monitored_equipment_description: string;
  ipc_id: string;
  ipc_name: string;
  ipc_description: string;
  device_id: string;
  device_name: string;
  device_description: string;
  device_firmware_version: string;
  device_status: string;
  device_voltage: string;
}

export interface DeviceStatusResponse {
  items: DeviceStatus[];
}

export interface ChartDataResponse {
  start_time: string;
  end_time: string;
  device_id: string | null;
  channel: string;
  threshold_in_dBmV: number;
  initial_phase_in_degree: number;
  phases: number[];
  sine_wave: number[];
  scatter_points: [number, number, number][];
  signal_indices: number[];
  peak_values: number[];
  pulse_x: number[];
  pulse_y: number[];
  prps_x: number[];
  prps_y: number[];
  prps_z: number[][];
}

export const getEquipmentStatus = async (params: {
  skip?: number;
  limit?: number;
  sort_field?: string;
  sort_order?: string;
} = {}): Promise<EquipmentStatusResponse> => {
  try {
    const response = await api.get<EquipmentStatusResponse>('/equipment_status', {
      params: {
        skip: params.skip || 0,
        limit: params.limit || 10,
        sort_field: params.sort_field || 'monitored_equipment_name',
        sort_order: params.sort_order || 'ASC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch equipment status:', error);
    throw error;
  }
};

export const getDeviceStatus = async (params: {
  skip?: number;
  limit?: number;
  sort_field?: string;
  sort_order?: string;
} = {}): Promise<DeviceStatusResponse> => {
  try {
    const response = await api.get<DeviceStatusResponse>('/device_status', {
      params: {
        skip: params.skip || 0,
        limit: params.limit || 10,
        sort_field: params.sort_field || 'device_name',
        sort_order: params.sort_order || 'ASC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch device status:', error);
    throw error;
  }
};

export const getEquipmentDeviceStatus = async (params: {
  equipment_id: string;
  skip?: number;
  limit?: number;
  sort_field?: string;
  sort_order?: string;
}): Promise<DeviceStatusResponse> => {
  try {
    const response = await api.get<DeviceStatusResponse>('/equipment_device_status', {
      params: {
        equipment_id: params.equipment_id,
        skip: params.skip || 0,
        limit: params.limit || 10,
        sort_field: params.sort_field || 'device_name',
        sort_order: params.sort_order || 'ASC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch equipment device status:', error);
    console.log(params);
    throw error;
  }
};

const formatDateTime = (dateTime: string): string => {
  // Parse the input date string
  const date = new Date(dateTime);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  // Format to YYYY-MM-DDT00:00:00
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
};

export const fetchChartData = async (params: {
  start_time: string;
  end_time: string;
  device_id?: string;
  channel?: string;
  threshold_in_dBmV?: number;
  initial_phase_in_degree?: number;
  cycle_value?: number;
  height_value?: number;
  total_time?: number;
}): Promise<ChartDataResponse> => {
  try {
    // Format the dates to ensure they match the required format YYYY-MM-DDT00:00:00
    const formattedStartTime = formatDateTime(params.start_time);
    const formattedEndTime = formatDateTime(params.end_time);

    const response = await api.get<ChartDataResponse>('/chart_data', {
      params: {
        ...params,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
    throw error;
  }
};