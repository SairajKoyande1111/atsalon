import { useState } from "react";
import { useListCustomers, useCreateCustomer } from "@workspace/api-client-react";
import { Search, Plus, User, Star, Phone, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useListCustomers({ search });
  const createCustomer = useCreateCustomer();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Customer Added" });
        setShowAdd(false);
        setFormData({ name: "", phone: "", email: "" });
        refetch();
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their history.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Metrics</th>
                <th className="p-4">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : data?.customers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
              ) : (
                data?.customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {c.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                          {c.membershipType && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase font-bold tracking-wider mt-1 inline-block">
                              {c.membershipType}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2 text-foreground"><Phone className="w-3.5 h-3.5 text-muted-foreground"/> {c.phone}</p>
                        {c.email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5"/> {c.email}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-semibold">₹{c.totalSpend.toLocaleString()}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/> {c.loyaltyPoints} points
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5"/> 
                          {c.lastVisit ? format(new Date(c.lastVisit), 'MMM d, yyyy') : 'Never'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{c.totalVisits} total visits</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Dialog Simulation */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-serif font-bold mb-6 text-primary">New Customer</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Full Name</label>
                <input required autoFocus className="w-full p-3 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Phone Number</label>
                <input required className="w-full p-3 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Email (Optional)</label>
                <input type="email" className="w-full p-3 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary/20 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border hover:bg-muted font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={createCustomer.isPending} className="flex-1 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  {createCustomer.isPending ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
