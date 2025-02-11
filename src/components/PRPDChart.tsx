import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { ChartDataResponse, fetchChartData } from '../api/api';

interface PRPDChartProps {
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

export default function PRPDChart({ deviceId, startTime, endTime }: PRPDChartProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PRPDChart props:', { deviceId, startTime, endTime });
    
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
        
        // Check if charts array is empty
        if (!response.chart_data.charts || response.chart_data.charts.length === 0) {
          console.log('No chart data available');
          setError('所选时间段内无数据');
          setData(null);
          return;
        }

        const chartData = response.chart_data.charts[0];
        
        // Check if we have valid data to plot
        if (!chartData.phases?.length || !chartData.scatter_points?.length) {
          console.log('No valid data in response');
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
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center h-[500px] bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-white text-gray-500">
        <p className="mb-4">{error}</p>
        <p className="text-sm">请选择其他时间段重试</p>
      </div>
    );
  }

  if (!data) {
    console.log('No data available to render');
    return (
      <div className="flex items-center justify-center h-[500px] bg-white text-gray-500">
        <p>请选择时间段查看数据</p>
      </div>
    );
  }

  // Extract x, y coordinates and intensity values from scatter_points
  const scatterX = data.scatter_points.map(point => point[0]);
  const scatterY = data.scatter_points.map(point => point[1]);
  const intensities = data.scatter_points.map(point => point[2]);

  console.log('Rendering chart with data:', {
    phases_count: data.phases.length,
    scatter_points_count: data.scatter_points.length,
    sample_scatter_points: data.scatter_points.slice(0, 5),
    intensity_range: {
      min: Math.min(...intensities),
      max: Math.max(...intensities)
    }
  });

  const plotData = [
    // Reference sine wave
    {
      x: data.phases,
      y: data.sine_wave,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: '相位参考',
      line: { color: 'rgba(156, 163, 175, 0.5)', dash: 'dot' }
    },
    // Discharge points with intensity coloring
    {
      x: scatterX,
      y: scatterY,
      type: 'scatter' as const,
      mode: 'markers' as const,
      name: '放电点',
      marker: {
        color: intensities,
        colorscale: 'Viridis' as const,
        size: 4,
        showscale: true,
        colorbar: {
          title: '密度',
          thickness: 20,
          len: 0.75
        }
      }
    }
  ];

  const layout = {
    autosize: true,
    height: 500,
    margin: { l: 50, r: 20, t: 20, b: 40 },
    showlegend: true,
    legend: { orientation: 'h' as const, y: -0.2 },
    xaxis: {
      title: '相位 (°)',
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false,
      range: [0, 360]
    },
    yaxis: {
      title: '幅值 (dBmV)',
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
      data={plotData}
      layout={layout}
      config={config}
      style={{ width: '100%' }}
      useResizeHandler
    />
  );
}