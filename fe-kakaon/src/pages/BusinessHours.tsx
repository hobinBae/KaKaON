import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AdminPinModal from '@/components/AdminPinModal';
import { useBoundStore } from '@/stores/storeStore';
import { useOperationStatus, useUpdateOperationStatus } from '@/lib/hooks/useStores';
import { toast } from 'sonner';

export default function BusinessHours() {
  const { selectedStoreId } = useBoundStore();
  const { data: operationStatus, isLoading } = useOperationStatus(Number(selectedStoreId));
  const { mutate: updateStatus } = useUpdateOperationStatus();

  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    if (operationStatus) {
      setIsBusinessOpen(operationStatus.status === 'OPEN');
      // TODO: 시작/종료 시간을 API로부터 받아와야 정확한 경과 시간 계산 가능
      // 임시로 상태 변경 시점을 시작 시간으로 설정
      if (operationStatus.status === 'OPEN') {
        setStartTime(new Date()); 
        setEndTime(null);
      } else {
        setStartTime(null);
        setEndTime(new Date());
      }
    }
  }, [operationStatus]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBusinessOpen && startTime) {
      timer = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBusinessOpen, startTime]);

  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `총 ${h}시간 ${m}분`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '-';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dayOfWeek = days[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} (${dayOfWeek}) ${hours}:${minutes}:${seconds}`;
  };

  const handlePinVerified = () => {
    if (!selectedStoreId) {
      toast.error("먼저 헤더에서 가맹점을 선택해주세요.");
      setIsPinModalOpen(false);
      return;
    }

    const newStatus = isBusinessOpen ? 'CLOSED' : 'OPEN';
    updateStatus({ storeId: Number(selectedStoreId), data: { status: newStatus } }, {
      onSuccess: () => {
        toast.success(`영업 상태가 성공적으로 변경되었습니다: ${newStatus === 'OPEN' ? '영업 시작' : '영업 마감'}`);
        setIsPinModalOpen(false);
        // UI 상태 업데이트는 useEffect [operationStatus] 에서 처리
      },
      onError: (error) => {
        toast.error("영업 상태 변경에 실패했습니다.", { description: error.message });
        setIsPinModalOpen(false);
      }
    });
  };

  if (isLoading) {
    return <div>영업 상태를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#333333] mb-1">영업 시작/마감</h1>
        <p className="text-sm text-[#717182]">가게의 영업 상태를 관리합니다.</p>
      </div>

      <Card className="px-14 py-8 rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="flex items-center pb-4 border-b mb-4">
          <div className={`inline-flex items-center font-semibold px-2 py-1 rounded-full text-xs ${isBusinessOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${isBusinessOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{isBusinessOpen ? '영업중' : '종료'}</span>
          </div>
          <span className="ml-4 text-md text-gray-800 font-semibold">
            {isBusinessOpen ? `${formatElapsedTime(elapsedTime)} 영업중` : '총 0시간 0분 종료'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">시작</span>
            <span className="text-sm text-gray-800 font-semibold">{formatDateTime(startTime)}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">마감</span>
            <span className="text-sm text-gray-800 font-semibold">{formatDateTime(endTime)}</span>
          </div>
        </div>
        
        <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className={`h-12 text-base rounded-full mt-4 px-8 ${
                isBusinessOpen 
                  ? 'bg-white text-red-500 border border-red-500 hover:bg-red-50' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isBusinessOpen ? '영업 마감' : '영업 시작'}
            </Button>
          </DialogTrigger>

          <AdminPinModal onPinVerified={handlePinVerified} />
        </Dialog>
      </Card>
    </div>
  );
}
