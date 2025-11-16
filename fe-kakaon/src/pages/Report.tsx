import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import OpenAI from "openai"; // AI 기능 주석 처리

// --- 타입 정의 ---
// 나중에 API 응답 타입으로 대체하기 용이하도록 인터페이스를 정의했음

// 요약 KPI 항목 타입
interface SummaryKpi {
  label: string;
  value: string;
  change?: string;
}

// 일별/주차별 요약 항목 타입
interface DailySummary {
  date: string;
  sales: number;
  orders: number;
  aov: number; // Average Order Value
}

// 요일별/시간대별 패턴 항목 타입
interface PatternData {
  label: string;
  sales: number;
  orders?: number;
  aov?: number;
}

// 메뉴 항목 타입
interface MenuItem {
  name: string;
  sales: number;
  orders: number;
  proportion: string;
}

// 결제수단 항목 타입
interface PaymentMethod {
  name: string;
  sales: number;
  proportion: string;
}


// --- 리포트용 더미 데이터 ---
// 요구사항에 맞춰 부족한 데이터를 추가하고 구조를 재정의했음

const storeName = "카카오N점"; // 가맹점명 더미 데이터

const weeklyReportData = {
  summaryKpis: [
    { label: "총 매출액", value: "1,250,000원", change: "+5.2% (전주 대비)" },
    { label: "총 주문 수", value: "85건", change: "+2.4% (전주 대비)" },
    { label: "평균 객단가", value: "14,705원", change: "+2.8% (전주 대비)" },
    { label: "최고 매출 요일", value: "금요일", change: "350,000원" },
    { label: "최저 매출 요일", value: "일요일", change: "90,000원" },
    { label: "주문 취소", value: "1건", change: "20,000원" },
  ] as SummaryKpi[],
  dailySummary: [
    { date: "11-10 (월)", sales: 150000, orders: 10, aov: 15000 },
    { date: "11-11 (화)", sales: 180000, orders: 12, aov: 15000 },
    { date: "11-12 (수)", sales: 220000, orders: 15, aov: 14667 },
    { date: "11-13 (목)", sales: 140000, orders: 9, aov: 15556 },
    { date: "11-14 (금)", sales: 350000, orders: 20, aov: 17500 },
    { date: "11-15 (토)", sales: 120000, orders: 11, aov: 10909 },
    { date: "11-16 (일)", sales: 90000, orders: 8, aov: 11250 },
  ] as DailySummary[],
  dailyPatterns: [
    { label: "월요일", sales: 150000, aov: 15000 },
    { label: "화요일", sales: 180000, aov: 15000 },
    { label: "수요일", sales: 220000, aov: 14667 },
    { label: "목요일", sales: 140000, aov: 15556 },
    { label: "금요일", sales: 350000, aov: 17500 },
    { label: "토요일", sales: 120000, aov: 10909 },
    { label: "일요일", sales: 90000, aov: 11250 },
  ] as PatternData[],
  hourlyPatterns: [
    { label: "오전 (09-12시)", sales: 250000, orders: 18 },
    { label: "점심 (12-14시)", sales: 450000, orders: 30 },
    { label: "오후 (14-18시)", sales: 300000, orders: 22 },
    { label: "저녁 (18-21시)", sales: 250000, orders: 15 },
  ] as PatternData[],
  topMenus: [
    { name: "아메리카노", sales: 600000, orders: 150, proportion: "48.0%" },
    { name: "카페라떼", sales: 360000, orders: 80, proportion: "28.8%" },
    { name: "치즈케이크", sales: 250000, orders: 50, proportion: "20.0%" },
  ] as MenuItem[],
  lowMenus: [
    { name: "바닐라 쉐이크", sales: 20000, orders: 4, proportion: "1.6%" },
    { name: "녹차 프라페", sales: 15000, orders: 3, proportion: "1.2%" },
  ] as MenuItem[],
  paymentMethods: [
    { name: "신용카드", sales: 850000, proportion: "68.0%" },
    { name: "간편결제", sales: 250000, proportion: "20.0%" },
    { name: "현금", sales: 100000, proportion: "8.0%" },
    { name: "기타", sales: 50000, proportion: "4.0%" },
  ] as PaymentMethod[],
  orderTypes: [
    { type: "가게 주문", sales: 950000, orders: 60, aov: 15833 },
    { type: "배달 주문", sales: 300000, orders: 25, aov: 12000 },
  ],
  aiInsight: [
    "금요일 매출이 350,000원으로 주간 최고치를 기록했으며, 이는 주말을 앞둔 소비 심리 증가와 관련이 있을 수 있습니다.",
    "점심 시간대(12-14시) 매출이 450,000원으로 가장 높아, 해당 시간대 집중 프로모션 또는 세트 메뉴 구성이 유효할 것으로 보입니다.",
    "아메리카노 단일 품목이 전체 매출의 약 48%를 차지하여 매출 의존도가 높으므로, 카페라떼 또는 다른 음료 메뉴의 판매를 촉진할 전략이 필요합니다.",
  ],
};

const monthlyReportData = {
    ...weeklyReportData, // 기본 구조 재사용
    summaryKpis: [
        { label: "총 매출액", value: "5,300,000원", change: "-2.1% (전월 대비)" },
        { label: "총 주문 수", value: "360건", change: "-5.3% (전월 대비)" },
        { label: "평균 객단가", value: "14,722원", change: "+3.2% (전월 대비)" },
        { label: "최고 매출일", value: "10월 25일", change: "480,000원" },
        { label: "최저 매출일", value: "10월 10일", change: "80,000원" },
        { label: "주문 취소", value: "5건", change: "80,000원" },
    ],
    dailySummary: [ // 월간 리포트에서는 주차별 요약으로 변경
        { date: "1주차 (01-07일)", sales: 1200000, orders: 80, aov: 15000 },
        { date: "2주차 (08-14일)", sales: 1350000, orders: 90, aov: 15000 },
        { date: "3주차 (15-21일)", sales: 1450000, orders: 100, aov: 14500 },
        { date: "4주차 (22-28일)", sales: 1100000, orders: 75, aov: 14667 },
        { date: "5주차 (29-31일)", sales: 200000, orders: 15, aov: 13333 },
    ],
};

/* // AI 기능은 나중에 활성화할 예정이므로 관련 코드를 주석 처리합니다.
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_GMS_KEY,
  baseURL: "http://localhost/gmsapi/gmsapi/api.openai.com/v1",
  dangerouslyAllowBrowser: true,
});
*/

export default function Report() {
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");

  // 인쇄 기능을 호출하는 핸들러
  const handlePrint = () => { window.print(); };

  // PDF 다운로드 기능을 호출하는 핸들러
  const handleDownloadPdf = async () => {
    const reportContent = document.getElementById('report-a4-container');
    if (!reportContent) return;
    const canvas = await html2canvas(reportContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`매출리포트_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const reportData = useMemo(() => {
    const now = new Date();
    if (reportType === 'weekly') {
      const lastWeek = subWeeks(now, 1);
      const start = startOfWeek(lastWeek, { weekStartsOn: 1 });
      const end = endOfWeek(lastWeek, { weekStartsOn: 1 });
      const month = format(start, 'M월');
      // '월'의 몇 번째 주인지 계산합니다. (예: 1~7일 -> 1주차, 8~14일 -> 2주차)
      const week = Math.ceil(start.getDate() / 7);

      return {
        ...weeklyReportData,
        title: `${month} ${week}주차 매출 분석 리포트`,
        period: `${format(start, "yyyy-MM-dd")} ~ ${format(end, "yyyy-MM-dd")}`,
      };
    } else {
      const lastMonth = subMonths(now, 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      const month = format(start, 'M월');

      return {
        ...monthlyReportData,
        title: `${month} 매출 분석 리포트`,
        period: `${format(start, "yyyy-MM-dd")} ~ ${format(end, "yyyy-MM-dd")}`,
      };
    }
  }, [reportType]);

  const data = reportData;

  /* // AI 인사이트 생성 로직 (주석 처리)
  // 나중에 실제 API를 호출할 때 이 부분을 활성화하여 사용합니다.
  const [aiInsight, setAiInsight] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    const fetchAiInsight = async () => {
      setIsLoadingAi(true);
      try {
        const prompt = `
          다음은 한 매장의 ${data.period} 매출 데이터입니다. 이 데이터를 바탕으로, 
          1. 매출의 긍정적/부정적 요인, 
          2. 주목해야 할 핵심 지표, 
          3. 매출 증대를 위한 개선 아이디어를 구체적으로 제안해주세요.

          - 총 매출: ${data.totalSales.toLocaleString()}원
          - 총 주문 건수: ${data.totalOrders}건
          - 일별 매출 데이터: ${JSON.stringify(data.dailySummary)}
          - 시간대별 평균 매출: ${JSON.stringify(data.hourlyPatterns)}
          - 인기 메뉴 Top 3: ${JSON.stringify(data.topMenus.slice(0, 3))}
        `;
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        setAiInsight(completion.choices[0].message.content || "인사이트를 생성하지 못했습니다.");
      } catch (error) {
        console.error("Error fetching AI insight:", error);
        setAiInsight("AI 인사이트를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingAi(false);
      }
    };
    
    // fetchAiInsight(); // 실제 API 호출이 필요할 때 이 줄의 주석을 해제하세요.
  }, [data]);
  */

  return (
    <div className="bg-gray-100 p-4 sm:p-8">
      {/* 화면 상단의 컨트롤 영역 (인쇄 시 숨김) */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-800">매출 분석 리포트</h1>
          <p className="text-sm text-gray-500">A4 최적화 리포트를 확인하고 인쇄/저장하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> 인쇄</Button>
        </div>
      </div>
      
      {/* 주간/월간 선택 컨트롤 (인쇄 시 숨김) */}
      <div className="no-print max-w-4xl mx-auto mb-4 grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg h-10">
        <Button onClick={() => setReportType("weekly")} className={`rounded-lg ${reportType === 'weekly' ? 'bg-white shadow-sm text-black' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}>주간 리포트</Button>
        <Button onClick={() => setReportType("monthly")} className={`rounded-lg ${reportType === 'monthly' ? 'bg-white shadow-sm text-black' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}>월간 리포트</Button>
      </div>
      
      {/* A4 리포트 컨테이너 */}
      <div id="report-a4-container" className="report-a4 bg-white text-gray-900 p-8 text-[11px] leading-snug mx-auto shadow-lg border">
        {/* 1. 헤더 영역 */}
        <header className="flex justify-between items-start pb-2 border-b-2 border-gray-900">
          <div>
            <img src="/src/assets/logo.png" alt="KaKaON Logo" className="h-6 mb-2" />
            <h2 className="text-lg font-bold">{data.title}</h2>
            <p className="text-xs">리포트 기간: {data.period}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">{storeName}</p>
            <p>생성일: {format(new Date(), "yyyy-MM-dd")}</p>
          </div>
        </header>

        {/* 2. 상단 요약 KPI 영역 */}
        <section className="my-3">
          <h3 className="text-xs font-bold mb-1">요약 지표</h3>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 border p-2 rounded">
            {data.summaryKpis.map(kpi => (
              <div key={kpi.label}>
                <p className="text-gray-600">{kpi.label}</p>
                <p className="font-bold text-sm">{kpi.value}</p>
                {kpi.change && <p className="text-gray-500 text-[10px]">{kpi.change}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* 3. 중간 본문: 좌/우 2컬럼 레이아웃 */}
        <main className="grid grid-cols-2 gap-x-4">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-3">
            <ReportTable title={reportType === 'weekly' ? "일별 매출 요약" : "주차별 매출 요약"} headers={["일자/주차", "매출액", "주문 수", "평균 객단가"]} data={data.dailySummary.map(d => [d.date, `${d.sales.toLocaleString()}원`, `${d.orders}건`, `${d.aov.toLocaleString()}원`])} />
            {/* 월간 리포트일 때만 '요일별 매출 패턴'을 보여줍니다. */}
            {reportType === 'monthly' && (
              <ReportTable title="요일별 매출 패턴" headers={["요일", "매출액", "평균 객단가"]} data={data.dailyPatterns.map(p => [p.label, `${p.sales.toLocaleString()}원`, `${p.aov?.toLocaleString()}원`])} />
            )}
            <ReportTable title="시간대별 매출 패턴" headers={["시간대", "매출액", "주문 수"]} data={data.hourlyPatterns.map(p => [p.label, `${p.sales.toLocaleString()}원`, `${p.orders}건`])} />
            {/* 주간 리포트일 때만 '주문 유형 상세 분석'을 왼쪽 컬럼 하단에 표시합니다. */}
            {reportType === 'weekly' && (
              <ReportTable title="주문 유형 상세 분석" headers={["유형", "매출액", "주문 수", "평균 객단가"]} data={data.orderTypes.map(o => [o.type, `${o.sales.toLocaleString()}원`, `${o.orders}건`, `${o.aov.toLocaleString()}원`])} />
            )}
          </div>
          {/* 오른쪽 컬럼 */}
          <div className="space-y-3">
            {/* 월간 리포트일 때만 '주문 유형 상세 분석'을 오른쪽 컬럼 최상단에 표시합니다. */}
            {reportType === 'monthly' && (
              <ReportTable title="주문 유형 상세 분석" headers={["유형", "매출액", "주문 수", "평균 객단가"]} data={data.orderTypes.map(o => [o.type, `${o.sales.toLocaleString()}원`, `${o.orders}건`, `${o.aov.toLocaleString()}원`])} />
            )}
            <ReportTable title="결제수단별 매출" headers={["결제수단", "매출액", "비중"]} data={data.paymentMethods.map(p => [p.name, `${p.sales.toLocaleString()}원`, p.proportion])} />
            <ReportTable title="메뉴별 매출 상위" headers={["메뉴명", "매출액", "주문 수", "매출 비중"]} data={data.topMenus.map(m => [m.name, `${m.sales.toLocaleString()}원`, `${m.orders}건`, m.proportion])} />
            <ReportTable title="매출이 낮은 메뉴" headers={["메뉴명", "매출액", "주문 수", "매출 비중"]} data={data.lowMenus.map(m => [m.name, `${m.sales.toLocaleString()}원`, `${m.orders}건`, m.proportion])} />
          </div>
        </main>

        {/* 4. 하단 영역: AI 인사이트 */}
        <footer className="mt-3 pt-2 border-t">
          <div>
            <h3 className="text-xs font-bold mb-1">AI 인사이트 요약</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              {data.aiInsight.map((insight, i) => <li key={i}>{insight}</li>)}
            </ol>
          </div>
          <p className="text-center text-[9px] text-gray-500 mt-4">
            ※ 본 리포트는 KaKaON 시스템의 거래 데이터를 기반으로 자동 생성되었습니다. 실제 매장 운영 상황과 일부 차이가 있을 수 있습니다.
          </p>
        </footer>
      </div>
      
      {/* A4 크기 및 인쇄용 스타일 */}
      <style>{`
        .report-a4 {
          width: 210mm;
          min-height: 297mm;
          /* 화면에서 보기 좋게 하기 위한 스타일 */
          /* 실제 인쇄 시에는 @media print 스타일에 의해 제어됨 */
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .report-a4 {
            width: 100%;
            min-height: auto;
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

// 재사용 가능한 테이블 컴포넌트
function ReportTable({ title, headers, data }: { title: string; headers: string[]; data: string[][] }) {
  return (
    <div>
      <h3 className="text-xs font-bold mb-1">{title}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {headers.map(h => <th key={h} className="border border-gray-300 bg-gray-100 px-1 py-0.5 text-left font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="bg-white">
              {row.map((cell, j) => <td key={j} className="border border-gray-300 px-1 py-0.5">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
