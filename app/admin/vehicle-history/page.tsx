"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  formatDateTime,
  getVehicleStatusColor,
  getVehicleStatusText,
} from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type VehicleOption = {
  id: string;
  plateNumber: string;
};

type VehicleHistoryItem = {
  vehicleId: string;
  plateNumber: string;
  vehicleType: string;
  currentStatus: string;
  currentMileage: number;
  usageCount: number;
  maintenanceCount: number;
  uniqueUsersCount: number;
  totalDistanceKm: number;
  avgDistancePerTripKm: number;
  lastUsedAt: string | null;
};

export default function AdminVehicleHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<VehicleHistoryItem[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);

  const [filters, setFilters] = useState({
    vehicleId: "",
    startDate: "",
    endDate: "",
  });

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/api/verhicle");
      const options = response.data.map((v: VehicleOption) => ({
        id: v.id,
        plateNumber: v.plateNumber,
      }));
      setVehicleOptions(options);
    } catch {
      // Skip options on failure; main report can still load.
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();

      if (filters.vehicleId) params.set("vehicleId", filters.vehicleId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const response = await api.get(
        `/api/admin/vehicles/history?${params.toString()}`,
      );
      setItems(response.data.items || []);
    } catch (e: unknown) {
      setError("ไม่สามารถโหลดประวัติการใช้งานรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalVehicles += 1;
        acc.totalTrips += item.usageCount;
        acc.totalDistanceKm += item.totalDistanceKm;
        acc.totalMaintenance += item.maintenanceCount;
        return acc;
      },
      {
        totalVehicles: 0,
        totalTrips: 0,
        totalDistanceKm: 0,
        totalMaintenance: 0,
      },
    );
  }, [items]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ประวัติการใช้งานรถ
          </h1>
          <p className="text-gray-600">
            สรุปประวัติใช้งานย้อนหลัง ไมล์ ผู้ใช้งาน และจำนวนครั้งซ่อม
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">จำนวนรถ</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalVehicles}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">จำนวนเที่ยวใช้งาน</p>
            <p className="text-2xl font-bold text-blue-700">
              {summary.totalTrips}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">ระยะทางรวม (กม.)</p>
            <p className="text-2xl font-bold text-indigo-700">
              {summary.totalDistanceKm.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">จำนวนครั้งซ่อม</p>
            <p className="text-2xl font-bold text-orange-700">
              {summary.totalMaintenance}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ตัวกรองรายงาน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รถ
              </label>
              <select
                value={filters.vehicleId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, vehicleId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกคัน</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({ vehicleId: "", startDate: "", endDate: "" })
                }
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-4 text-gray-900">
                จำนวนครั้งที่ใช้งาน
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={items}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="plateNumber"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar
                      dataKey="usageCount"
                      name="จำนวนครั้ง"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-4 text-gray-900">
                ระยะทางรวม (กม.)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={items}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="plateNumber"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar
                      dataKey="totalDistanceKm"
                      name="กิโลเมตร"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-4 text-gray-900">
                จำนวนครั้งที่ซ่อม
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={items}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="plateNumber"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar
                      dataKey="maintenanceCount"
                      name="ครั้ง"
                      fill="#ea580c"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  รถ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานะปัจจุบัน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  จำนวนใช้งาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ระยะทางรวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ผู้ใช้งานไม่ซ้ำ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  จำนวนซ่อม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ใช้งานล่าสุด
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    กำลังโหลด...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    ไม่พบข้อมูลประวัติรถ
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.vehicleId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.plateNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.vehicleType}
                      </div>
                      <div className="text-xs text-gray-500">
                        ไมล์ปัจจุบัน: {item.currentMileage.toLocaleString()} กม.
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVehicleStatusColor(item.currentStatus)}`}
                      >
                        {getVehicleStatusText(item.currentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.usageCount.toLocaleString()} ครั้ง
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{item.totalDistanceKm.toLocaleString()} กม.</div>
                      <div className="text-xs text-gray-500">
                        เฉลี่ย {item.avgDistancePerTripKm.toLocaleString()}{" "}
                        กม./เที่ยว
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.uniqueUsersCount.toLocaleString()} คน
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.maintenanceCount.toLocaleString()} ครั้ง
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.lastUsedAt
                        ? formatDateTime(item.lastUsedAt)
                        : "ยังไม่มีข้อมูล"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
