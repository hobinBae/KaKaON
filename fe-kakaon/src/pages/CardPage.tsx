import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Card {
  id: number;
  cardNumber: string;
  gradient: string;
}

export default function CardPage() {
  const [cards] = useState<Card[]>([
    { id: 1, cardNumber: '0000000000000000', gradient: 'from-gray-800 to-gray-600' },
    { id: 2, cardNumber: '1111111111111111', gradient: 'from-blue-700 to-blue-200' },
    { id: 3, cardNumber: '2222222222222222', gradient: 'from-orange-700 to-yellow-300' },
  ]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    setIsAlertOpen(true);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8 text-black">
      <h1 className="text-4xl uppercase tracking-wider mb-4">결제 카드 선택</h1>
      <p id="choosen-paymenttype" className="mb-8">결제할 카드를 선택하고 눌러주세요.</p>

      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper w-[320px] h-[200px]"
      >
          {cards.map((card) => (
            <SwiperSlide key={card.id} onClick={() => handleCardSelect(card)}>
              <div className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white h-full flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                  <span className="text-lg font-semibold">Card ID: {card.id}</span>
                  <span className="text-xl font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-xl font-mono tracking-widest whitespace-nowrap" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    {card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="sm:max-w-[280px]">
          <AlertDialogHeader>
            <AlertDialogTitle>카드 선택 완료</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCard?.id}번 카드가 선택되었습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
