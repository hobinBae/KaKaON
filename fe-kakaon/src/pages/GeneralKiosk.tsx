import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Plus, Minus, Trash2, Edit, Delete } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBoundStore } from '@/stores/storeStore';

const AdminPinModal = ({ onPinVerified }) => {
  const [pin, setPin] = useState('');
  const correctPin = '1234';

  const handlePinSubmit = () => {
    if (pin === correctPin) {
      onPinVerified();
    } else {
      alert('PIN 번호가 올바르지 않습니다.');
      setPin('');
    }
  };

  const handleKeyPress = (key: string) => {
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
          <p className="text-2xl tracking-[1rem]">{pin.padEnd(4, '◦')}</p>
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
        <Button onClick={handlePinSubmit} className="w-full mt-4">
          확인
        </Button>
      </div>
    </DialogContent>
  );
};

const GeneralKiosk = () => {
  const {
    stores,
    selectedStoreId,
    addTransaction,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useBoundStore();

  const [products, setProducts] = useState([]);
  const [orderType, setOrderType] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const currentStore = stores.find(store => store.id === selectedStoreId);
    if (currentStore) {
      setProducts(currentStore.products);
    }
  }, [selectedStoreId, stores]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayment = () => {
    addTransaction({
      items: cart.map(({ name, quantity, price }) => ({ name, quantity, price })),
      total: totalAmount,
      orderType,
      paymentMethod: 'kiosk',
      status: 'completed',
    });
    clearCart();
    setOrderType(null);
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    alert('관리자 모드로 전환합니다.');
  };

  return (
    <div className="flex h-screen bg-white">
      {!orderType ? (
        <div className="flex flex-col items-center justify-center w-full bg-gray-100">
          <h1 className="text-6xl font-bold mb-12">주문 유형을 선택해주세요</h1>
          <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
            <Card onClick={() => setOrderType('dine-in')} className="cursor-pointer hover:bg-blue-50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-16">
                <span className="text-8xl mb-8">🍽️</span>
                <h2 className="text-5xl font-bold">매장 식사</h2>
              </CardContent>
            </Card>
            <Card onClick={() => setOrderType('take-out')} className="cursor-pointer hover:bg-blue-50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-16">
                <span className="text-8xl mb-8">🛍️</span>
                <h2 className="text-5xl font-bold">포장 주문</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="w-3/4 flex flex-col p-8">
            <header className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold">KaKaON Kiosk</h1>
              <div>
                <Button variant="ghost" className="mr-4" onClick={() => setOrderType(null)}>처음으로</Button>
                {isAdminMode && (
                  <>
                    <Button onClick={() => setIsAdminMode(false)} className="mr-2">관리자 모드 종료</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" />상품 추가</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>새 상품 추가</DialogTitle></DialogHeader>
                        {/* 간단한 상품 추가 폼 */}
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-8 w-8" />
                    </Button>
                  </DialogTrigger>
                  <AdminPinModal onPinVerified={handleAdminLogin} />
                </Dialog>
              </div>
            </header>
            <nav className="flex space-x-8 border-b mb-4">
              <Button variant="ghost" className="text-xl py-4">전체 메뉴</Button>
            </nav>
            <main className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product.id} onClick={() => !isAdminMode && addToCart(product)} className="cursor-pointer relative">
                    {isAdminMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                        <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        <Button variant="secondary" size="icon" onClick={() => alert('수정 기능 추가 예정')}><Edit className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <CardContent className="p-4 text-center">
                      <div className="bg-gray-200 h-40 mb-4 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">이미지</span>
                      </div>
                      <p className="text-lg font-semibold">{product.name}</p>
                      <p>{product.price.toLocaleString()}원</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          </div>
          <aside className="w-1/4 bg-gray-50 p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">주문 내역 ({totalItems}개)</h2>
            <div className="flex-1 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="border p-4 rounded-lg mb-4">
                  <p className="font-bold">{item.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, -1)}><Minus /></Button>
                      <span>{item.quantity}</span>
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, 1)}><Plus /></Button>
                    </div>
                    <p>{(item.price * item.quantity).toLocaleString()}원</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 mt-2" onClick={() => removeFromCart(item.id)}>삭제</Button>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="flex justify-between font-bold text-2xl mb-4">
                <span>{orderType === 'dine-in' ? '[매장]' : '[포장]'}</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <Button className="w-full h-16 text-2xl" onClick={handlePayment} disabled={cart.length === 0}>결제하기</Button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default GeneralKiosk;
