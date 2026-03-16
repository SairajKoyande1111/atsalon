import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/pos/POS";
import Customers from "./pages/customers/Customers";
import Services from "./pages/services/Services";
import Products from "./pages/products/Products";
import Staff from "./pages/staff/Staff";
import Appointments from "./pages/appointments/Appointments";
import Memberships from "./pages/memberships/Memberships";
import Reports from "./pages/reports/Reports";
import Expenses from "./pages/expenses/Expenses";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pos" component={POS} />
        <Route path="/customers" component={Customers} />
        <Route path="/services" component={Services} />
        <Route path="/products" component={Products} />
        <Route path="/staff" component={Staff} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/memberships" component={Memberships} />
        <Route path="/reports" component={Reports} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/settings">
          <div className="p-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h1>
            <p className="text-muted-foreground mb-6">Salon configuration and preferences</p>
            <div className="max-w-xl bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              {[
                { label: "Salon Name", value: "AT Salon Management" },
                { label: "Address", value: "123 Beauty Avenue, Mumbai 400001" },
                { label: "GST Number", value: "27AABCS1429B1ZB" },
                { label: "Phone", value: "+91-9876543200" },
                { label: "Email", value: "admin@atsalon.com" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">{f.label}</label>
                  <input defaultValue={f.value} className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              ))}
              <button className="w-full py-3 rose-gold-gradient text-white rounded-xl font-bold mt-2">Save Settings</button>
            </div>
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
