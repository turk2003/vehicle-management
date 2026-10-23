import type { MenuGroup, RoleMeta } from "./types"

export const menuGroups: MenuGroup[] = [
  {
    groupName: "เมนูผู้ดูแลระบบ",
    forRoles: ["ADMIN"],
    items: [
      {
        id: "USER_MANAGE",
        title: "จัดการผู้ใช้",
        description: "เพิ่ม แก้ไข และลบผู้ใช้ในระบบ",
      },
      {
        id: "VEHICLE_MANAGE",
        title: "จัดการรถ",
        description: "เพิ่ม แก้ไข และลบข้อมูลรถหรือประเภทรถ",
      },
      {
        id: "BOOKING_VIEW",
        title: "ดูการจองทั้งหมด",
        description: "เปิดหน้าจัดการและดูคำขอจองรถทั้งหมด",
      },
      {
        id: "BOOKING_MANAGE",
        title: "ดำเนินการการจอง",
        description: "เปลี่ยนสถานะ เปลี่ยนรถ และบันทึกรับหรือคืนรถแทนผู้ใช้",
      },
      {
        id: "BOOKING_DELETE",
        title: "ลบการจอง",
        description: "ลบรายการจองออกจากระบบอย่างถาวร",
      },
      {
        id: "MAINTENANCE_VIEW",
        title: "ดูงานซ่อมบำรุง",
        description: "เปิดหน้าและดูประวัติงานซ่อมทั้งหมด",
      },
      {
        id: "MAINTENANCE_MANAGE",
        title: "จัดการการซ่อมบำรุง",
        description: "เพิ่ม แก้ไข ปิด และลบงานซ่อมบำรุง",
      },
      {
        id: "REPORT_VIEW",
        title: "ดูรายงานและบทสรุป AI",
        description: "ดูประวัติการใช้รถ KPI และเรียกบทสรุปจาก AI",
      },
      {
        id: "PERMISSION_MANAGE",
        title: "จัดการสิทธิ์",
        description: "กำหนด Permission Matrix ของทุกบทบาท",
      },
    ],
  },
  {
    groupName: "เมนูผู้อนุมัติ",
    forRoles: ["APPROVER"],
    items: [
      {
        id: "BOOKING_APPROVE",
        title: "อนุมัติการจอง",
        description: "พิจารณาและอนุมัติคำขอจองรถ",
      },
      {
        id: "BOOKING_VIEW",
        title: "ประวัติการจอง / การอนุมัติ",
        description: "ดูประวัติการจองและการอนุมัติของตนเอง",
      },
      {
        id: "VEHICLE_VIEW",
        title: "ดูข้อมูลรถ",
        description: "ดูข้อมูลรถที่เกี่ยวข้องกับคำขออนุมัติ",
      },
    ],
  },
  {
    groupName: "เมนูผู้ใช้งานทั่วไป",
    forRoles: ["USER"],
    items: [
      {
        id: "BOOKING_CREATE",
        title: "จองรถ",
        description: "เลือกรถและช่วงเวลาที่ต้องการใช้งาน",
      },
      {
        id: "BOOKING_VIEW",
        title: "ประวัติการจอง / การอนุมัติ",
        description: "ดูประวัติการจองและสถานะคำขอของตนเอง",
      },
      {
        id: "VEHICLE_VIEW",
        title: "ดูข้อมูลรถ",
        description: "ดูรถและประเภทรถที่เปิดให้จอง",
      },
      {
        id: "MAINTENANCE_VIEW",
        title: "ดูรายการแจ้งซ่อม",
        description: "ดูประวัติการแจ้งซ่อมของตนเอง",
      },
      {
        id: "MAINTENANCE_REPORT",
        title: "แจ้งซ่อม",
        description: "สร้างรายการแจ้งปัญหารถและส่งให้ผู้ดูแลระบบ",
      },
    ],
  },
];

export const roleMeta: Record<string, RoleMeta> = {
  ADMIN: {
    label: "Admin",
    description: "ดูแลข้อมูลหลัก รถ ผู้ใช้ การจอง และงานซ่อม",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  APPROVER: {
    label: "Approver",
    description: "ตรวจคำขอและอนุมัติการจองรถ",
    tone: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  USER: {
    label: "User",
    description: "จองรถและติดตามประวัติของตนเอง",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};
