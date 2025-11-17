import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AdminPinModal from '@/components/AdminPinModal';
import { useBoundStore } from '@/stores/storeStore';
import { useOperationStatus, useUpdateOperationStatus, useStoreById } from '@/lib/hooks/useStores';
import { toast } from 'sonner';
import Clock from '@/components/Clock'; // 실시간 시계 컴포넌트
import ElapsedTimeClock from '@/components/ElapsedTimeClock'; // 영업 경과 시간 시계 컴포넌트
import { PlayCircle, StopCircle, Calendar, Clock as ClockIcon } from 'lucide-react';

// 이전 값을 추적하는 커스텀 훅
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function BusinessHours() {
  const { 
    selectedStoreId, 
    businessHours, 
    setSessionStartTime, 
    setSessionEndTime 
  } = useBoundStore();
  
  const { data: operationStatus, isLoading } = useOperationStatus(Number(selectedStoreId));
  const { data: storeDetail } = useStoreById(Number(selectedStoreId));
  const { mutate: updateStatus } = useUpdateOperationStatus();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const storeBusinessHours = selectedStoreId ? businessHours[selectedStoreId] : null;
  const sessionStartTime = storeBusinessHours?.sessionStartTime ?? null;
  const sessionEndTime = storeBusinessHours?.sessionEndTime ?? null;

  const isBusinessOpen = operationStatus?.status === 'OPEN';
  const prevIsBusinessOpen = usePrevious(isBusinessOpen);
  const prevSelectedStoreId = usePrevious(selectedStoreId);

  // 세션 시작 및 종료 시간 관리
  useEffect(() => {
    if (!selectedStoreId) return;

    const isStoreChanged = prevSelectedStoreId !== selectedStoreId;

    // Handle status changes (OPEN/CLOSE) only when the store has NOT changed
    if (!isStoreChanged) {
      if (isBusinessOpen && !prevIsBusinessOpen) {
        setSessionStartTime(selectedStoreId, new Date(operationStatus.updatedAt));
      } else if (!isBusinessOpen && prevIsBusinessOpen && operationStatus?.updatedAt) {
        setSessionEndTime(selectedStoreId, new Date(operationStatus.updatedAt));
      }
    } 
    // Handle initial state loading when the component loads for the first time or the store changes
    else if (operationStatus?.updatedAt) {
      const serverTime = new Date(operationStatus.updatedAt);
      if (isBusinessOpen) {
        // If we switched to a new store and it's open, set its start time if not already present in global state
        if (!sessionStartTime) {
          setSessionStartTime(selectedStoreId, serverTime);
        }
      } else {
        // If we switched to a new store and it's closed, set its end time if not already present
        if (!sessionEndTime) {
          setSessionEndTime(selectedStoreId, serverTime);
        }
      }
    }
  }, [
    isBusinessOpen, 
    prevIsBusinessOpen, 
    operationStatus, 
    selectedStoreId, 
    prevSelectedStoreId, 
    setSessionStartTime, 
    setSessionEndTime, 
    sessionStartTime, 
    sessionEndTime
  ]);

  // 영업 상태일 때 경과 시간을 계산하는 타이머를 관리
  useEffect(() => {
    let timer: any;

    if (isBusinessOpen && sessionStartTime) {
      const updateElapsed = () => {
        const seconds = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedSeconds(seconds >= 0 ? seconds : 0);
      };
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => clearInterval(timer);
  }, [isBusinessOpen, sessionStartTime]);

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
       
        {storeDetail && (
          <p className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 whitespace-nowrap">{storeDetail.name}</p>
        )}

        {isBusinessOpen ? (
          <>
            <p className="text-gray-500 mb-0">영업 경과 시간</p>
            <ElapsedTimeClock elapsedSeconds={elapsedSeconds} />
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-0">현재 시각</p>
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
