import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Plus, Minus, Trash2, Edit, Delete } from "lucide-react";
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
import { useMyStores } from '@/lib/hooks/useStores';
import { useMenus } from '@/lib/hooks/useMenus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AdminPinModal from '@/components/AdminPinModal';

const GeneralKiosk = () => {
  const {
    selectedStoreId,
    setSelectedStoreId,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useBoundStore();

  const { data: stores, isLoading: isLoadingStores } = useMyStores();
  const { data: products, isLoading: isLoadingProducts } = useMenus(selectedStoreId ? Number(selectedStoreId) : null);

  const [orderType, setOrderType] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      setSelectedStoreId(String(stores[0].storeId));
    }
  }, [stores, selectedStoreId, setSelectedStoreId]);

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
    // TODO: addTransaction API 연동 필요
    console.log('Payment processing:', {
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
    // TODO: addProduct API 연동 필요
    if (newProductName && newProductPrice) {
      console.log('Adding product:', {
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
    // TODO: updateProduct API 연동 필요
    if (editingProduct) {
      console.log('Updating product:', editingProduct);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    // TODO: deleteProduct API 연동 필요
    console.log('Deleting product:', productId);
  }

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
    <div className="flex flex-col h-screen bg-white">
      {!orderType ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 p-8">
          <div className="text-center mb-12">
            <img src={logoImg} alt="KaKaON Logo" className="h-24 mx-auto mb-6" />
            <p className="text-6xl font-bold text-gray-800 leading-tight">주문 유형을<br/>선택해주세요</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-10 w-full max-w-md sm:max-w-4xl">
            <Card onClick={() => setOrderType('dine-in')} className="cursor-pointer flex-1 bg-white rounded-3xl shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="flex items-center justify-center p-16">
                <div className="text-center">
                  <span className="text-9xl mb-12 inline-block">🛒</span>
                  <h2 className="text-4xl font-bold text-gray-700">매장 주문</h2>
                </div>
              </CardContent>
            </Card>
            <Card onClick={() => setOrderType('take-out')} className="cursor-pointer flex-1 bg-white rounded-3xl shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="flex items-center justify-center p-16">
                <div className="text-center">
                  <span className="text-9xl mb-12 inline-block">🛍️</span>
                  <h2 className="text-4xl font-bold text-gray-700">포장 주문</h2>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          <header className="flex justify-between items-center p-6 border-b flex-shrink-0">
            {isAdminMode ? (
              <Select value={selectedStoreId ?? ""} onValueChange={(val) => setSelectedStoreId(val)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={isLoadingStores ? "로딩 중..." : "가맹점 선택"} />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((store) => (
                    <SelectItem key={store.storeId} value={String(store.storeId)}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <img src={logoImg} alt="KaKaON Kiosk" className="h-16" />
            )}
            <div className="flex items-center">
              {!isAdminMode && <Button variant="ghost" className="mr-4 text-2xl h-16" onClick={() => setOrderType(null)}>처음으로</Button>}
              {isAdminMode && (
                <>
                  <Button onClick={() => setIsAdminMode(false)} variant="destructive" className="mr-2">관리자 모드 종료</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline"><Plus className="mr-2 h-4 w-4" />상품 추가</Button>
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
                  <Button asChild className="h-12 px-6 text-lg bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded-3xl ml-2">
                    <Link to="/dashboard">매출관리 화면 전환</Link>
                  </Button>
                </>
              )}
              {!isAdminMode && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-16 h-16">
                      <Settings className="size-12" />
                    </Button>
                  </DialogTrigger>
                  <AdminPinModal onPinVerified={handleAdminLogin} />
                </Dialog>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 pt-4 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {isLoadingProducts ? (
                <p>메뉴를 불러오는 중입니다...</p>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                <Card key={product.id} onClick={() => !isAdminMode && addToCart(product)} className="cursor-pointer relative">
                  {isAdminMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="secondary" size="icon" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardContent className="p-4 text-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-4 rounded-lg" />
                    ) : (
                      <div className="bg-gray-200 h-40 mb-4 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">이미지</span>
                      </div>
                    )}
                    <p className="text-2xl font-semibold">{product.name}</p>
                    <p className="text-xl">{product.price.toLocaleString()}원</p>
                  </CardContent>
                </Card>
                ))
              ) : (
                <p>등록된 메뉴가 없습니다.</p>
              )}
            </div>
          </main>
          <footer className="bg-gray-50 p-8 border-t flex-shrink-0">
            <h2 className="text-3xl font-bold mb-4">주문 내역 ({totalItems}개)</h2>
            <div className="h-48 overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item.id} className="border p-4 rounded-lg mb-4 flex justify-between items-center">
                  <p className="font-bold text-xl">{item.name}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button className="h-12 w-12" variant="outline" onClick={() => updateQuantity(item.id, -1)}><Minus className="size-8"/></Button>
                      <span className="text-2xl w-8 text-center">{item.quantity}</span>
                      <Button className="h-12 w-12" variant="outline" onClick={() => updateQuantity(item.id, 1)}><Plus className="size-8"/></Button>
                    </div>
                    <p className="w-32 text-right text-xl">{(item.price * item.quantity).toLocaleString()}원</p>
                    <Button variant="ghost" size="icon" className="text-red-500 h-12 w-12" onClick={() => removeFromCart(item.id)}><Trash2 className="size-8"/></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="font-bold text-3xl">
                <span>{orderType === 'dine-in' ? '[매장]' : '[포장]'}</span>
                <span> 총 {totalAmount.toLocaleString()}원</span>
              </div>
              <Button className="h-20 text-4xl px-12" onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0}>결제하기</Button>
            </div>
          </footer>
        </div>
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
              {editingProduct.imageUrl && <img src={editingProduct.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-md mt-2" />}
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

export default GeneralKiosk;
