import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Section from "./Section";

const mobileGifs = [
  "/gifs/1.gif",
  "/gifs/2.gif",
  "/gifs/3.gif",
  "/gifs/4.gif",
  "/gifs/5.gif",
];

export default function MobileFeatures() {
  return (
    <Section id="mobile-features" className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">모바일 환경 완벽 지원</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          언제 어디서나 내 매장을 편하게 관리하고 매출 분석까지 실시간으로 확인 하세요.
        </p>
      </div>
      
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-12">
            {mobileGifs.map((gif, index) => (
              <CarouselItem key={index} className="pl-12 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div className="flex justify-center py-4">
                  {/* 핸드폰 목업 프레임 (삼성 스타일) */}
                  <div className="relative w-[200px] h-[420px] bg-black rounded-[1.5rem] p-1.5 shadow-xl border-2 border-gray-800 ring-1 ring-gray-700 transform transition-transform hover:scale-105 duration-300">
                    {/* 펀치홀 카메라 */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black rounded-full z-20"></div>
                    
                    {/* 화면 영역 */}
                    <div className="relative w-full h-full bg-white rounded-[1.2rem] overflow-hidden">
                      <img 
                        src={gif} 
                        alt={`Mobile feature ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 측면 버튼들 (삼성 스타일: 우측에 몰림) */}
                    <div className="absolute top-24 -right-[2px] w-[2px] h-12 bg-gray-800 rounded-r-md"></div>
                    <div className="absolute top-40 -right-[2px] w-[2px] h-8 bg-gray-800 rounded-r-md"></div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-12" />
          <CarouselNext className="hidden sm:flex -right-12" />
        </Carousel>
      </div>
    </Section>
  );
}
