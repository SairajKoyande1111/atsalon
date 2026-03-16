import { useState, useMemo } from "react";
import { useListServices, useListProducts, useListCustomers, useListStaff, useCreateBill } from "@workspace/api-client-react";
import { Search, Plus, Trash2, Tag, Percent, Receipt, CreditCard, Banknote, Smartphone, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type CartItem = {
  uid: string;
  type: 'service' | 'product';
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
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
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'wallet'>('upi');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18);

  // Derived State
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity) - item.discount, 0);
  const totalAfterDiscount = Math.max(0, subtotal - globalDiscount);
  const taxAmount = (totalAfterDiscount * taxPercent) / 100;
  const finalAmount = Math.round(totalAfterDiscount + taxAmount);

  // Filtering
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

  const addToCart = (item: any, type: 'service' | 'product') => {
    setCart(prev => [...prev, {
      uid: Math.random().toString(36).substr(2, 9),
      type,
      itemId: item.id,
      name: item.name,
      price: type === 'service' ? item.price : item.sellingPrice,
      quantity: 1,
      discount: 0,
      staffId: null
    }]);
  };

  const updateCartItem = (uid: string, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map(item => item.uid === uid ? { ...item, [field]: value } : item));
  };

  const removeCartItem = (uid: string) => {
    setCart(prev => prev.filter(item => item.uid !== uid));
  };

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
          discount: item.discount
        })),
        taxPercent,
        paymentMethod,
        discountAmount: globalDiscount,
        loyaltyPointsUsed: 0,
        couponCode: null
      }
    }, {
      onSuccess: () => {
        toast({ title: "Bill Generated Successfully" });
        setCart([]);
        setCustomerId("");
        setGlobalDiscount(0);
      },
      onError: (err) => {
        toast({ title: "Failed to generate bill", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden animate-in fade-in duration-300">
      
      {/* LEFT PANEL: Catalog (55% width) */}
      <div className="w-[55%] flex flex-col border-r border-border/50 bg-muted/10">
        <div className="p-4 border-b border-border/50 bg-background flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-primary/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold text-primary">New Bill</h1>
          </div>
          
          <div className="flex bg-muted p-1 rounded-xl">
            <button 
              onClick={() => { setActiveTab('services'); setActiveCategory('All'); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              Services
            </button>
            <button 
              onClick={() => { setActiveTab('products'); setActiveCategory('All'); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              Products
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-border/50 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat 
                    ? 'bg-secondary text-white border-secondary' 
                    : 'bg-background border-border text-foreground hover:border-secondary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => addToCart(item, activeTab)}
                className="bg-card border border-border/50 rounded-2xl p-4 cursor-pointer hover:border-secondary hover:shadow-lg shadow-black/5 hover:-translate-y-1 transition-all duration-200 flex flex-col group"
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{item.category}</span>
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                  {activeTab === 'services' && <p className="text-xs text-muted-foreground mt-1">{item.duration} mins</p>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-primary">₹{activeTab === 'services' ? item.price : item.sellingPrice}</span>
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-secondary" />
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No items found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT PANEL WRAPPER (45% width) */}
      <div className="w-[45%] flex flex-col bg-background">
        
        {/* Customer Selection Header */}
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <div className="flex-1">
            <select 
              className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Walk-in Customer (Select)</option>
              {customersData?.customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
          </div>
          <button className="px-4 py-3 bg-secondary/10 text-secondary font-semibold rounded-xl hover:bg-secondary/20 transition-colors whitespace-nowrap text-sm">
            + New
          </button>
        </div>

        {/* Cart Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <Receipt className="w-16 h-16 opacity-20" />
              <p>Cart is empty. Add items from the catalog.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={item.uid} className="bg-card border border-border/50 rounded-xl p-3 shadow-sm flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <div className="flex gap-2 mt-2">
                      {item.type === 'service' && (
                        <select 
                          className="text-xs p-1 border rounded bg-muted/20 w-28"
                          value={item.staffId || ""}
                          onChange={(e) => updateCartItem(item.uid, 'staffId', e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Staff</option>
                          {staffData?.staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                      <div className="flex items-center border rounded overflow-hidden h-7">
                        <button className="px-2 bg-muted/50 hover:bg-muted" onClick={() => updateCartItem(item.uid, 'quantity', Math.max(1, item.quantity - 1))}>-</button>
                        <span className="px-2 text-xs font-medium w-8 text-center">{item.quantity}</span>
                        <button className="px-2 bg-muted/50 hover:bg-muted" onClick={() => updateCartItem(item.uid, 'quantity', item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">₹{(item.price * item.quantity) - item.discount}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button onClick={() => {
                        const disc = prompt("Enter discount amount (₹):", item.discount.toString());
                        if(disc !== null) updateCartItem(item.uid, 'discount', Number(disc) || 0);
                      }} className="text-xs text-secondary hover:underline flex items-center">
                        <Tag className="w-3 h-3 mr-1"/> Disc
                      </button>
                      <button onClick={() => removeCartItem(item.uid)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment (Bottom Right) */}
        <div className="bg-primary text-primary-foreground p-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-primary-foreground/80 text-sm">
              <span>Subtotal ({cart.length} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-primary-foreground/80 text-sm items-center">
              <span className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => {
                  const val = prompt("Enter global discount (₹):", globalDiscount.toString());
                  if(val !== null) setGlobalDiscount(Number(val) || 0);
              }}>
                Discount <Tag className="w-3 h-3"/>
              </span>
              <span>- ₹{globalDiscount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-primary-foreground/80 text-sm">
              <span>Tax (GST {taxPercent}%)</span>
              <span>+ ₹{taxAmount.toLocaleString()}</span>
            </div>
            
            <div className="pt-3 border-t border-primary-foreground/20 flex justify-between items-end">
              <span className="text-lg font-serif">Final Amount</span>
              <span className="text-4xl font-bold font-serif tracking-tight text-secondary">₹{finalAmount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-primary-foreground/60 mb-2 uppercase tracking-widest font-bold">Payment Method</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { id: 'cash', icon: Banknote, label: 'Cash' },
              { id: 'upi', icon: Smartphone, label: 'UPI' },
              { id: 'card', icon: CreditCard, label: 'Card' },
              { id: 'wallet', icon: Receipt, label: 'Wallet' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id as any)}
                className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-all ${
                  paymentMethod === m.id 
                    ? 'bg-secondary text-white shadow-lg scale-105' 
                    : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20'
                }`}
              >
                <m.icon className="w-5 h-5 mb-1" />
                {m.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerateBill}
            disabled={cart.length === 0 || createBill.isPending}
            className="w-full py-4 rose-gold-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {createBill.isPending ? "Processing..." : "Generate Bill"}
          </button>
        </div>

      </div>
    </div>
  );
}
