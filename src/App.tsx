import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useState } from 'react';
import Header from './components/Header';
import EquipmentTable from './components/EquipmentTable';
import DeviceTable from './components/DeviceTable';
import DeviceDetail from './components/DeviceDetail';

function App() {
  const [activeView, setActiveView] = useState<'equipment' | 'device'>('equipment');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onViewChange={setActiveView} activeView={activeView} />
        <main className="max-w-[1600px] mx-auto p-6">
          <Routes>
            <Route path="/" element={
              <>
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">
                      {activeView === 'equipment' ? '设备状态' : '传感器状态'}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                          统计视图
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded">
                          列表视图
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="search"
                          placeholder="查找..."
                          className="px-4 py-2 border rounded-lg"
                        />
                        <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg">
                          <Download size={20} />
                          <span>下载</span>
                        </button>
                      </div>
                    </div>
                    {activeView === 'equipment' ? (
                      <EquipmentTable />
                    ) : (
                      <DeviceTable />
                    )}
                  </div>
                </div>
              </>
            } />
            <Route path="/equipment/:id" element={<DeviceDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;