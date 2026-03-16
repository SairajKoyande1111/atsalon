import { useState, useMemo } from "react";
import { useListServices, useListProducts, useListCustomers, useListStaff, useCreateBill } from "@workspace/api-client-react";
import { Search, Plus, Trash2, Tag, Receipt, CreditCard, Banknote, Smartphone, ChevronLeft, Wallet } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type CartItem = {
  uid: string;
  type: 'service' | 'product';
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  discountPct: number;
  staffId?: number | null;
};

export default function POS() {
  const { toast } = useToast();
  const { data: servicesData } = useListServices();
  const { data: productsData } = useListProducts();
  const { data: customersData } = useListCustomers();
  const { data: staffData } = useListStaff();
  const createBill = useCreateBill();

  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'wallet'>('upi');
  const [globalDiscountPct, setGlobalDiscountPct] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const taxPercent = taxEnabled ? 18 : 0;

  const services = servicesData?.services || [];
  const products = productsData?.products || [];

  const categories = useMemo(() => {
    const items = activeTab === 'services' ? services : products;
    const cats = Array.from(new Set(items.map((i: any) => i.category)));
    return ['All', ...cats];
  }, [services, products, activeTab]);

  const filteredItems = useMemo(() => {
    const items = activeTab === 'services' ? services : products;
    return items.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, products, activeTab, search, activeCategory]);

  const addToCart = (item: any) => {
    const price = Number(activeTab === 'services' ? item.price : item.sellingPrice) || 0;
    setCart(prev => [...prev, {
      uid: Math.random().toString(36).substr(2, 9),
      type: activeTab as 'service' | 'product',
      itemId: item.id,
      name: item.name,
      price,
      quantity: 1,
      discountPct: 0,
      staffId: null
    }]);
  };

  const updateCartItem = (uid: string, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map(item => item.uid === uid ? { ...item, [field]: value } : item));
  };

  const removeCartItem = (uid: string) => {
    setCart(prev => prev.filter(item => item.uid !== uid));
  };

  const getItemTotal = (item: CartItem) => {
    const base = item.price * item.quantity;
    return base * (1 - item.discountPct / 100);
  };

  const subtotal = cart.reduce((acc, item) => acc + getItemTotal(item), 0);
  const globalDiscountAmount = subtotal * (globalDiscountPct / 100);
  const afterDiscount = Math.max(0, subtotal - globalDiscountAmount);
  const taxAmount = (afterDiscount * taxPercent) / 100;
  const finalAmount = Math.round(afterDiscount + taxAmount);

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }
    createBill.mutate({
      data: {
        customerId: customerId === "" ? null : Number(customerId),
        items: cart.map(item => ({
          type: item.type,
          itemId: item.itemId,
          staffId: item.staffId || null,
          quantity: item.quantity,
          discount: item.discountPct
        })),
        taxPercent,
        paymentMethod,
        discountAmount: globalDiscountAmount,
        loyaltyPointsUsed: 0,
        couponCode: null
      }
    }, {
      onSuccess: (data: any) => {
        toast({ title: `Bill ${data?.billNumber} Generated!`, description: `₹${finalAmount.toLocaleString()} via ${paymentMethod.toUpperCase()}` });
        setCart([]);
        setCustomerId("");
        setGlobalDiscountPct(0);
      },
      onError: (err: any) => {
        toast({ title: "Failed to generate bill", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden animate-in fade-in duration-300">
      
      {/* LEFT PANEL */}
      <div className="w-[55%] flex flex-col border-r border-border/50 bg-muted/10">
        <div className="p-4 border-b border-border/50 bg-background flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-primary/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold text-primary">New Bill</h1>
          </div>
          <div className="flex bg-muted p-1 rounded-xl">
            {['services', 'products'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab as any); setActiveCategory('All'); }}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-border/50 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 text-sm border-none focus:ring-2 focus:ring-secondary/40 outline-none"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${activeCategory === cat ? 'bg-secondary text-white border-secondary' : 'bg-background border-border text-foreground hover:border-secondary/50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item: any) => {
              const price = Number(activeTab === 'services' ? item.price : item.sellingPrice) || 0;
              return (
                <div key={item.id} onClick={() => addToCart(item)}
                  className="bg-card border border-border/50 rounded-2xl p-4 cursor-pointer hover:border-secondary hover:shadow-lg shadow-black/5 hover:-translate-y-1 transition-all duration-200 flex flex-col group">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.category}</span>
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1">{item.name}</h3>
                  {activeTab === 'services' && <p className="text-xs text-muted-foreground mt-1">{item.duration} mins</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">₹{price.toLocaleString()}</span>
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground text-sm">No items found.</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[45%] flex flex-col bg-background">
        
        {/* Customer */}
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <select className="flex-1 p-2.5 rounded-xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm appearance-none"
            value={customerId} onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Walk-in Customer</option>
            {customersData?.customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
            ))}
          </select>
          <button className="px-3 py-2.5 bg-secondary/10 text-secondary font-semibold rounded-xl hover:bg-secondary/20 text-sm whitespace-nowrap">+ Add</button>
        </div>

        {/* Cart */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
              <Receipt className="w-14 h-14 opacity-15" />
              <p className="text-sm">Select services or products to add to bill</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={item.uid} className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.type === 'service' && (
                          <select className="text-xs p-1 border border-border rounded-lg bg-muted/20"
                            value={item.staffId || ""}
                            onChange={e => updateCartItem(item.uid, 'staffId', e.target.value ? Number(e.target.value) : null)}>
                            <option value="">Assign Staff</option>
                            {staffData?.staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        )}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden h-7">
                          <button className="px-2 bg-muted/40 hover:bg-muted text-xs" onClick={() => updateCartItem(item.uid, 'quantity', Math.max(1, item.quantity - 1))}>−</button>
                          <span className="px-3 text-xs font-bold">{item.quantity}</span>
                          <button className="px-2 bg-muted/40 hover:bg-muted text-xs" onClick={() => updateCartItem(item.uid, 'quantity', item.quantity + 1)}>+</button>
                        </div>
                        <button onClick={() => {
                          const d = prompt("Discount % for this item:", item.discountPct.toString());
                          if (d !== null) updateCartItem(item.uid, 'discountPct', Math.min(100, Math.max(0, Number(d) || 0)));
                        }} className="text-xs text-secondary hover:underline flex items-center gap-1 h-7 px-2 border border-secondary/30 rounded-lg">
                          <Tag className="w-3 h-3" />{item.discountPct > 0 ? `${item.discountPct}% off` : 'Disc'}
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-primary">₹{getItemTotal(item).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      {item.discountPct > 0 && <p className="text-xs line-through text-muted-foreground">₹{(item.price * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>}
                      <button onClick={() => removeCartItem(item.uid)} className="mt-1 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors block ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment */}
        <div className="bg-primary text-primary-foreground p-5 rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-10">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-primary-foreground/75 text-sm">
              <span>Subtotal ({cart.length} items)</span>
              <span>₹{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-primary-foreground/75 text-sm items-center">
              <button className="flex items-center gap-1 hover:text-white" onClick={() => {
                const v = prompt("Global discount %:", globalDiscountPct.toString());
                if (v !== null) setGlobalDiscountPct(Math.min(100, Math.max(0, Number(v) || 0)));
              }}>
                Discount <Tag className="w-3 h-3" />{globalDiscountPct > 0 ? ` (${globalDiscountPct}%)` : ''}
              </button>
              <span>− ₹{globalDiscountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-primary-foreground/75 text-sm items-center">
              <button className="flex items-center gap-1 hover:text-white" onClick={() => setTaxEnabled(t => !t)}>
                GST {taxPercent}% {taxEnabled ? '(ON)' : '(OFF)'}
              </button>
              <span>+ ₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="pt-2.5 border-t border-primary-foreground/20 flex justify-between items-end">
              <span className="text-base font-serif">Final Amount</span>
              <span className="text-3xl font-bold font-serif text-secondary">₹{finalAmount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[10px] text-primary-foreground/50 mb-2 uppercase tracking-widest font-bold">Payment Method</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { id: 'cash', icon: Banknote, label: 'Cash' },
              { id: 'upi', icon: Smartphone, label: 'UPI' },
              { id: 'card', icon: CreditCard, label: 'Card' },
              { id: 'wallet', icon: Wallet, label: 'Wallet' },
            ].map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id as any)}
                className={`py-2.5 flex flex-col items-center gap-1 rounded-xl text-xs font-medium transition-all ${paymentMethod === m.id ? 'bg-secondary text-white shadow-lg scale-105' : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20'}`}>
                <m.icon className="w-4 h-4" />{m.label}
              </button>
            ))}
          </div>

          <button onClick={handleGenerateBill} disabled={cart.length === 0 || createBill.isPending}
            className="w-full py-3.5 rose-gold-gradient text-white rounded-2xl font-bold text-base shadow-xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
            {createBill.isPending ? "Processing..." : `Generate Bill — ₹${finalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
