import React from 'react';
import { 
  BookOpen, 
  Palmtree, 
  Home, 
  ArrowLeftRight, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Building,
  ThermometerSnowflake,
  UserCheck
} from 'lucide-react';
import { Modal } from './Modal';

interface VacationPolicyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VacationPolicyGuideModal: React.FC<VacationPolicyGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="คู่มือเกณฑ์คำนวณวันลา & กติกาการสลับวัน WFH (Policy Reference)"
      subtitle="โครงสร้างระเบียบสิทธิ์วันลาและระบบ WFH Swap ตามข้อกำหนดบริษัท"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-slate-800 text-xs sm:text-sm">
        
        {/* Section 1: Standard Quotas */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
            <span>โควตาวันลามาตรฐานประจำปี (Standard Annual Quotas)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
                <ThermometerSnowflake className="w-4 h-4 text-rose-600" />
                <span>ลาป่วย (Sick Leave)</span>
              </div>
              <p className="text-xs text-rose-800">
                <strong>30 วันทำงาน / ปี</strong> ได้รับค่าจ้างตามปกติ สามารถลาแบบเต็มวัน (1.0) หรือครึ่งวัน (0.5) ได้
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>ลากิจ (Personal Leave)</span>
              </div>
              <p className="text-xs text-amber-800">
                <strong>3 วันทำงาน / ปี</strong> สำหรับกิจธุระจำเป็นหรือติดต่อหน่วยงานราชการ รองรับแบบเต็มวันและครึ่งวัน
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Vacation Rules & Tenure */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
            <span>วันลาพักร้อน (Vacation Leave) — กฎเกณฑ์ตามอายุงาน & สูตร Pro-rate</span>
          </h4>
          <p className="text-xs text-slate-600">
            สิทธิ์วันลาพักร้อนจะรีเซ็ตในวันที่ <strong>1 มกราคม ของทุกปี</strong> โดยคำนวณตามสถานะและอายุงานดังนี้:
          </p>

          <div className="space-y-2.5">
            {/* 2.1 Probation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-0.5">
                • อยู่ระหว่างทดลองงาน (Under Probation):
              </span>
              <span className="text-slate-600">
                โควตาพักร้อน = <strong>0 วัน</strong> (ยังไม่สามารถใช้สิทธิ์ลาพักร้อนได้จนกว่าจะผ่านการประเมินทดลองงาน)
              </span>
            </div>

            {/* 2.2 Year 0 Formula */}
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  • ปีที่ผ่านการทดลองงาน (Year 0): เฉลี่ยตามสัดส่วน Pro-rate
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[11px] font-bold">
                  (12 - passMonth) × 0.5 วัน
                </span>
              </div>

              <p className="text-indigo-900 leading-relaxed">
                เริ่มใช้สิทธิ์ได้ทันทีหลังผ่านเดือนที่ระบุในสัญญา โดยคำนวณตามตารางมาตรฐาน:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน เม.ย. (4) = <strong>4.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน พ.ค. (5) = <strong>3.5 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน มิ.ย. (6) = <strong>3.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ก.ค. (7) = <strong>2.5 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ส.ค. (8) = <strong>2.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ก.ย. (9) = <strong>1.5 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ต.ค. (10) = <strong>1.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน พ.ย. (11) = <strong>0.5 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ธ.ค. (12) = <strong>0.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ม.ค. (1) = <strong>5.5 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน ก.พ. (2) = <strong>5.0 วัน</strong></div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">ผ่าน มี.ค. (3) = <strong>4.5 วัน</strong></div>
              </div>

              <div className="p-2.5 bg-white/90 rounded-lg border border-indigo-200 mt-1 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-indigo-950">
                  <strong>เงื่อนไขพิเศษ:</strong> หากได้รับการบรรจุแต่งตั้งเป็นพนักงานประจำในวันที่ <strong>1 มกราคม</strong> จะได้รับสิทธิ์ Year 0 เต็มจำนวน <strong>6.0 วัน</strong>
                </span>
              </div>
            </div>

            {/* 2.3 Year 1+ Tenure Tiers */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">
                • ระดับสิทธิ์ตามอายุงาน (Year 1+ นับจาก 1 ม.ค. ปีถัดไปหลังผ่านโปร):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Year 1</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">6.0 วัน</div>
                  <div className="text-[10px] text-slate-400">ปีแรกหลังผ่านโปร</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Year 2 - 3</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">10.0 วัน</div>
                  <div className="text-[10px] text-slate-400">อายุงาน 2 - 3 ปี</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Year 4 - 5</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">15.0 วัน</div>
                  <div className="text-[10px] text-slate-400">อายุงาน 4 - 5 ปี</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Year 6+</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">20.0 วัน</div>
                  <div className="text-[10px] text-slate-400">อายุงาน 6 ปีขึ้นไป</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: WFH Day-Swap Rules */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
            <span>กติกาและขั้นตอนขอสลับวัน WFH เฉพาะกิจ (WFH Day-Swap Workflow)</span>
          </h4>

          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2 text-xs text-purple-950">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <ArrowLeftRight className="w-4 h-4 text-purple-600" />
              <span>การสลับวัน WFH สำหรับพนักงานกลุ่ม Hybrid (กรุงเทพฯ & ปริมณฑล)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 leading-relaxed">
              <li>
                <strong>วันขอ WFH:</strong> ต้องเป็นวันทำงานปกติที่ตนเองถูกจัดตารางให้เข้าออฟฟิศ
              </li>
              <li>
                <strong>วันเข้าชดเชย:</strong> ต้องเป็นวันทำงานปกติที่ตนเองมีสิทธิ์ WFH และ<strong>อยู่ภายในสัปดาห์เดียวกัน (จันทร์ - ศุกร์)</strong> เท่านั้น
              </li>
              <li>
                <strong>ไม่หักโควตาวันลา:</strong> เมื่อหัวหน้างานอนุมัติ ระบบจะปรับเปลี่ยนตารางงานเป็น <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">🏠 WFH (สลับเฉพาะกิจ)</span> และ <span className="bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">🏢 เข้าออฟฟิศ (ชดเชย)</span> อัตโนมัติ
              </li>
              <li>
                <strong>พนักงาน 100% Remote (ต่างจังหวัด):</strong> ได้รับสิทธิ์ปฏิบัติงานที่บ้านเต็มเวลาอยู่แล้ว จึงไม่มีความจำเป็นต้องใช้ฟีเจอร์นี้
              </li>
            </ul>
          </div>
        </div>

        {/* Modal close */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            เข้าใจแล้ว & ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </Modal>
  );
};
