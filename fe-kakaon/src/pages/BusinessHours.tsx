import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AdminPinModal from '@/components/AdminPinModal';

export default function BusinessHours() {
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (isBusinessOpen && startTime) {
      timer = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBusinessOpen, startTime]);

  const formatElapsedTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `총 ${h}시간 ${m}분`;
  };

  const formatDateTime = (date) => {
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
    if (isBusinessOpen) {
      setIsBusinessOpen(false);
      setEndTime(new Date());
    } else {
      setStartTime(new Date());
      setEndTime(null);
      setIsBusinessOpen(true);
    }
    setIsPinModalOpen(false);
  };

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
            <span>{isBusinessOpen ? '영업중' : '영업종료'}</span>
          </div>
          <span className="ml-4 text-md text-gray-800 font-semibold">
            {isBusinessOpen ? `${formatElapsedTime(elapsedTime)} 영업중` : '총 0시간 0분 영업종료'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">영업 시작</span>
            <span className="text-sm text-gray-800 font-semibold">{formatDateTime(startTime)}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">영업 마감</span>
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
