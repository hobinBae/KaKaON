import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X, Minus, Trash2, Edit, Settings, RotateCw, History, Package } from "lucide-react";
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBoundStore } from '@/stores/storeStore';
import type { CartItem } from '@/stores/storeStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 24;

const Pos = () => {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    transactions,
    addTransaction,
    cancelTransaction,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useBoundStore();
  const [products, setProducts] = useState([]);
  const [time, setTime] = useState(new Date());
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderType, setOrderType] = useState('store');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [view, setView] = useState('products'); // 'products' or 'history'
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const currentStore = stores.find(store => store.id === selectedStoreId);
    if (currentStore) {
      setProducts(currentStore.products);
    }
  }, [selectedStoreId, stores]);

  const recentTransactions = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return transactions
      .filter(t => new Date(t.date) > sevenDaysAgo && t.storeId === selectedStoreId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedStoreId]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddProduct = () => {
    if (newProductName && newProductPrice) {
      addProduct({
        name: newProductName,
        price: parseInt(newProductPrice.replace(/,/g, ''), 10),
        category: '기타',
      });
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setNewProductPrice(onlyNumbers ? Number(onlyNumbers).toLocaleString('ko-KR') : '');
  };

  const handlePayment = () => {
    addTransaction({
      items: cart.map(({ name, quantity, price }) => ({ name, quantity, price })),
      total: totalAmount,
      orderType,
      paymentMethod,
      status: 'completed',
    });
    clearCart();
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200 font-sans p-10 gap-4">
      <div className="w-[65%] flex flex-col gap-4">
        <header className="flex-shrink-0 h-16 bg-gray-600 text-white rounded-xl flex items-center justify-between px-6">
          <Select value={selectedStoreId ?? ""} onValueChange={(val) => setSelectedStoreId(val)}>
            <SelectTrigger className="w-[220px] bg-gray-300 border-gray-600 text-black text-xl [&_svg]:text-white [&_svg]:opacity-100">
              <SelectValue placeholder="가맹점 선택" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-lg text-right">
            <div>{`${time.getMonth() + 1}.${time.getDate()}. (${['일', '월', '화', '수', '목', '금', '토'][time.getDay()]})`}</div>
            <div>{time.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
          </div>
        </header>

        <main className="flex-1 rounded-xl p-6 flex flex-col min-h-0">
          {view === 'products' ? (
            <>
              <div className="flex-1 grid grid-cols-6 grid-rows-4 gap-3 p-2">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer bg-white border-gray-300 rounded-lg shadow-sm flex flex-col justify-between p-3 h-full relative transition-transform hover:scale-105">
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        <Button variant="secondary" size="icon" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <p className="text-gray-800">{product.name}</p>
                    <p className="text-lg font-bold text-right text-gray-800">{product.price.toLocaleString()}</p>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center items-center gap-2 pt-4 flex-shrink-0">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-3 w-3 rounded-full transition-colors ${currentPage === i + 1 ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              <h2 className="text-2xl font-bold mb-4">최근 주문 내역 (7일)</h2>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="border p-4 rounded-lg bg-white cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTransaction(tx)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{new Date(tx.date).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{tx.items.map(i => `${i.name} x ${i.quantity}`).join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{tx.total.toLocaleString()}원</p>
                          {tx.status === 'cancelled' && <span className="text-red-500 font-bold mt-2 inline-block">취소됨</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>최근 7일간의 주문 내역이 없습니다.</p>
              )}
            </div>
          )}
          <footer className="mt-4 pt-4 border-t flex-shrink-0 flex justify-between items-center">
            <div className="flex gap-4">
              {view === 'products' ? (
                <>
                  <Button variant={isEditMode ? "default" : "outline"} className="h-12 text-base px-6 font-bold" onClick={() => setIsEditMode(!isEditMode)}>
                    <Edit className="mr-2 h-5 w-5" /> {isEditMode ? "편집 완료" : "상품 편집"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-12 text-base px-6 font-bold"><Plus className="mr-2 h-5 w-5" /> 상품 추가</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>새 상품 추가</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="name">상품명</Label>
                        <Input id="name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                        <Label htmlFor="price">가격</Label>
                        <div className="relative flex-1">
                          <Input id="price" type="text" value={newProductPrice} onChange={handlePriceChange} className="pr-12 text-right" placeholder="0" />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">원</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button onClick={handleAddProduct}>추가하기</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Button variant="outline" className="h-12 text-base px-6 font-bold" onClick={() => setView('products')}>
                  <Package className="mr-2 h-5 w-5" /> 상품 목록으로
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              {view === 'products' ? (
                <Button variant="outline" className="h-12 text-base px-6 font-bold" onClick={() => setView('history')}>
                  <History className="mr-2 h-5 w-5" /> 주문내역 조회
                </Button>
              ) : (
                <Button variant="outline" className="h-12 text-base px-6 font-bold" onClick={() => setView('products')}>
                  <Package className="mr-2 h-5 w-5" /> 상품 목록으로
                </Button>
              )}
              <Link to="/dashboard">
                <Button className="h-12 text-lg bg-yellow-300 hover:bg-yellow-400 text-gray-800">
                  매출관리 화면으로 전환
                </Button>
              </Link>
            </div>
          </footer>
        </main>
      </div>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>상품 수정</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="edit-name">상품명</Label>
              <Input id="edit-name" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
              <Label htmlFor="edit-price">가격</Label>
              <Input id="edit-price" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button onClick={handleUpdateProduct}>수정하기</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>주문 상세 내역</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <p><span className="font-semibold">주문 번호:</span> {selectedTransaction.id}</p>
              <p><span className="font-semibold">주문 시간:</span> {new Date(selectedTransaction.date).toLocaleString()}</p>
              <p><span className="font-semibold">주문 항목:</span> {selectedTransaction.items.map(i => `${i.name} x ${i.quantity}`).join(', ')}</p>
              <p className="text-lg font-bold"><span className="font-semibold">총 금액:</span> {selectedTransaction.total.toLocaleString()}원</p>
              <p><span className="font-semibold">상태:</span> {selectedTransaction.status === 'completed' ? '완료' : '취소됨'}</p>
            </div>
            <DialogFooter>
              {selectedTransaction.status === 'completed' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">결제 취소</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>결제를 취소하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. 해당 주문의 결제가 취소됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>닫기</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        cancelTransaction(selectedTransaction.id);
                        setSelectedTransaction(null);
                      }}>확인</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>닫기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="w-[35%] flex flex-col gap-4">
        <div className="flex-1 bg-white rounded-xl p-6 flex flex-col">
          <header className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-bold">주문 내역</h2>
            <Button variant="ghost" size="icon" className="h-12 w-12 group hover:bg-transparent" onClick={clearCart}>
              <RotateCw className="h-8 w-8 text-gray-600 transition-transform group-hover:scale-110" />
            </Button>
          </header>
          <div className="flex-1 py-4 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="bg-blue-50 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-800">{item.name} x {item.quantity}</p>
                  <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}원</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-white" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-white" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}><Trash2 className="h-5 w-5 text-gray-800" /></Button>
                </div>
              </div>
            ))}
          </div>
          <footer className="mt-auto pt-4 border-t space-y-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-16 text-xl" disabled={cart.length === 0}>
                  <span className="bg-white text-blue-600 rounded-full h-7 w-7 flex items-center justify-center mr-3">{totalItems}</span>
                  {totalAmount.toLocaleString()}원 결제
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl">결제</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-8">
                  <div>
                    <Label className="text-xl font-semibold">주문 유형</Label>
                    <RadioGroup defaultValue="store" onValueChange={setOrderType} className="grid grid-cols-2 gap-4 mt-4">
                      <Label htmlFor="store" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-yellow-400 [&:has([data-state=checked])]:bg-yellow-300">
                        <RadioGroupItem value="store" id="store" className="sr-only" />
                        <span className="text-lg font-medium">가게 주문</span>
                      </Label>
                      <Label htmlFor="delivery" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-yellow-400 [&:has([data-state=checked])]:bg-yellow-300">
                        <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                        <span className="text-lg font-medium">배달 주문</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-xl font-semibold">결제 수단</Label>
                    <RadioGroup defaultValue="card" onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4 mt-4">
                      {['카드', '계좌', '카카오페이', '현금'].map(method => (
                        <Label key={method} htmlFor={method} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-yellow-400 [&:has([data-state=checked])]:bg-yellow-300">
                          <RadioGroupItem value={method.toLowerCase()} id={method} className="sr-only" />
                          <span className="text-lg font-medium">{method}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="pt-6 text-right border-t">
                    <p className="text-xl font-semibold">총 결제 금액</p>
                    <p className="text-4xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</p>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button onClick={handlePayment} className="w-full h-14 text-xl">결제 완료</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Pos;
