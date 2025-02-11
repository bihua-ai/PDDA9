import { Eye } from 'lucide-react';
import { EquipmentStatus, getEquipmentStatus, getEquipmentDeviceStatus } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface EquipmentTableProps {
  equipments?: EquipmentStatus[]; // Make optional since we'll load from API
}

export default function EquipmentTable({ equipments: initialEquipments }: EquipmentTableProps) {
  const [equipments, setEquipments] = useState<EquipmentStatus[]>(initialEquipments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();

  const loadEquipments = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEquipmentStatus({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort_field: 'monitored_equipment_name',
        sort_order: 'ASC'
      });
      setEquipments(response.items);
      setTotalPages(Math.ceil(16 / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialEquipments) {
      loadEquipments(currentPage);
    }
  }, [currentPage, initialEquipments]);

  const handleReportClick = async (equipment: EquipmentStatus) => {
    try {
      const deviceStatus = await getEquipmentDeviceStatus({
        equipment_id: equipment.monitored_equipment_id || '',
        skip: 0,
        limit: 100,
        sort_field: 'device_name',
        sort_order: 'ASC'
      });
      
      // Navigate to device detail with the device data
      navigate(`/equipment/${equipment.monitored_equipment_id}`, {
        state: {
          equipmentData: equipment,
          deviceData: deviceStatus.items
        }
      });
    } catch (err) {
      console.error('Failed to fetch device status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'level1': return 'text-yellow-500';
      case 'level2': return 'text-orange-500';
      case 'level3': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常';
      case 'level1': return '一级';
      case 'level2': return '二级';
      case 'level3': return '三级';
      default: return '未知';
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
          onClick={() => loadEquipments(currentPage)}
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
            <th className="py-3 px-6 text-left">项目地点</th>
            <th className="py-3 px-6 text-left">监测设备</th>
            <th className="py-3 px-6 text-left">放电类型</th>
            <th className="py-3 px-6 text-left">放电严重度</th>
            <th className="py-3 px-6 text-left">放电频次</th>
            <th className="py-3 px-6 text-left">诊断时间</th>
            <th className="py-3 px-6 text-left">设备状态</th>
            <th className="py-3 px-6 text-left">报告查询</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {equipments.map((equipment) => (
            <tr key={equipment.monitored_equipment_id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">
                <input type="checkbox" className="rounded border-gray-300" />
              </td>
              <td className="py-3 px-6">{equipment.entity_name}</td>
              <td className="py-3 px-6">{equipment.entity_description}</td>
              <td className="py-3 px-6">{equipment.monitored_equipment_name}</td>
              <td className="py-3 px-6">{equipment.discharge_type || '无'}</td>
              <td className="py-3 px-6">
                {equipment.discharge_severity ? `${equipment.discharge_severity}%` : '-'}
              </td>
              <td className="py-3 px-6">{equipment.discharge_frequency ? `${equipment.discharge_frequency}次/秒` : '-'}</td>
              <td className="py-3 px-6">{equipment.diagnosis_time}</td>
              <td className="py-3 px-6">
                <span className={`inline-flex items-center ${getStatusColor(equipment.monitored_equipment_status || 'normal')}`}>
                  ● {getStatusText(equipment.monitored_equipment_status || 'normal')}
                </span>
              </td>
              <td className="py-3 px-6">
                <button 
                  onClick={() => handleReportClick(equipment)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} />
                  <span>{equipment.report_query}</span>
                </button>
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