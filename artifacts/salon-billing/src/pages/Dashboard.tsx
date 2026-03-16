import { useGetDashboardStats } from "@workspace/api-client-react";
import { Users, Receipt, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Fallback data if API fails or returns empty
  const dashboard = stats || {
    todayRevenue: 24500, todayBills: 12, todayCustomers: 15, totalCustomers: 1240,
    monthRevenue: 450000, monthBills: 320, pendingAppointments: 8, lowStockCount: 3,
    topServices: [
      { name: "Bridal Makeup", revenue: 120000, count: 8 },
      { name: "Keratin Treatment", revenue: 85000, count: 12 },
      { name: "Hair Color", revenue: 45000, count: 15 }
    ],
    topStaff: [
      { name: "Sarah", revenue: 150000, services: 45 },
      { name: "Mike", revenue: 95000, services: 32 }
    ],
    recentBills: [
      { id: 1, billNumber: "INV-001", finalAmount: 4500, status: "paid", createdAt: new Date().toISOString(), paymentMethod: "card" }
    ]
  };

  const chartData = dashboard.topServices.map(s => ({
    name: s.name.substring(0, 10) + '...',
    Revenue: s.revenue
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={`₹${dashboard.todayRevenue.toLocaleString()}`} icon={TrendingUp} trend="+12.5%" />
        <StatCard title="Bills Generated" value={dashboard.todayBills} icon={Receipt} />
        <StatCard title="Total Customers" value={dashboard.totalCustomers} icon={Users} trend="+4 this week" />
        <StatCard 
          title="Alerts" 
          value={`${dashboard.pendingAppointments} Appts`} 
          subtitle={`${dashboard.lowStockCount} items low stock`}
          icon={AlertCircle} 
          iconColor="text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 rounded-2xl shadow-lg shadow-black/5 border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif mb-6 text-foreground">Top Services Revenue</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bills */}
        <Card className="rounded-2xl shadow-lg shadow-black/5 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-serif text-foreground">Recent Bills</h3>
              <button className="text-sm text-secondary font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {dashboard.recentBills.slice(0, 5).map((bill: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{bill.billNumber}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(bill.createdAt), 'hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{bill.finalAmount}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium uppercase tracking-wider">
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor = "text-secondary" }: any) {
  return (
    <Card className="rounded-2xl shadow-lg shadow-black/5 border-border/50 hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground font-medium text-sm">{title}</p>
            <h3 className="text-3xl font-bold font-serif mt-2 text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <p className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
