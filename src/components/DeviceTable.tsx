import { useState, useEffect } from 'react';
import { DeviceStatus, getDeviceStatus } from '../api/api';

interface DeviceTableProps {
  devices?: DeviceStatus[]; // Make optional since we'll load from API
}

export default function DeviceTable({ devices: initialDevices }: DeviceTableProps) {
  const [devices, setDevices] = useState<DeviceStatus[]>(initialDevices || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  const loadDevices = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDeviceStatus({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort_field: 'device_name',
        sort_order: 'ASC'
      });
      setDevices(response.items);
      // Assuming the total count would be 16 as shown in the UI
      setTotalPages(Math.ceil(16 / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialDevices) {
      loadDevices(currentPage);
    }
  }, [currentPage, initialDevices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case '正常': return 'text-green-500';
      case 'abnormal':
      case '异常': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常';
      case 'abnormal': return '异常';
      default: return status || '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => loadDevices(currentPage)}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
            <th className="py-3 px-6 text-left">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="py-3 px-6 text-left">项目名称</th>
            <th className="py-3 px-6 text-left">监测设备</th>
            <th className="py-3 px-6 text-left">安装位置</th>
            <th className="py-3 px-6 text-left">传感器名称</th>
            <th className="py-3 px-6 text-left">传感器电压</th>
            <th className="py-3 px-6 text-left">固件版本号</th>
            <th className="py-3 px-6 text-left">传感器ID</th>
            <th className="py-3 px-6 text-left">传感器状态</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {devices.map((device) => (
            <tr key={device.device_id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">
                <input type="checkbox" className="rounded border-gray-300" />
              </td>
              <td className="py-3 px-6">{device.entity_name}</td>
              <td className="py-3 px-6">{device.monitored_equipment_name}</td>
              <td className="py-3 px-6">{device.device_description}</td>
              <td className="py-3 px-6">{device.device_name}</td>
              <td className="py-3 px-6">{device.device_voltage}</td>
              <td className="py-3 px-6">{device.device_firmware_version}</td>
              <td className="py-3 px-6">{device.device_id}</td>
              <td className="py-3 px-6">
                <span className={`inline-flex items-center ${getStatusColor(device.device_status)}`}>
                  ● {getStatusText(device.device_status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="py-4 px-6 flex items-center justify-between bg-white">
        <span className="text-sm text-gray-600">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, 16)} of 16 entries
        </span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded text-sm ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
          >
            prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border rounded text-sm ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-50'
            }`}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
}