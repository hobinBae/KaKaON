import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Delete } from "lucide-react";

const AdminPinModal = ({ onPinVerified }) => {
  const [pin, setPin] = useState('');
  const correctPin = '1234';

  const handlePinSubmit = () => {
    if (pin === correctPin) {
      onPinVerified();
    } else {
      alert('PIN 번호가 올바르지 않습니다.');
    }
    setPin('');
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>관리자 PIN 입력</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <div className="flex justify-center items-center h-12 mb-4 border rounded-md">
          <p className="text-2xl tracking-[1rem]">{'*'.repeat(pin.length)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {keypad.map((key) =>
            key === '' ? (
              <div key="empty" />
            ) : (
              <Button
                key={key}
                variant="outline"
                className="h-16 text-2xl"
                onClick={() => handleKeyPress(key)}
              >
                {key === 'backspace' ? <Delete /> : key}
              </Button>
            )
          )}
        </div>
        <DialogClose asChild>
          <Button onClick={handlePinSubmit} className="w-full mt-4 h-14 text-lg">
            확인
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

export default AdminPinModal;
