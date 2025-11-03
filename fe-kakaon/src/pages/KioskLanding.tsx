import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

import frontKioskImg from '@/assets/front_kiosk.png';
import generalKioskImg from '@/assets/origin_kiosk.png';

const KioskLanding = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8 pt-32">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">키오스크 타입 선택</h1>
        <p className="text-xl text-gray-600">사용하실 키오스크 타입을 선택해주세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full">
        <Link to="/kiosk/front" className="group">
          <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <img src={frontKioskImg} alt="프론트 키오스크" className="w-48 h-48 object-contain mb-6" />
              <h2 className="text-3xl font-semibold text-gray-800 mb-3">프론트 키오스크</h2>
              <p className="text-gray-600 mb-6">태블릿과 같은 소형 기기에 최적화된 화면입니다.</p>
              <div className="flex items-center text-lg text-blue-600 font-semibold">
                선택하기 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/kiosk/general" className="group">
          <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <img src={generalKioskImg} alt="일반 키오스크 프로그램" className="w-48 h-48 object-contain mb-6" />
              <h2 className="text-3xl font-semibold text-gray-800 mb-3">일반 키오스크 프로그램</h2>
              <p className="text-gray-600 mb-6">스탠드형 대형 스크린에 최적화된 화면입니다.</p>
              <div className="flex items-center text-lg text-blue-600 font-semibold">
                선택하기 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default KioskLanding;
