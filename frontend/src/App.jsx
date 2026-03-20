import Map from "./components/Map";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import BinControl from "./components/BinControl";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
        🚀 Smart Waste Management Dashboard
      </h1>

      {/* Dashboard Stats */}
      <Dashboard />

      {/* Hidden Alerts Logic (Toast only) */}
      <Alerts />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* 🗺️ Map Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col">
          
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
            🗺️ Live Map
          </h2>

          <div className="w-full flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            <Map />
          </div>

        </div>

        {/* 🎛️ IoT Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">
            🎛️ Bin Control
          </h2>
          <BinControl />
        </div>

      </div>
    </div>
  );
}

export default App;