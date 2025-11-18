import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoSrc from "@/assets/logo.png";
import apiClient from "@/lib/apiClient";
import { useBoundStore } from "@/stores/storeStore";
import { useReportData } from "@/lib/hooks/useAnalytics";

// --- 타입 정의 ---
// useReportData 훅에서 반환되는 데이터 타입과 일치시킴
interface SummaryKpi {
  label: string;
  value: string;
  change?: string;
}
interface DailySummary {
  date: string;
  sales: number;
  orders: number;
  aov: number;
}
interface PatternData {
  label: string;
  sales: number;
  orders?: number;
  aov?: number;
}
interface MenuItem {
  name: string;
  sales: number;
  orders: number;
  proportion: string;
}

export default function Report() {
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const { selectedStoreId } = useBoundStore();
  const storeId = selectedStoreId ? parseInt(selectedStoreId, 10) : 0;

  const { data, isLoading, isError } = useReportData(storeId, reportType);

  const handlePrint = () => { window.print(); };

  const handleDownloadPdf = async () => {
    const reportContent = document.getElementById('report-a4-container');
    if (!reportContent) return;
    const canvas = await html2canvas(reportContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, -5, pdfWidth, pdfHeight);
    pdf.save(`매출리포트_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const [aiInsight, setAiInsight] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // data 객체의 참조가 아닌 내용이 변경될 때만 effect를 실행하기 위해 직렬화한 값을 사용
  const stableDataString = useMemo(() => JSON.stringify(data), [data]);

  useEffect(() => {
    if (!data) return;

    const fetchAiInsight = async () => {
      setIsLoadingAi(true);
      setAiInsight([]);

      // 로컬 스토리지 키 생성 (가맹점 ID, 리포트 타입, 기간을 조합)
      const cacheKey = `aiInsight-${storeId}-${reportType}-${data.period}`;
      const cachedInsight = localStorage.getItem(cacheKey);

      if (cachedInsight) {
        setAiInsight(JSON.parse(cachedInsight));
        setIsLoadingAi(false);
        return; // 캐시된 데이터가 있으면 API 호출 생략
      }

      try {
        const formatKpis = (kpis: SummaryKpi[]) => kpis.map(k => `${k.label}: ${k.value} (${k.change})`).join(', ');
        const formatSummary = (summary: DailySummary[]) => summary.map(d => `${d.date} 매출 ${d.sales.toLocaleString()}원`).join(', ');
        const formatPatterns = (patterns: PatternData[]) => patterns.map(p => `${p.label} 매출 ${p.sales.toLocaleString()}원`).join(', ');
        const formatMenus = (menus: MenuItem[]) => menus.map(m => `${m.name} (${m.proportion})`).join(', ');

        const prompt = `
          당신은 소상공인 카페 사장님을 위한 전문 데이터 분석가입니다. 아래에 제공되는 ${reportType === 'weekly' ? '주간' : '월간'} 매출 데이터를 보고, 사장님이 바로 실행에 옮길 수 있는 구체적인 조언을 담은 인사이트를 생성해주세요.

          **분석 대상 매장:** ${data.storeName}
          **분석 기간:** ${data.period}

          **[매출 데이터]**
          1.  **핵심 지표:** ${formatKpis(data.summaryKpis)}
          2.  **${reportType === 'weekly' ? '일별' : '주차별'} 매출 추이:** ${formatSummary(data.dailySummary)}
          3.  **시간대별 매출 분석:** ${formatPatterns(data.hourlyPatterns)}
          4.  **메뉴 분석:**
              *   인기 메뉴: ${formatMenus(data.topMenus)}
              *   부진 메뉴: ${formatMenus(data.lowMenus)}
          5.  **주문 유형 분석:** ${data.orderTypes.map(o => `${o.type}: 매출 ${o.sales.toLocaleString()}원, 주문 ${o.orders}건`).join(', ')}

          **[분석 요청]**
          위 데이터를 종합적으로 분석하여, 매장 운영 개선에 도움이 될 만한 핵심적인 인사이트와 구체적인 실행 아이디어를 **가장 중요한 순서대로 최대 17줄 이내로** 제안해주세요. 답변은 사장님이 이해하기 쉽도록 친근하고 상세한 설명을 담아주세요. 각 제안은 번호를 붙여서 구분해주세요.
        `;
        
        const response = await apiClient.post("/ai/insight", { prompt });
        const insightText = response.data.data;

        if (insightText) {
          const insights = insightText.split('\n').map(line => line.replace(/^[0-9]+\.\s*/, '')).filter(line => line.trim() !== '');
          setAiInsight(insights);
          // 성공적으로 받아온 인사이트를 로컬 스토리지에 저장
          localStorage.setItem(cacheKey, JSON.stringify(insights));
        } else {
          setAiInsight(["인사이트를 생성하지 못했습니다."]);
        }
      } catch (error) {
        console.error("Error fetching AI insight:", error);
        setAiInsight(["AI 인사이트를 가져오는 중 오류가 발생했습니다."]);
      } finally {
        setIsLoadingAi(false);
      }
    };
    
    fetchAiInsight();
  }, [stableDataString, reportType]);

  if (isLoading) {
    return <div className="p-8">리포트 데이터를 불러오는 중입니다...</div>;
  }

  if (isError || !data) {
    return <div className="p-8">리포트 데이터를 불러오는 데 실패했습니다.</div>;
  }

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
      <div className="no-print max-w-4xl mx-auto mb-4 grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg">
        <Button onClick={() => setReportType("weekly")} className={`rounded-lg ${reportType === 'weekly' ? 'bg-white shadow-sm text-black' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}>주간 리포트</Button>
        <Button onClick={() => setReportType("monthly")} className={`rounded-lg ${reportType === 'monthly' ? 'bg-white shadow-sm text-black' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}>월간 리포트</Button>
      </div>
      
      {/* A4 리포트 컨테이너 */}
      <div id="report-a4-container" className="report-a4 bg-white text-gray-900 p-4 sm:p-8 text-[11px] leading-normal mx-auto shadow-lg border w-full max-w-4xl">
        {/* 1. 헤더 영역 */}
        <header className="flex flex-col sm:flex-row justify-between items-start pb-2 border-b-2 border-gray-900">
          <div>
            <img src={logoSrc} alt="KaKaON Logo" className="h-6 mb-2" />
            <h2 className="text-lg font-bold">{data.title}</h2>
            <p className="text-xs">리포트 기간: {data.period}</p>
          </div>
          <div className="text-left sm:text-right text-xs mt-2 sm:mt-0">
            <p className="font-bold">{data.storeName}</p>
            <p>생성일: {format(new Date(), "yyyy-MM-dd")}</p>
          </div>
        </header>

        {/* 2. 상단 요약 KPI 영역 */}
        <section className="my-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 border p-2 rounded">
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
        <main className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-3">
            <ReportTable title={reportType === 'weekly' ? "일별 매출" : "주차별 매출"} headers={["일자/주차", "매출액", "주문 수", "평균 객단가"]} data={data.dailySummary.map(d => [d.date, `${d.sales.toLocaleString()}원`, `${d.orders}건`, `${d.aov.toLocaleString()}원`])} />
            {/* 월간 리포트일 때만 '요일별 매출'을 보여줍니다. */}
            {reportType === 'monthly' && data.dailyPatterns && (
              <ReportTable title="요일별 매출" headers={["요일", "매출액", "평균 객단가"]} data={data.dailyPatterns.map(p => [p.label, `${p.sales.toLocaleString()}원`, `${Math.round(p.aov ?? 0).toLocaleString()}원`])} />
            )}
            <ReportTable title="시간대별 매출" headers={["시간대", "매출액", "주문 수"]} data={data.hourlyPatterns.map(p => [p.label, `${p.sales.toLocaleString()}원`, `${p.orders}건`])} />
            {/* 주간 리포트일 때만 '주문 유형별 매출'을 왼쪽 컬럼 하단에 표시합니다. */}
            {reportType === 'weekly' && (
              <ReportTable title="주문 유형별 매출" headers={["유형", "매출액", "주문 수", "평균 객단가"]} data={data.orderTypes.map(o => [o.type, `${o.sales.toLocaleString()}원`, `${o.orders}건`, `${o.aov.toLocaleString()}원`])} />
            )}
          </div>
          {/* 오른쪽 컬럼 */}
          <div className="space-y-3">
            {/* 월간 리포트일 때만 '주문 유형별 매출'을 오른쪽 컬럼 최상단에 표시합니다. */}
            {reportType === 'monthly' && (
              <ReportTable title="주문 유형별 매출" headers={["유형", "매출액", "주문 수", "평균 객단가"]} data={data.orderTypes.map(o => [o.type, `${o.sales.toLocaleString()}원`, `${o.orders}건`, `${o.aov.toLocaleString()}원`])} />
            )}
            <ReportTable title="결제수단별 매출" headers={["결제수단", "매출액", "비중"]} data={data.paymentMethods.map(p => [p.name, `${p.sales.toLocaleString()}원`, p.proportion])} />
            <ReportTable title="메뉴별 매출 상위" headers={["메뉴명", "매출액", "판매량", "매출 비중"]} data={data.topMenus.map(m => [m.name, `${m.sales.toLocaleString()}원`, `${m.orders}개`, m.proportion])} />
            <ReportTable title="메뉴별 매출 하위" headers={["메뉴명", "매출액", "판매량", "매출 비중"]} data={data.lowMenus.map(m => [m.name, `${m.sales.toLocaleString()}원`, `${m.orders}개`, m.proportion])} />
          </div>
        </main>

        {/* 4. 하단 영역: AI 인사이트 */}
        <footer className="mt-3 pt-2 border-t">
          <div>
            <h3 className="text-xs font-bold mb-1">AI 인사이트 요약</h3>
            {isLoadingAi ? (
              <p className="text-gray-500 text-sm">AI가 리포트를 분석하고 있습니다. 잠시만 기다려주세요...</p>
            ) : (
              <div className="text-gray-700 space-y-2">
                {aiInsight.map((insight, i) => <p key={i}>{insight}</p>)}
              </div>
            )}
          </div>
          <p className="text-center text-[9px] text-gray-500 mt-4">
            ※ 본 리포트는 KaKaON 시스템의 거래 데이터를 기반으로 자동 생성되었습니다. 실제 매장 운영 상황과 일부 차이가 있을 수 있습니다.
          </p>
        </footer>
      </div>
      
      {/* A4 크기 및 인쇄용 스타일 */}
      <style>{`
        @media screen {
          .report-a4 {
            width: 100%;
          }
          @media (min-width: 640px) {
            .report-a4 {
              width: 210mm;
              min-height: 297mm;
            }
          }
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
            {headers.map(h => <th key={h} className="border border-gray-300 bg-gray-100 px-1 pt-0 pb-1 text-left font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="bg-white">
              {row.map((cell, j) => <td key={j} className="border border-gray-300 px-1 pt-0 pb-1">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
