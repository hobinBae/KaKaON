import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  CreditCard,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Switch } from "@/components/ui/switch";

const storeData = [
  {
    id: "ST001",
    name: "강남점",
    code: "KN001",
    address: "서울 강남구 테헤란로 123",
    todaySales: 6200000,
    salesChange: 12.5,
    cancellationRate: 3.2,
    alertCount: 2,
    staffCount: 8,
    status: "운영중",
    salesTrend: [
      { value: 4200000 },
      { value: 3800000 },
      { value: 4500000 },
      { value: 5200000 },
      { value: 4800000 },
      { value: 5500000 },
      { value: 6200000 },
    ],
    paymentMix: [
      { name: "카드", value: 45 },
      { name: "카카오페이", value: 35 },
      { name: "기타", value: 20 },
    ],
  },
  {
    id: "ST002",
    name: "홍대점",
    code: "HD001",
    address: "서울 마포구 홍익로 45",
    todaySales: 5800000,
    salesChange: 8.3,
    cancellationRate: 2.8,
    alertCount: 1,
    staffCount: 6,
    status: "운영중",
    salesTrend: [
      { value: 4500000 },
      { value: 4800000 },
      { value: 5000000 },
      { value: 5200000 },
      { value: 5400000 },
      { value: 5600000 },
      { value: 5800000 },
    ],
    paymentMix: [
      { name: "카드", value: 40 },
      { name: "카카오페이", value: 45 },
      { name: "기타", value: 15 },
    ],
  },
  {
    id: "ST003",
    name: "잠실점",
    code: "JS001",
    address: "서울 송파구 올림픽로 234",
    todaySales: 4200000,
    salesChange: -5.2,
    cancellationRate: 4.1,
    alertCount: 3,
    staffCount: 7,
    status: "운영중",
    salesTrend: [
      { value: 5000000 },
      { value: 4800000 },
      { value: 4600000 },
      { value: 4500000 },
      { value: 4400000 },
      { value: 4300000 },
      { value: 4200000 },
    ],
    paymentMix: [
      { name: "카드", value: 50 },
      { name: "카카오페이", value: 30 },
      { name: "기타", value: 20 },
    ],
  },
  {
    id: "ST004",
    name: "신촌점",
    code: "SC001",
    address: "서울 서대문구 신촌역로 78",
    todaySales: 3800000,
    salesChange: 3.1,
    cancellationRate: 2.5,
    alertCount: 0,
    staffCount: 5,
    status: "운영중",
    salesTrend: [
      { value: 3500000 },
      { value: 3600000 },
      { value: 3700000 },
      { value: 3650000 },
      { value: 3750000 },
      { value: 3800000 },
      { value: 3800000 },
    ],
    paymentMix: [
      { name: "카드", value: 42 },
      { name: "카카오페이", value: 38 },
      { name: "기타", value: 20 },
    ],
  },
];

const paymentColors = ["#FEE500", "#3C1E1E", "#FF9B00"];

const staffData = [
  {
    id: 1,
    name: "김직원",
    role: "점장",
    hourlyWage: 15000,
    status: "근무중",
    lastCheckIn: "09:00",
  },
  {
    id: 2,
    name: "이사원",
    role: "스태프",
    hourlyWage: 12000,
    status: "근무중",
    lastCheckIn: "09:30",
  },
  {
    id: 3,
    name: "박알바",
    role: "스태프",
    hourlyWage: 11000,
    status: "퇴근",
    lastCheckIn: "18:00",
  },
];

export default function StoreManage() {
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<typeof storeData[0] | null>(null);

  const handleStoreClick = (store: typeof storeData[0]) => {
    setSelectedStore(store);
  };

  const toggleExpand = (storeId: string) => {
    setExpandedStore(expandedStore === storeId ? null : storeId);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">가맹점 관리</h1>
          <p className="text-sm text-[#717182]">
            여러 매장의 종합 분석 및 정보 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
            <Plus className="w-4 h-4 mr-2" />
            가맹점 추가
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            직원 추가
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
            <Input
              placeholder="가맹점명 / 사업자번호 검색"
              className="pl-9 rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
            />
          </div>
          <Button variant="outline" className="rounded-lg">
            <Filter className="w-4 h-4 mr-2" />
            필터
          </Button>
        </div>
      </Card>

      {/* Store Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-[#333333]">가맹점명</TableHead>
              <TableHead className="text-[#333333]">오늘 매출</TableHead>
              <TableHead className="text-[#333333]">취소율</TableHead>
              <TableHead className="text-[#333333]">최근 7일</TableHead>
              <TableHead className="text-[#333333]">결제수단</TableHead>
              <TableHead className="text-[#333333]">알림</TableHead>
              <TableHead className="text-[#333333]">직원</TableHead>
              <TableHead className="text-[#333333]">상태</TableHead>
              <TableHead className="text-[#333333]">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeData.map((store) => (
              <>
                <TableRow
                  key={store.id}
                  className="border-b border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] cursor-pointer"
                  onClick={() => handleStoreClick(store)}
                >
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(store.id);
                      }}
                    >
                      {expandedStore === store.id ? (
                        <ChevronUp className="w-4 h-4 text-[#717182]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#717182]" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#717182]" />
                        <span className="text-sm text-[#333333]">{store.name}</span>
                      </div>
                      <p className="text-xs text-[#717182] mt-0.5">{store.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-[#333333]">
                        ₩{(store.todaySales / 1000000).toFixed(1)}M
                      </p>
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          store.salesChange > 0
                            ? "text-[#4CAF50]"
                            : "text-[#FF4D4D]"
                        }`}
                      >
                        {store.salesChange > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(store.salesChange)}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded ${
                        store.cancellationRate > 3.5
                          ? "border-[#FF4D4D] text-[#FF4D4D]"
                          : "border-[#717182] text-[#717182]"
                      }`}
                    >
                      {store.cancellationRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ResponsiveContainer width={100} height={40}>
                      <LineChart data={store.salesTrend}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#FEE500"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TableCell>
                  <TableCell>
                    <ResponsiveContainer width={60} height={60}>
                      <PieChart>
                        <Pie
                          data={store.paymentMix}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={25}
                        >
                          {store.paymentMix.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={paymentColors[index % paymentColors.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </TableCell>
                  <TableCell>
                    {store.alertCount > 0 ? (
                      <Badge
                        variant="destructive"
                        className="rounded"
                      >
                        {store.alertCount}건
                      </Badge>
                    ) : (
                      <span className="text-xs text-[#717182]">없음</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#717182]">
                      {store.staffCount}명
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="rounded bg-[#4CAF50] text-white"
                    >
                      {store.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs">
                        <Link to="/transactions">거래보기</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs">
                        <Link to="/analytics">분석보기</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Row */}
                {expandedStore === store.id && (
                  <TableRow className="border-b border-[rgba(0,0,0,0.08)]">
                    <TableCell colSpan={10} className="p-6 bg-[#FAFAFA]">
                      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">전일 매출</p>
                          <p className="text-lg text-[#333333]">₩5.5M</p>
                          <p className="text-xs text-[#4CAF50] mt-1">+8.2%</p>
                        </Card>
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">주간 매출</p>
                          <p className="text-lg text-[#333333]">₩34.8M</p>
                          <p className="text-xs text-[#4CAF50] mt-1">+12.5%</p>
                        </Card>
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">객단가</p>
                          <p className="text-lg text-[#333333]">₩42K</p>
                          <p className="text-xs text-[#717182] mt-1">평균</p>
                        </Card>
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">피크시간</p>
                          <p className="text-lg text-[#333333]">18-19시</p>
                          <p className="text-xs text-[#717182] mt-1">95건</p>
                        </Card>
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">실패율</p>
                          <p className="text-lg text-[#333333]">1.2%</p>
                          <p className="text-xs text-[#4CAF50] mt-1">양호</p>
                        </Card>
                        <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                          <p className="text-xs text-[#717182] mb-1">정산예정</p>
                          <p className="text-lg text-[#333333]">₩42.5M</p>
                          <p className="text-xs text-[#717182] mt-1">10/20</p>
                        </Card>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Store Detail Tabs */}
      {selectedStore && (
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-4">
            {selectedStore.name} 상세 관리
          </h3>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-[#F5F5F5] rounded-lg p-1">
              <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                기본정보
              </TabsTrigger>
              <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                직원관리
              </TabsTrigger>
              <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                알림설정
              </TabsTrigger>
              <TabsTrigger value="settlement" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                정산계좌
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                  <Input
                    value={selectedStore.name}
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">
                    사업자등록번호
                  </label>
                  <Input
                    value="123-45-67890"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                  <Input
                    value="김사장"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">업종</label>
                  <Input
                    value="음식점업"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-[#717182] mb-2 block">주소</label>
                  <Input
                    value={selectedStore.address}
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                  <Input
                    value="02-1234-5678"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">영업시간</label>
                  <Input
                    value="09:00 - 22:00"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
              </div>
              <Button className="mt-6 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                수정하기
              </Button>
            </TabsContent>

            <TabsContent value="staff" className="mt-6">
              <div className="space-y-4">
                {staffData.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#3C1E1E]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#333333]">{staff.name}</p>
                        <p className="text-xs text-[#717182]">
                          {staff.role} · 시급 ₩{staff.hourlyWage.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`rounded ${
                          staff.status === "근무중"
                            ? "bg-[#4CAF50] text-white"
                            : "bg-[#F5F5F5] text-[#717182]"
                        }`}
                      >
                        {staff.status}
                      </Badge>
                      <span className="text-xs text-[#717182]">
                        최근 출근: {staff.lastCheckIn}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                <Plus className="w-4 h-4 mr-2" />
                직원 추가
              </Button>
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
                  <div>
                    <p className="text-sm text-[#333333]">김사장</p>
                    <p className="text-xs text-[#717182]">owner@kakaopay.com</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
                  <div>
                    <p className="text-sm text-[#333333]">김직원 (점장)</p>
                    <p className="text-xs text-[#717182]">manager@kakaopay.com</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="mt-6 p-4 bg-[#F5F5F5] rounded-lg">
                <label className="text-sm text-[#717182] mb-2 block">알림 주기</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg bg-[#FEE500] border-[#FEE500] text-[#3C1E1E]"
                  >
                    실시간
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    매시간
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    매일
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settlement" className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">예금주명</label>
                  <Input
                    value="김사장"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">은행명</label>
                  <Input
                    value="카카오뱅크"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-[#717182] mb-2 block">계좌번호</label>
                  <div className="flex gap-2">
                    <Input
                      value="3333-01-1234567"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                    <Badge
                      className="rounded bg-[#4CAF50] text-white px-4"
                    >
                      인증완료
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#717182] mb-2 block">정산 주기</label>
                  <Input
                    value="매일"
                    className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                    readOnly
                  />
                </div>
              </div>
              <Button className="mt-6 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                <CreditCard className="w-4 h-4 mr-2" />
                정산계좌 변경
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
