"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Calendar, RefreshCw01 } from "@untitledui/icons";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/app/component/untitled-ui/button";
import { Badge } from "@/app/component/untitled-ui/badge";
import api from "@/lib/api";
import { bookingsForDay, formatCalendarDate } from "@/lib/calendar/dates";
import type { CalendarRange, CalendarSnapshot } from "@/lib/calendar/types";
import DailyBookings from "./DailyBookings";
import FleetStatus from "./FleetStatus";

const BookingCalendar = dynamic(() => import("./BookingCalendar"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="h-[760px] rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600"
    >
      กำลังเตรียมปฏิทิน…
    </div>
  ),
});

export default function CalendarView({
  today,
  dashboardHref,
}: {
  today: string;
  dashboardHref: string;
}) {
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [range, setRange] = useState<CalendarRange | null>(null);
  const [data, setData] = useState<CalendarSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const start = range?.start;
  const end = range?.end;

  useEffect(() => {
    if (!start || !end) return;
    let active = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<CalendarSnapshot>("/api/calendar", {
          params: { start, end },
          signal: controller.signal,
        });
        if (active) setData(response.data);
      } catch {
        if (active)
          setError(
            "อัปเดตข้อมูลไม่สำเร็จ กรุณาลองใหม่ ข้อมูลที่แสดงยังเป็นข้อมูลจากครั้งล่าสุด",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [start, end, refreshKey]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible")
        setRefreshKey((key) => key + 1);
    };
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const onRangeChange = useCallback(
    (next: CalendarRange, anchorDay: string, anchorEnd: string) => {
      setRange((previous) =>
        previous?.start === next.start && previous?.end === next.end
          ? previous
          : next,
      );
      setSelectedDay((previous) =>
        previous >= anchorDay && previous < anchorEnd ? previous : anchorDay,
      );
      setSelectedBookingId(null);
    },
    [],
  );
  const onSelectDay = useCallback((day: string) => {
    setSelectedDay(day);
    setSelectedBookingId(null);
  }, []);
  const onSelectBooking = useCallback((id: string, day: string) => {
    setSelectedDay(day);
    setSelectedBookingId(id);
  }, []);
  const currentData =
    data?.range?.start === start && data?.range?.end === end ? data : null;
  const rangeLoading = !currentData && (loading || !error);
  const bookings = currentData?.bookings ?? [];

  return (
    <main className="calendar-page min-h-screen bg-gray-50 text-gray-950">
      <div className="mx-auto max-w-[1504px] space-y-6 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="space-y-5 border p-4 rounded-xl bg-white border-gray-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white sm:flex">
                <Calendar className="size-6 text-gray-700" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
                  ปฏิทินการใช้รถ
                </h1>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  วางแผนการใช้รถ ดูรายละเอียดการจอง และติดตามผู้ถือรถปัจจุบัน
                </p>
              </div>
            </div>
            <Button
              isLoading={loading}
              iconLeading={
                <RefreshCw01 className="size-4" aria-hidden="true" />
              }
              onPress={() => setRefreshKey((key) => key + 1)}
            >
              {loading ? "กำลังอัปเดต" : "รีเฟรชข้อมูล"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-gray-200 pb-5">
            <Badge dot color="blue">
              ทุกบทบาทเข้าดูได้
            </Badge>
            <p role="status" className="text-sm text-gray-600">
              {data
                ? `อัปเดตล่าสุด ${formatCalendarDate(data.asOf)} · ทุก 30 วินาที`
                : error
                  ? "ยังไม่มีข้อมูลที่อัปเดตสำเร็จ"
                  : "กำลังเตรียมข้อมูลปฏิทิน"}
            </p>
          </div>
        </header>
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{data ? error : "ไม่สามารถโหลดข้อมูลปฏิทินได้ กรุณาลองใหม่"}</p>
            <Button
              isDisabled={loading}
              onPress={() => setRefreshKey((key) => key + 1)}
            >
              ลองใหม่
            </Button>
          </div>
        )}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <BookingCalendar
              today={today}
              selectedDay={selectedDay}
              bookings={bookings}
              loading={rangeLoading}
              unavailable={!currentData && Boolean(error)}
              onRangeChange={onRangeChange}
              onSelectDay={onSelectDay}
              onSelectBooking={onSelectBooking}
            />
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600"
              aria-label="คำอธิบายสถานะการจอง"
            >
              <Badge dot color="warning">
                รออนุมัติ
              </Badge>
              <Badge dot color="success">
                อนุมัติแล้ว
              </Badge>
              <Badge dot color="blue">
                เปลี่ยนรถแล้ว
              </Badge>
              <Badge dot color="indigo">
                กำลังใช้งาน
              </Badge>
              <Badge dot color="teal">
                เสร็จสิ้น
              </Badge>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              เลือกวันหรือรายการจองเพื่อดูรายละเอียด ซ่อนรายการยกเลิกและปฏิเสธ
            </p>
          </div>
          <DailyBookings
            day={selectedDay}
            bookings={bookingsForDay(bookings, selectedDay)}
            loading={rangeLoading}
            unavailable={!currentData && Boolean(error)}
            selectedBookingId={selectedBookingId}
          />
        </div>
        {data ? (
          <FleetStatus vehicles={data.vehicles} loading={false} />
        ) : !error ? (
          <FleetStatus vehicles={[]} loading />
        ) : null}
      </div>
    </main>
  );
}
