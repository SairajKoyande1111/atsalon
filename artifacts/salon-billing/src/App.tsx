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
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
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
        {/* Fallbacks for routes mentioned in sidebar but not fully implemented due to limits */}
        <Route path="/memberships">
          <div className="p-8"><h1>Memberships (Coming Soon)</h1></div>
        </Route>
        <Route path="/reports">
          <div className="p-8"><h1>Reports (Coming Soon)</h1></div>
        </Route>
        <Route path="/expenses">
          <div className="p-8"><h1>Expenses (Coming Soon)</h1></div>
        </Route>
        <Route path="/settings">
          <div className="p-8"><h1>Settings (Coming Soon)</h1></div>
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
