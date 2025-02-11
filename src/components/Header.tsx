import { Home, Bell, Settings, Menu, Bot, Activity, Radio, AlertTriangle, Sliders, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onViewChange: (view: 'equipment' | 'device') => void;
  activeView: 'equipment' | 'device';
}

export default function Header({ onViewChange, activeView }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-lg font-semibold">局放状态智能体诊断系统</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <button 
              onClick={() => onViewChange('equipment')}
              className={`flex items-center space-x-1 ${activeView === 'equipment' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Home size={20} />
              <span>设备状态</span>
            </button>
            <button
              onClick={() => onViewChange('device')}
              className={`flex items-center space-x-1 ${activeView === 'device' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Radio size={20} />
              <span>传感器状态</span>
            </button>
            <Link to="/alerts" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <AlertTriangle size={20} />
              <span>报警策略</span>
            </Link>
            <Link to="/thresholds" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Sliders size={20} />
              <span>阈值设置</span>
            </Link>
            <Link to="/events" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <FileText size={20} />
              <span>事件管理</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Settings size={20} />
              <span>系统设置</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-500">版本: Demo</span>
          <div className="flex items-center space-x-2">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&auto=format" 
                 className="w-8 h-8 rounded-full" 
                 alt="User avatar" />
            <span>wasyhot</span>
          </div>
          <Bot className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
        </div>
      </div>
    </header>
  );
}