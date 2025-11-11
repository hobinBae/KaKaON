import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AdminPinModal from '@/components/AdminPinModal';
import { useBoundStore } from '@/stores/storeStore';
import { useOperationStatus, useUpdateOperationStatus } from '@/lib/hooks/useStores';
import { toast } from 'sonner';
import Clock from '@/components/Clock'; // 실시간 시계 컴포넌트
import ElapsedTimeClock from '@/components/ElapsedTimeClock'; // 영업 경과 시간 시계 컴포넌트
import { PlayCircle, StopCircle, Calendar, Clock as ClockIcon } from 'lucide-react';

export default function BusinessHours() {
  const { selectedStoreId } = useBoundStore();
  const { data: operationStatus, isLoading } = useOperationStatus(Number(selectedStoreId));
  const { mutate: updateStatus } = useUpdateOperationStatus();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);

  // 서버 상태가 변경될 때 세션 시간 상태를 업데이트
  useEffect(() => {
    // 데이터가 없거나, 날짜 정보가 없거나, 유효하지 않은 날짜인 경우 아무것도 하지 않음
    if (!operationStatus || !operationStatus.updatedAt || isNaN(new Date(operationStatus.updatedAt).getTime())) {
      return;
    }

    const newDate = new Date(operationStatus.updatedAt);

    if (operationStatus.status === 'OPEN') {
      // 영업 시작: 세션을 새로 시작함
      setSessionStartTime(newDate);
      setSessionEndTime(null);
    } else { // 'CLOSED'
      // 영업 마감: 마감 시간을 설정함. 시작 시간은 건드리지 않음.
      setSessionEndTime(newDate);
    }
  }, [operationStatus]);

  // 1초마다 현재 시간을 업데이트하여 경과 시간 시계가 다시 렌더링되도록 함
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isBusinessOpen = operationStatus?.status === 'OPEN';

  const elapsedSeconds = sessionStartTime && isBusinessOpen
    ? Math.floor((currentTime.getTime() - sessionStartTime.getTime()) / 1000)
    : 0;

  const formatDateTime = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  const handlePinVerified = () => {
    if (!selectedStoreId) {
      toast.error("먼저 헤더에서 가맹점을 선택해주세요.");
      setIsPinModalOpen(false);
      return;
    }

    const newStatus = isBusinessOpen ? 'CLOSED' : 'OPEN';
    updateStatus({ storeId: Number(selectedStoreId), data: { status: newStatus } });
    toast.success(`영업 상태를 변경합니다: ${newStatus === 'OPEN' ? '영업 시작' : '영업 마감'}`);
    setIsPinModalOpen(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">영업 상태를 불러오는 중...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start h-full p-4 pt-10">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">영업 상태 관리</h1>
        
        {isBusinessOpen ? (
          <>
            <p className="text-gray-500 mb-6">영업 경과 시간</p>
            <ElapsedTimeClock elapsedSeconds={elapsedSeconds} />
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">현재 시각</p>
            <Clock />
          </>
        )}

        <div className={`my-8 p-4 rounded-xl ${isBusinessOpen ? 'bg-green-50' : 'bg-gray-100'}`}>
          <div className={`flex items-center justify-center text-2xl font-bold ${isBusinessOpen ? 'text-green-600' : 'text-gray-500'}`}>
            {isBusinessOpen ? (
              <>
                <PlayCircle className="w-8 h-8 mr-3" />
                <span>영업중</span>
              </>
            ) : (
              <>
                <StopCircle className="w-8 h-8 mr-3" />
                <span>영업종료</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600">
            <div className="flex items-center mb-1 sm:mb-0">
              <Calendar className="w-4 h-4 mr-3 shrink-0" />
              <span>영업 시작 시간</span>
            </div>
            <span className="font-semibold text-gray-800 w-full text-right sm:w-auto sm:text-left">{formatDateTime(sessionStartTime)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600">
            <div className="flex items-center mb-1 sm:mb-0">
              <ClockIcon className="w-4 h-4 mr-3 shrink-0" />
              <span>영업 마감 시간</span>
            </div>
            <span className="font-semibold text-gray-800 w-full text-right sm:w-auto sm:text-left">{formatDateTime(sessionEndTime)}</span>
          </div>
        </div>

        <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className={`w-full h-14 text-lg rounded-full mt-8 transition-all duration-300 transform hover:scale-105 ${
                isBusinessOpen 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-500/30'
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
