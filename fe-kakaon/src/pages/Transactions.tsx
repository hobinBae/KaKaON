import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Search, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const transactions = [
  { id: 'TX-20251015-001', time: '2025-10-15 14:35:22', amount: 45000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-002', time: '2025-10-15 14:22:11', amount: 28000, method: '간편결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-003', time: '2025-10-15 14:10:05', amount: 15000, method: '카드결제', status: '취소', store: '사장님 카페' },
  { id: 'TX-20251015-004', time: '2025-10-15 13:55:33', amount: 52000, method: '계좌이체', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-005', time: '2025-10-15 13:42:18', amount: 33000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-006', time: '2025-10-15 13:28:47', amount: 67000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-007', time: '2025-10-15 13:15:29', amount: 22000, method: '현금', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-008', time: '2025-10-15 12:58:14', amount: 48000, method: '카드결제', status: '취소', store: '사장님 카페' },
];

export default function Transactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">거래내역</h1>
        <p className="text-sm text-[#717182]">결제내역을 조회하고 관리하세요</p>
      </div>

      {/* Filters */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-[#333333] mb-2">기간 선택</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="date"
                  defaultValue="2025-10-01"
                  className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-2"
                />
              </div>
              <span className="flex items-center text-[#717182]">~</span>
              <div className="relative flex-1">
                <Input
                  type="date"
                  defaultValue="2025-10-15"
                  className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">결제상태</label>
            <Select defaultValue="all">
              <SelectTrigger className="rounded-lg bg-[#F5F5F5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">결제수단</label>
            <Select defaultValue="all">
              <SelectTrigger className="rounded-lg bg-[#F5F5F5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="card">카드결제</SelectItem>
                <SelectItem value="transfer">계좌이체</SelectItem>
                <SelectItem value="simple">간편결제</SelectItem>
                <SelectItem value="cash">현금</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">검색</label>
            <div className="relative">
              <Input
                placeholder="결제ID 검색"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-2 pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
            <Search className="w-4 h-4 mr-2" />
            조회하기
          </Button>
          <Button variant="outline" className="rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            CSV 다운로드
          </Button>
          <Button variant="outline" className="rounded-lg">
            <Upload className="w-4 h-4 mr-2" />
            CSV 업로드
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333]">결제ID</TableHead>
                <TableHead className="text-[#333333]">결제시간</TableHead>
                <TableHead className="text-[#333333]">금액</TableHead>
                <TableHead className="text-[#333333]">결제수단</TableHead>
                <TableHead className="text-[#333333]">상태</TableHead>
                <TableHead className="text-[#333333]">가맹점명</TableHead>
                <TableHead className="text-[#333333]">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className={`hover:bg-[#F5F5F5] cursor-pointer ${
                    tx.status === '취소' ? 'opacity-60' : ''
                  }`}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <TableCell className="text-[#333333]">{tx.id}</TableCell>
                  <TableCell className="text-[#717182]">{tx.time}</TableCell>
                  <TableCell className="text-[#333333]">{tx.amount.toLocaleString()}원</TableCell>
                  <TableCell className="text-[#717182]">{tx.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.status === '취소' ? 'destructive' : 'secondary'}
                      className="rounded bg-[#F5F5F5] text-[#333333]"
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#717182]">{tx.store}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-[#717182]">
                      보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="text-sm text-[#717182]">총 8건</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded">
              이전
            </Button>
            <Button size="sm" className="bg-[#FEE500] text-[#3C1E1E] rounded shadow-none">
              1
            </Button>
            <Button size="sm" variant="outline" className="rounded">
              다음
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>결제 상세정보</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제ID</div>
                  <div className="text-[#333333]">{selectedTransaction.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제시간</div>
                  <div className="text-[#333333]">{selectedTransaction.time}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제금액</div>
                  <div className="text-[#333333]">{selectedTransaction.amount.toLocaleString()}원</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제수단</div>
                  <div className="text-[#333333]">{selectedTransaction.method}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제상태</div>
                  <Badge
                    variant={selectedTransaction.status === '취소' ? 'destructive' : 'secondary'}
                    className="rounded"
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">가맹점</div>
                  <div className="text-[#333333]">{selectedTransaction.store}</div>
                </div>
              </div>

              {selectedTransaction.status === '취소' && (
                <Card className="p-4 bg-[#FF4D4D]/5 border-[#FF4D4D]/20 rounded-lg">
                  <div className="text-sm text-[#FF4D4D]">
                    ⚠️ 이 거래는 취소되었습니다. 관련 이상거래 알림을 확인하세요.
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                  영수증 출력
                </Button>
                <Button variant="outline" className="flex-1 rounded-lg">
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
