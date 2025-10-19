import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const salesData = [
  { date: '10/9', amount: 2450000 },
  { date: '10/10', amount: 2100000 },
  { date: '10/11', amount: 2800000 },
  { date: '10/12', amount: 2200000 },
  { date: '10/13', amount: 3100000 },
  { date: '10/14', amount: 2900000 },
  { date: '10/15', amount: 3350000 },
];

const paymentMethodData = [
  { name: '카드결제', value: 65, color: '#FEE500' },
  { name: '계좌이체', value: 20, color: '#FFB800' },
  { name: '간편결제', value: 10, color: '#3C1E1E' },
  { name: '현금', value: 5, color: '#F5F5F5' },
];

const alerts = [
  { id: 1, type: '취소율 급증', time: '2시간 전', status: 'urgent', desc: '전주 대비 취소율 25% 증가' },
  { id: 2, type: '다중결제 감지', time: '4시간 전', status: 'warning', desc: '동일 카드로 10분 내 3회 결제' },
  { id: 3, type: '정산 완료', time: '오늘 06:00', status: 'info', desc: '어제 매출 정산이 완료되었습니다' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">대시보드</h1>
          <p className="text-sm text-[#717182]">오늘의 매출 현황을 확인하세요</p>
        </div>
        <div className="text-sm text-[#717182]">
          2025년 10월 15일 (수)
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#717182]">오늘 매출</span>
            <div className="w-10 h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#3C1E1E]" />
            </div>
          </div>
          <div className="text-2xl text-[#333333] mb-2">3,350,000원</div>
          <div className="flex items-center gap-1 text-sm text-[#4CAF50]">
            <TrendingUp className="w-4 h-4" />
            <span>15.4% 어제 대비</span>
          </div>
        </Card>

        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#717182]">이번주 취소율</span>
            <div className="w-10 h-10 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#FF4D4D]" />
            </div>
          </div>
          <div className="text-2xl text-[#333333] mb-2">3.2%</div>
          <div className="flex items-center gap-1 text-sm text-[#FF4D4D]">
            <TrendingUp className="w-4 h-4" />
            <span>1.2%p 전주 대비</span>
          </div>
        </Card>

        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#717182]">정산예정금</span>
            <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#4CAF50]" />
            </div>
          </div>
          <div className="text-2xl text-[#333333] mb-2">18,950,000원</div>
          <div className="text-sm text-[#717182]">내일 입금 예정</div>
        </Card>

        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#717182]">이상거래</span>
            <div className="w-10 h-10 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FF4D4D]" />
            </div>
          </div>
          <div className="text-2xl text-[#333333] mb-2">2건</div>
          <div className="text-sm text-[#FF4D4D]">미확인 알림 있음</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sales Trend */}
        <Card className="col-span-2 p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-6">최근 7일 매출 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="date" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#FEE500"
                strokeWidth={3}
                dot={{ fill: '#FEE500', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-6">결제수단별 매출 비중</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#333333]">오늘의 알림</h3>
          <Button asChild variant="ghost" className="text-sm text-[#717182]">
            <Link to="/alerts">전체보기</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.status === 'urgent'
                      ? 'bg-[#FF4D4D]/10'
                      : alert.status === 'warning'
                      ? 'bg-[#FFB800]/10'
                      : 'bg-[#4CAF50]/10'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.status === 'urgent'
                        ? 'text-[#FF4D4D]'
                        : alert.status === 'warning'
                        ? 'text-[#FFB800]'
                        : 'text-[#4CAF50]'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#333333]">{alert.type}</span>
                    <Badge
                      variant={alert.status === 'urgent' ? 'destructive' : 'secondary'}
                      className="rounded"
                    >
                      {alert.status === 'urgent' ? '긴급' : alert.status === 'warning' ? '주의' : '알림'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#717182]">{alert.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#717182]">{alert.time}</span>
                <Button size="sm" variant="outline" className="rounded-lg">
                  확인
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
