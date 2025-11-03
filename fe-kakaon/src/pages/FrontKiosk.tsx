import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, ArrowLeft, Trash2, Edit, Minus, Plus, ChevronUp, ChevronDown, Delete } from "lucide-react";
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
  const correctPin = '1234'; // 실제 환경에서는 환경 변수 등으로 관리해야 합니다.

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

  const keypad = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '', '0', 'backspace',
  ];

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

const FrontKiosk = () => {
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
    deleteProduct,
  } = useBoundStore();

  const [products, setProducts] = useState([]);
  const [orderType, setOrderType] = useState(null); // 'dine-in' or 'take-out'
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);

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

  // 메뉴 선택 화면
  return (
    <div className="w-[480px] h-[800px] bg-white shadow-2xl rounded-3xl mx-auto my-8 p-4 flex flex-col border-8 border-gray-800">
      {!orderType ? (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold mb-8 text-center">주문 유형을<br/>선택해주세요</h1>
          <div className="grid grid-cols-1 gap-6 w-full px-8">
            <Card onClick={() => setOrderType('dine-in')} className="cursor-pointer hover:bg-yellow-100 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <span className="text-6xl mb-4">🍽️</span>
                <h2 className="text-3xl font-bold">매장 식사</h2>
              </CardContent>
            </Card>
            <Card onClick={() => setOrderType('take-out')} className="cursor-pointer hover:bg-yellow-100 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <span className="text-6xl mb-4">🛍️</span>
                <h2 className="text-3xl font-bold">포장 주문</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <header className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={() => setOrderType(null)}>
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div className="text-xl font-semibold">
              {isAdminMode ? <Button onClick={() => setIsAdminMode(false)}>관리자 모드 종료</Button> : <span>KaKaON Kiosk</span>}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-8 w-8" />
                </Button>
              </DialogTrigger>
              <AdminPinModal onPinVerified={handleAdminLogin} />
            </Dialog>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 p-4">
              {products.map((product) => (
                <Card key={product.id} onClick={() => !isAdminMode && addToCart(product)} className="cursor-pointer relative">
                  {isAdminMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                      <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="secondary" size="icon" onClick={() => alert('수정 기능 추가 예정')}><Edit className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardContent className="p-4 text-center">
                    <div className="bg-gray-200 h-32 mb-4 rounded-lg"></div>
                    <p className="text-xl font-semibold">{product.name}</p>
                    <p className="text-lg">{product.price.toLocaleString()}원</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
          <footer className="p-4 mt-auto border-t">
            {cart.length > 0 && (
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {isCartExpanded ? `주문 내역 ${totalItems}개` : '마지막으로 담은 상품'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setIsCartExpanded(!isCartExpanded)}>
                    {isCartExpanded ? '접기' : '전체보기'}
                    {isCartExpanded ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
                
                {isCartExpanded ? (
                  <div className="max-h-32 overflow-y-auto mt-2 space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3"/></Button>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3"/></Button>
                          <span>{(item.price * item.quantity).toLocaleString()}원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  (() => {
                    const lastItem = cart[cart.length - 1];
                    return (
                      <div key={lastItem.id} className="flex items-center justify-between mt-2 text-sm">
                        <span>{lastItem.name} x{lastItem.quantity}</span>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(lastItem.id, -1)}><Minus className="h-3 w-3"/></Button>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(lastItem.id, 1)}><Plus className="h-3 w-3"/></Button>
                          <span>{(lastItem.price * lastItem.quantity).toLocaleString()}원</span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            <div className="flex justify-between font-bold text-xl my-4 pt-4 border-t">
              <span>총 {totalItems}개</span>
              <span>{totalAmount.toLocaleString()}원</span>
            </div>
            <Button className="w-full h-16 text-2xl" onClick={handlePayment} disabled={cart.length === 0}>결제하기</Button>
          </footer>
        </>
      )}
    </div>
  );
};

export default FrontKiosk;
