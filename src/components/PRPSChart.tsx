import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchChartData } from '../api/api';

interface PRPSChartProps {
  deviceId?: string;
  startTime: string;
  endTime: string;
}

interface ChartData {
  batch_start_timestamp: string;
  channel: string;
  device_agent_id: string;
  device_channel_batch_id: number;
  device_created_at: string;
  device_description: string;
  device_id: string;
  device_name: string;
  device_status: string;
  device_type: string;
  device_updated_at: string;
  end_time: string;
  initial_phase_in_degree: number;
  peak_values: number[];
  phases: number[];
  prps_x: number[];
  prps_y: number[];
  prps_z: number[][];
  pulse_x: number[];
  pulse_y: number[];
  scatter_points: [number, number, number][];
  signal_indices: number[];
  sine_wave: number[];
  start_time: string;
  threshold_in_dBmV: number;
}

export default function PRPSChart({ deviceId, startTime, endTime }: PRPSChartProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PRPSChart props:', { deviceId, startTime, endTime });
    
    const loadChartData = async () => {
      if (!deviceId) {
        console.log('No deviceId provided');
        setData(null);
        setError('请选择传感器');
        return;
      }

      try {
        console.log('Fetching chart data with params:', {
          deviceId,
          startTime,
          endTime
        });
        
        setLoading(true);
        setError(null);
        const response = await fetchChartData({
          start_time: startTime,
          end_time: endTime,
          device_id: deviceId,
          channel: 'UHF',
          threshold_in_dBmV: 0,
          initial_phase_in_degree: 0
        });
        
        const chartData = response.chart_data.charts[0];
        
        console.log('Received chart data:', {
          device_id: chartData.device_id,
          prps_x_length: chartData.prps_x?.length,
          prps_y_length: chartData.prps_y?.length,
          prps_z_length: chartData.prps_z?.length
        });
        
        if (!chartData.prps_x?.length || !chartData.prps_y?.length || !chartData.prps_z?.length) {
          console.log('No valid PRPS data in response');
          setError('所选时间段内无数据');
          setData(null);
          return;
        }
        
        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : '加载数据失败');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [deviceId, startTime, endTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-white text-gray-500">
        <p className="mb-4">{error}</p>
        <p className="text-sm">请选择其他时间段重试</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-white text-gray-500">
        <p>请选择时间段查看数据</p>
      </div>
    );
  }

  // Create a heatmap data array from prps_z
  const heatmapData = data.prps_z.map((row, i) => ({
    x: data.prps_x,
    y: [data.prps_y[i]],
    z: [row],
    type: 'heatmap' as const,
    colorscale: 'Viridis' as const,
    showscale: i === 0, // Only show colorbar for the first slice
  }));

  const layout = {
    autosize: true,
    height: 500,
    margin: { l: 50, r: 20, t: 20, b: 40 },
    showlegend: false,
    xaxis: {
      title: '相位段',
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false
    },
    yaxis: {
      title: '幅值段',
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  return (
    <Plot
      data={heatmapData}
      layout={layout}
      config={config}
      style={{ width: '100%' }}
      useResizeHandler
    />
  );
}