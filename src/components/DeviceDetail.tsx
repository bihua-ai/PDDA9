import { useState, useEffect } from 'react';
import { Download, ArrowLeft, Sliders } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { DeviceStatus, EquipmentStatus } from '../api/api';
import PRPDChart from './PRPDChart';
import PRPSChart from './PRPSChart';
import PulseDistributionChart from './PulseDistributionChart';
import SignalChart from './SignalChart';

interface LocationState {
  equipmentData: EquipmentStatus;
  deviceData: DeviceStatus[];
}

function DeviceDetail() {
  const location = useLocation();
  const { equipmentData, deviceData } = location.state as LocationState;
  const [selectedDate, setSelectedDate] = useState('2020-06-13');
  const [timeRange, setTimeRange] = useState('24h');
  const [dataType, setDataType] = useState('UHF');
  const [activeTab, setActiveTab] = useState('原始数据');
  const [activeSubTab, setActiveSubTab] = useState('局放信号');
  const [selectedAnalysisTab, setSelectedAnalysisTab] = useState('PRPD图谱分析');
  const [selectedCollector, setSelectedCollector] = useState('');
  const [customStartDate, setCustomStartDate] = useState('2020-06-13');
  const [customEndDate, setCustomEndDate] = useState('2020-06-13');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showTimeframeHelp, setShowTimeframeHelp] = useState(false);

  useEffect(() => {
    console.log('DeviceDetail mounted, deviceData:', deviceData);
    if (deviceData && deviceData.length > 0) {
      console.log('Setting initial collector:', deviceData[0].device_id);
      setSelectedCollector(deviceData[0].device_id);
    }
  }, [deviceData]);

  const tabs = [
    { key: '原始数据', label: '原始数据' },
    { key: '局放趋势分析', label: '局放趋势分析' }
  ];

  const subTabs = [
    { key: '局放信号', label: '局放信号' },
    { key: '温湿度数据', label: '温湿度数据' }
  ];

  const analysisTabs = [
    { key: '放电脉冲分析', label: '放电脉冲分析' },
    { key: '相位相关性分析', label: '相位相关性分析' },
    { key: 'PF相频图谱分析', label: 'PF相频图谱分析' },
    { key: 'PRPD图谱分析', label: 'PRPD图谱分析' },
    { key: 'PRPS图谱分析', label: 'PRPS图谱分析' }
  ];

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Time range changed:', value);
    setTimeRange(value);
    setIsCustomRange(value === 'custom');
    setShowTimeframeHelp(false); // Reset help message when timeframe changes
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Date changed:', e.target.value);
    setSelectedDate(e.target.value);
    setShowTimeframeHelp(false); // Reset help message when date changes
  };

  // Transform device data into collectors format
  const collectors = deviceData.map(device => ({
    type: device.device_name,
    id: device.device_id,
    location: device.device_description
  }));

  const renderChart = () => {
    const commonProps = {
      deviceId: selectedCollector,
      startTime: isCustomRange ? customStartDate : selectedDate,
      endTime: isCustomRange ? customEndDate : selectedDate
    };

    switch (selectedAnalysisTab) {
      case 'PRPD图谱分析':
        return <PRPDChart {...commonProps} />;
      case 'PRPS图谱分析':
        return <PRPSChart {...commonProps} />;
      case '放电脉冲分析':
        return <PulseDistributionChart {...commonProps} />;
      case '相位相关性分析':
        return <SignalChart {...commonProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-[500px] bg-white text-gray-500">
            <p>该图表类型正在开发中</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-blue-600">
                  <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-semibold">{equipmentData.monitored_equipment_name}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg">
                  <Sliders size={20} />
                  <span>阈值设置</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Download size={20} />
                  <span>下载</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 p-6">
            {/* Left Column - Switchgear Image and Collectors */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg border p-4 mb-4">
                <div className="relative">
                  <img 
                    src="https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/switchgear/magnum-ds-low-voltage-switchgear/overview-gallery/lva-profile-magnumds-switchgear-august2014.jpg" 
                    alt="Switchgear" 
                    className="w-full rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-yellow-500 text-white">
                      {equipmentData.monitored_equipment_status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                {collectors.map((collector) => (
                  <div key={collector.id} className="flex items-center space-x-2 mb-2 last:mb-0">
                    <input 
                      type="radio" 
                      name="collector" 
                      value={collector.id}
                      checked={selectedCollector === collector.id}
                      onChange={(e) => {
                        setSelectedCollector(e.target.value);
                        setShowTimeframeHelp(false); // Reset help message when collector changes
                      }}
                      className="text-blue-600" 
                    />
                    <span className="text-sm">{collector.type}, {collector.id}, {collector.location}</span>
                    <Sliders size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Analysis Content */}
            <div className="col-span-9">
              {/* Main Tabs */}
              <div className="border-b mb-4">
                <div className="flex space-x-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`px-4 py-2 font-medium ${
                        activeTab === tab.key
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Tabs */}
              <div className="border-b mb-4">
                <div className="flex space-x-6">
                  {subTabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`px-4 py-2 font-medium ${
                        activeSubTab === tab.key
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setActiveSubTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analysis Tabs */}
              <div className="border-b mb-4">
                <div className="flex space-x-6">
                  {analysisTabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`px-4 py-2 font-medium ${
                        selectedAnalysisTab === tab.key
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                      onClick={() => {
                        setSelectedAnalysisTab(tab.key);
                        setShowTimeframeHelp(false); // Reset help message when analysis tab changes
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Type Selection */}
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  {!isCustomRange ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={handleDateChange}
                        className="border rounded px-3 py-2" 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => {
                          setCustomStartDate(e.target.value);
                          setShowTimeframeHelp(false);
                        }}
                        className="border rounded px-3 py-2" 
                      />
                      <span>-</span>
                      <input 
                        type="date" 
                        value={customEndDate} 
                        onChange={(e) => {
                          setCustomEndDate(e.target.value);
                          setShowTimeframeHelp(false);
                        }}
                        className="border rounded px-3 py-2" 
                      />
                    </div>
                  )}
                  <select 
                    value={timeRange} 
                    onChange={handleTimeRangeChange}
                    className="border rounded px-3 py-2"
                  >
                    <option value="24h">24h</option>
                    <option value="48h">48h</option>
                    <option value="7d">7天</option>
                    <option value="30d">30天</option>
                    <option value="custom">自定义</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    {['UHF', 'TEV', 'AE'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setDataType(type)}
                        className={`px-3 py-1 rounded ${
                          dataType === type ? 'bg-blue-600 text-white' : 'border'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeframe Help Message */}
                {showTimeframeHelp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                    <p className="text-sm">
                      未能找到所选时间段的数据。建议：
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2">
                      <li>尝试选择其他日期范围</li>
                      <li>确保选择的时间段在设备运行期间</li>
                      <li>检查所选传感器是否正确</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="bg-white p-4 rounded-lg border">
                {renderChart()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetail;
