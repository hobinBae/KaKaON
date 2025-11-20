import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Card {
  id: number;
  cardNumber: string;
  gradient: string;
}

interface CardSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSelect: (card: Card) => void;
}

export default function CardSelectionModal({ isOpen, onClose, onCardSelect }: CardSelectionModalProps) {
  const [cards] = useState<Card[]>([
    { id: 1, cardNumber: '0215042003121213', gradient: 'from-gray-800 to-gray-600' },
    { id: 2, cardNumber: '1213062305250822', gradient: 'from-blue-700 to-blue-200' },
    { id: 3, cardNumber: '0922092303121213', gradient: 'from-orange-700 to-yellow-300' },
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>결제할 카드를 고르고 눌러주세요.</DialogTitle>
        </DialogHeader>
        <div className="py-8">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="mySwiper w-[320px] h-[200px]"
          >
            {cards.map((card) => (
              <SwiperSlide key={card.id} onClick={() => onCardSelect(card)}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
