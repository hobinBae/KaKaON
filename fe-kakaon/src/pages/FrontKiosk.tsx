import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, ArrowLeft, Trash2, Edit, Minus, Plus, ChevronUp, ChevronDown, Delete } from "lucide-react";
import logoImg from '@/assets/logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoundStore } from '@/stores/storeStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AdminPinModal from '@/components/AdminPinModal';

const FrontKiosk = () => {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
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
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const currentStore = stores.find(store => store.id === selectedStoreId);
    if (currentStore) {
      setProducts(currentStore.products);
    }
  }, [selectedStoreId, stores]);

  useEffect(() => {
    if (isPaymentComplete) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            setIsPaymentComplete(false);
            setOrderType(null);
            return 3; 
          }
          return prevCountdown - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaymentComplete]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayment = () => {
    addTransaction({
      items: cart.map(({ name, quantity, price }) => ({ name, quantity, price })),
      total: totalAmount,
      orderType,
      paymentMethod,
      status: 'completed',
    });
    clearCart();
    setIsPaymentModalOpen(false);
    setIsPaymentComplete(true);
    setPaymentMethod('');
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      callback(imageUrl);
    }
  };

  const handleAddProduct = () => {
    if (newProductName && newProductPrice) {
      addProduct({
        name: newProductName,
        price: parseInt(newProductPrice.replace(/,/g, ''), 10),
        category: '전체',
        imageUrl: newProductImage ?? undefined,
      });
      setNewProductName('');
      setNewProductPrice('');
      setNewProductImage(null);
    }
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  if (isPaymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">결제가 완료되었습니다.</h1>
        <p className="text-4xl text-gray-600">
          <span className="font-bold text-blue-600">{countdown}</span>초 후 메인 화면으로 돌아갑니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {!orderType ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto px-16">
          <img src={logoImg} alt="KaKaON Logo" className="h-24 mb-12" />
          <h1 className="text-6xl font-bold mb-14 text-center text-gray-800 leading-tight">주문 유형을<br/>선택해주세요</h1>
          <div className="flex flex-col gap-10 w-full items-stretch">
            <Card onClick={() => setOrderType('dine-in')} className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-center p-16">
                <div className="text-center">
                  <span className="text-9xl mb-12 inline-block">🛒</span>
                  <h2 className="text-5xl font-bold text-gray-700">매장 주문</h2>
                </div>
              </CardContent>
            </Card>
            <Card onClick={() => setOrderType('take-out')} className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-center p-16">
                <div className="text-center">
                  <span className="text-9xl mb-12 inline-block">🛍️</span>
                  <h2 className="text-5xl font-bold text-gray-700">포장 주문</h2>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <header className="flex items-center justify-between p-6 border-b max-w-4xl w-full mx-auto">
            {isAdminMode ? (
               <Select value={selectedStoreId ?? ""} onValueChange={(val) => setSelectedStoreId(val)}>
                <SelectTrigger className="w-[220px] text-xl" style={{ height: '3rem' }}>
                  <SelectValue placeholder="가맹점 선택" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id} className="text-lg">{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Button variant="ghost" onClick={() => setOrderType(null)} className="w-16 h-16">
                <ArrowLeft className="size-12" />
              </Button>
            )}
            <div className="text-xl font-semibold">
              {isAdminMode ? (
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsAdminMode(false)} className="h-12 px-6 text-lg" variant="destructive">설정 완료</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-12 px-6 text-lg" variant="outline"><Plus className="mr-2 h-5 w-5" />상품 추가</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>새 상품 추가</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="name">상품명</Label>
                        <Input id="name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                        <Label htmlFor="price">가격</Label>
                        <Input id="price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} />
                        <Label htmlFor="image">이미지</Label>
                        <Input id="image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewProductImage)} />
                        {newProductImage && <img src={newProductImage} alt="preview" className="w-full h-32 object-cover rounded-md mt-2" />}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button onClick={handleAddProduct}>추가하기</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <img src={logoImg} alt="KaKaON Kiosk" className="h-16" />
              )}
            </div>
            {isAdminMode ? (
              <Button asChild className="h-12 px-6 text-lg bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded-3xl">
                <Link to="/dashboard">매출관리 화면 전환</Link>
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-16 h-16">
                    <Settings className="size-12" />
                  </Button>
                </DialogTrigger>
                <AdminPinModal onPinVerified={handleAdminLogin} />
              </Dialog>
            )}
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-4xl mx-auto">
              {products.map((product) => (
                <Card key={product.id} onClick={() => !isAdminMode && addToCart(product)} className="cursor-pointer relative">
                  {isAdminMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                      <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="secondary" size="icon" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardContent className="p-4 text-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-28 object-cover mb-4 rounded-lg" />
                    ) : (
                      <div className="bg-gray-200 h-28 mb-4 rounded-lg"></div>
                    )}
                    <p className="text-3xl font-semibold">{product.name}</p>
                    <p className="text-2xl">{product.price.toLocaleString()}원</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
          <footer className="p-4 mt-auto border-t bg-white sticky bottom-0">
            <div className="max-w-4xl mx-auto">
            {cart.length > 0 && (
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-3xl">
                    {isCartExpanded ? `주문 내역 ${totalItems}개` : '마지막으로 담은 상품'}
                  </span>
                  <Button variant="ghost" size="lg" className="text-2xl" onClick={() => setIsCartExpanded(!isCartExpanded)}>
                    {isCartExpanded ? '접기' : '전체보기'}
                    {isCartExpanded ? <ChevronDown className="size-8 ml-1" /> : <ChevronUp className="size-8 ml-1" />}
                  </Button>
                </div>
                
                {isCartExpanded ? (
                  <div className="max-h-32 overflow-y-auto mt-2 space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-2xl">
                        <span>{item.name} x{item.quantity}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="h-12 w-12" onClick={() => updateQuantity(item.id, -1)}><Minus className="size-8"/></Button>
                          <Button variant="outline" className="h-12 w-12" onClick={() => updateQuantity(item.id, 1)}><Plus className="size-8"/></Button>
                          <span className="w-32 text-right">{(item.price * item.quantity).toLocaleString()}원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  (() => {
                    const lastItem = cart[cart.length - 1];
                    return (
                      <div key={lastItem.id} className="flex items-center justify-between mt-2 text-2xl">
                        <span>{lastItem.name} x{lastItem.quantity}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="h-12 w-12" onClick={() => updateQuantity(lastItem.id, -1)}><Minus className="size-8"/></Button>
                          <Button variant="outline" className="h-12 w-12" onClick={() => updateQuantity(lastItem.id, 1)}><Plus className="size-8"/></Button>
                          <span className="w-32 text-right">{(lastItem.price * lastItem.quantity).toLocaleString()}원</span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            <div className="flex justify-between font-bold text-5xl my-8 pt-8 border-t">
              <span>총 {totalItems}개</span>
              <span>{totalAmount.toLocaleString()}원</span>
            </div>
            <Button className="w-full h-24 text-5xl" onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0}>결제하기</Button>
            </div>
          </footer>
        </>
      )}

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl">결제</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-8">
            <div>
              <Label className="text-2xl font-semibold">결제 수단</Label>
              <RadioGroup onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4 mt-4">
                {['카드', '현금', '카카오페이', '계좌'].map(method => (
                  <Label key={method} htmlFor={method} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-6 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-yellow-400 [&:has([data-state=checked])]:bg-yellow-300 h-24">
                    <RadioGroupItem value={method.toLowerCase()} id={method} className="sr-only" />
                    <span className="text-2xl font-medium">{method}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="pt-6 text-right border-t">
              <p className="text-2xl font-semibold">총 결제 금액</p>
              <p className="text-5xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePayment} className="w-full h-16 text-2xl" disabled={!paymentMethod}>결제 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>상품 수정</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="edit-name">상품명</Label>
              <Input id="edit-name" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
              <Label htmlFor="edit-price">가격</Label>
              <Input id="edit-price" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
              <Label htmlFor="edit-image">이미지</Label>
              <Input id="edit-image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingProduct({...editingProduct, imageUrl: url}))} />
              {editingProduct.imageUrl && <img src={newProductImage} alt="preview" className="w-full h-32 object-cover rounded-md mt-2" />}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button onClick={handleUpdateProduct}>수정하기</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FrontKiosk;
