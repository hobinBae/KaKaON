import { useState, useMemo, useEffect } from 'react';
import { addDays, differenceInCalendarDays, isToday, format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, Edit, RotateCw, History, Package, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useMyStores } from '@/lib/hooks/useStores';
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from '@/lib/hooks/useMenus';
import { useCreateOrder, useCancelOrder, useOrders, useOrderDetail } from '@/lib/hooks/useOrders';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    addTransaction,
    cancelTransaction,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useBoundStore();

  const { data: stores, isLoading: isLoadingStores } = useMyStores();
  const { selectedStoreId, setSelectedStoreId } = useBoundStore();
  const { data: products, isLoading: isLoadingProducts } = useMenus(selectedStoreId ? Number(selectedStoreId) : null);
  const { data: transactions, isLoading: isLoadingTransactions } = useOrders(selectedStoreId ? Number(selectedStoreId) : null);
  const createMenuMutation = useCreateMenu();
  const createOrderMutation = useCreateOrder();
  const updateMenuMutation = useUpdateMenu();
  const deleteMenuMutation = useDeleteMenu();
  const cancelOrderMutation = useCancelOrder();

  const [time, setTime] = useState(new Date());
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderType, setOrderType] = useState('store');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [view, setView] = useState('products'); // 'products' or 'history'
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const { data: selectedTransaction, isLoading: isLoadingTransactionDetail } = useOrderDetail(selectedTransactionId);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(new Date());

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      setSelectedStoreId(String(stores[0].storeId));
    }
  }, [stores, selectedStoreId, setSelectedStoreId]);

  const dailyTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
        .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === selectedHistoryDate.getFullYear() &&
                   txDate.getMonth() === selectedHistoryDate.getMonth() &&
                   txDate.getDate() === selectedHistoryDate.getDate();
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedHistoryDate]);

  const HISTORY_ITEMS_PER_PAGE = 5;
  const historyTotalPages = Math.ceil((dailyTransactions?.length || 0) / HISTORY_ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    if (!dailyTransactions) return [];
    const startIndex = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE;
    return dailyTransactions.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);
  }, [dailyTransactions, historyCurrentPage]);

  const totalPages = Math.ceil((products?.length || 0) / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    if (!products) return [];
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
    if (newProductName && newProductPrice && selectedStoreId) {
      const price = parseInt(newProductPrice.replace(/,/g, ''), 10);
      createMenuMutation.mutate({
        storeId: Number(selectedStoreId),
        menuData: {
          menu: newProductName,
          price: price,
          imgUrl: '',
        },
      }, {
        onSuccess: () => {
          setNewProductName('');
          setNewProductPrice('');
          setIsAddProductDialogOpen(false);
        }
      });
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setNewProductPrice(onlyNumbers ? Number(onlyNumbers).toLocaleString('ko-KR') : '');
  };

  const handlePayment = () => {
    if (cart.length > 0 && selectedStoreId && products && paymentMethod) {
      const paymentMethodMap = {
        '카드': 'CARD',
        '계좌': 'TRANSFER',
        '카카오페이': 'KAKAOPAY',
        '현금': 'CASH',
      };
      const convertedPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod.toUpperCase();

      const validCartItems = cart.filter(item => products.some(p => p.id === item.id));
      
      if (validCartItems.length !== cart.length) {
        console.error("Cart contains items not found in products list.");
        return;
      }

      const calculatedTotalAmount = validCartItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id)!;
        return sum + product.price * item.quantity;
      }, 0);

      const orderData = {
        items: validCartItems.map(item => {
          const product = products.find(p => p.id === item.id)!;
          return {
            menuId: item.id,
            price: product.price,
            quantity: item.quantity,
          };
        }),
        totalAmount: calculatedTotalAmount,
        paymentMethod: convertedPaymentMethod,
        orderType: orderType.toUpperCase(),
      };

      console.log("Creating order with data:", orderData);

      createOrderMutation.mutate({
        storeId: Number(selectedStoreId),
        orderData,
      }, {
        onSuccess: () => {
          clearCart();
          setIsPaymentDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Order creation failed:", error);
          if (error.response) {
            console.error("Server response:", error.response.data);
          }
        }
      });
    }
  };

  const handleDeleteProduct = (productId) => {
    if (selectedStoreId) {
      deleteMenuMutation.mutate({
        storeId: Number(selectedStoreId),
        menuId: productId,
      });
    }
  };

  const handleUpdateProduct = () => {
    if (editingProduct && selectedStoreId) {
      updateMenuMutation.mutate({
        storeId: Number(selectedStoreId),
        menuId: editingProduct.id,
        menuData: {
          menu: editingProduct.name,
          price: editingProduct.price,
        },
      }, {
        onSuccess: () => {
          setEditingProduct(null);
        }
      });
    }
  };


  return (
    <div className="flex h-screen bg-gray-200 font-sans p-10 gap-4">
      <div className="w-[65%] flex flex-col gap-4">
        <header className="flex-shrink-0 h-16 bg-gray-600 text-white rounded-xl flex items-center justify-between px-6">
          <Select value={selectedStoreId ?? ""} onValueChange={(val) => setSelectedStoreId(val)}>
            <SelectTrigger className="w-[220px] bg-gray-300 border-gray-600 text-black text-xl [&_svg]:text-white [&_svg]:opacity-100">
              <SelectValue placeholder={isLoadingStores ? "로딩 중..." : "가맹점 선택"} />
            </SelectTrigger>
            <SelectContent>
              {stores && stores.length > 0 ? (
                stores.map((store) => (
                  <SelectItem key={store.storeId} value={String(store.storeId)}>{store.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-stores" disabled>
                  가맹점을 추가해주세요
                </SelectItem>
              )}
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
                {isLoadingProducts ? (
                  <p>메뉴를 불러오는 중입니다...</p>
                ) : paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer bg-white border-gray-300 rounded-lg shadow-sm flex flex-col justify-between p-3 h-full relative transition-transform hover:scale-105">
                      {isEditMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 rounded-lg">
                          <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}><Trash2 className="h-4 w-4" /></Button>
                          <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}><Edit className="h-4 w-4" /></Button>
                        </div>
                      )}
                      <p className="text-gray-800">{product.name}</p>
                      <p className="text-lg font-bold text-right text-gray-800">{product.price.toLocaleString()}원</p>
                    </Card>
                  ))
                ) : (
                  <p>등록된 메뉴가 없습니다.</p>
                )}
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
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">주문 내역</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setSelectedHistoryDate(prev => addDays(prev, -1))} disabled={differenceInCalendarDays(new Date(), selectedHistoryDate) >= 6}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">{format(selectedHistoryDate, 'yyyy.MM.dd')}</span>
                  <Button variant="outline" size="icon" onClick={() => setSelectedHistoryDate(prev => addDays(prev, 1))} disabled={isToday(selectedHistoryDate)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {paginatedHistory.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {paginatedHistory.map(tx => (
                    <Card key={tx.id} className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm" onClick={() => setSelectedTransactionId(tx.id)}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-700">{new Date(tx.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <Badge variant="outline" className="text-xs">{tx.orderType === 'STORE' ? '가게' : '배달'}</Badge>
                        </div>
                        <Badge variant={tx.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">{tx.status === 'completed' ? '완료' : '취소'}</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-base font-bold text-gray-800">{tx.items[0].name} {tx.items.length > 1 ? `외 ${tx.items.length - 1}건` : ''}</p>
                          <p className="text-xs text-gray-500">주문번호: {tx.id}</p>
                        </div>
                        <p className="font-bold text-lg text-gray-800">{tx.total.toLocaleString()}원</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">해당 날짜의 주문 내역이 없습니다.</p>
                </div>
              )}
              {historyTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  {[...Array(historyTotalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHistoryCurrentPage(i + 1)}
                      className={`h-2 w-2 rounded-full transition-colors ${historyCurrentPage === i + 1 ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
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
                  <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-12 text-base px-6 font-bold"><Plus className="mr-2 h-5 w-5" /> 상품 추가</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>새 상품 추가</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="name">상품명</Label>
                        <Input id="name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                        <Label htmlFor="price">가격</Label>
                        <div className="flex items-center">
                          <Input id="price" type="text" value={newProductPrice} onChange={handlePriceChange} placeholder="0" className="text-right" />
                          <span className="ml-2">원</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddProduct}>추가하기</Button>
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
              ) : null}
              <Link to="/dashboard">
                <Button className="h-12 text-lg bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded-3xl">
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
              <Button onClick={handleUpdateProduct}>수정하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedTransactionId && (
        <Dialog open={!!selectedTransactionId} onOpenChange={() => setSelectedTransactionId(null)}>
          <DialogContent className="max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle>결제 상세정보</DialogTitle>
            </DialogHeader>
            {isLoadingTransactionDetail ? (
              <p>로딩 중...</p>
            ) : selectedTransaction ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">결제시간</div>
                    <div className="text-gray-900">{new Date(selectedTransaction.date).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">주문 구분</div>
                    <div className="text-gray-900">{selectedTransaction.orderType === 'STORE' ? '가게 주문' : '배달 주문'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">결제수단</div>
                    <div className="text-gray-900">{{'CARD': '카드', 'TRANSFER': '계좌', 'KAKAOPAY': '카카오페이', 'CASH': '현금'}[selectedTransaction.paymentMethod] || selectedTransaction.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">결제 상태</div>
                    <Badge variant={selectedTransaction.status === 'cancelled' ? 'destructive' : 'secondary'} className="rounded">
                      {selectedTransaction.status === 'completed' ? '완료' : '취소'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">주문번호</div>
                    <div className="text-gray-900">{selectedTransaction.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">결제금액</div>
                    <div className="text-gray-900">{selectedTransaction.total.toLocaleString()}원</div>
                  </div>
                </div>

                <Card className="p-4 bg-gray-50 rounded-lg max-h-72 overflow-y-auto">
                  <h3 className="text-sm font-semibold mb-2">주문상세내역</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>상품명</TableHead>
                        <TableHead className="text-right">수량</TableHead>
                        <TableHead className="text-right">가격</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{(item.price * item.quantity).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right font-bold mt-2">
                    합계: {selectedTransaction.total.toLocaleString()}원
                  </div>
                </Card>

                <DialogFooter className="sm:justify-between gap-2">
                  <Button variant="outline" onClick={() => setSelectedTransactionId(null)}>닫기</Button>
                  {selectedTransaction.status === 'completed' && (
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-3xl">결제 취소</Button>
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
                            if (selectedStoreId) {
                              cancelOrderMutation.mutate({
                                storeId: Number(selectedStoreId),
                                orderId: selectedTransaction.id,
                              }, {
                                onSuccess: () => {
                                  setSelectedTransactionId(null);
                                }
                              });
                            }
                          }}>확인</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DialogFooter>
              </div>
            ) : <p>주문 정보를 불러오는데 실패했습니다.</p>}
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
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
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
                    <RadioGroup onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4 mt-4">
                      {['카드', '계좌', '카카오페이', '현금'].map(method => (
                        <Label key={method} htmlFor={method} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-yellow-400 [&:has([data-state=checked])]:bg-yellow-300">
                          <RadioGroupItem value={method} id={method} className="sr-only" />
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
                  <Button onClick={handlePayment} className="w-full h-14 text-xl" disabled={!paymentMethod}>결제 완료</Button>
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
