import { useGetDashboardStats } from "@workspace/api-client-react";
import { Users, Receipt, TrendingUp, AlertCircle, Star, Zap, Award, ShoppingBag } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
  RadialBarChart, RadialBar
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const RICH_DUMMY = {
  todayRevenue: 42750, todayBills: 18, todayCustomers: 22, totalCustomers: 1847,
  monthRevenue: 812400, monthBills: 524, pendingAppointments: 11, lowStockCount: 3,
  topServices: [
    { name: "Bridal Makeup", revenue: 185000, count: 24 },
    { name: "Keratin Treatment", revenue: 127500, count: 51 },
    { name: "Hair Color", revenue: 96000, count: 120 },
    { name: "Gold Facial", revenue: 72000, count: 60 },
    { name: "Body Massage", revenue: 65000, count: 65 },
    { name: "Hair Spa", revenue: 42000, count: 70 },
  ],
  topStaff: [
    { name: "Priya Sharma", revenue: 220000, services: 148 },
    { name: "Kavya Singh", revenue: 185000, services: 102 },
    { name: "Anjali Mehta", revenue: 142000, services: 119 },
    { name: "Sneha Reddy", revenue: 98000, services: 89 },
    { name: "Riya Patel", revenue: 72000, services: 76 },
  ],
  recentBills: [
    { id: 1, billNumber: "INV-2026-0142", finalAmount: 5900, status: "paid", createdAt: new Date(Date.now() - 15 * 60000).toISOString(), paymentMethod: "upi" },
    { id: 2, billNumber: "INV-2026-0141", finalAmount: 3200, status: "paid", createdAt: new Date(Date.now() - 45 * 60000).toISOString(), paymentMethod: "card" },
    { id: 3, billNumber: "INV-2026-0140", finalAmount: 8750, status: "paid", createdAt: new Date(Date.now() - 80 * 60000).toISOString(), paymentMethod: "cash" },
    { id: 4, billNumber: "INV-2026-0139", finalAmount: 1500, status: "paid", createdAt: new Date(Date.now() - 110 * 60000).toISOString(), paymentMethod: "upi" },
    { id: 5, billNumber: "INV-2026-0138", finalAmount: 12400, status: "paid", createdAt: new Date(Date.now() - 150 * 60000).toISOString(), paymentMethod: "card" },
  ]
};

const weeklyRevenue = [
  { day: "Mon", revenue: 38200, customers: 19 },
  { day: "Tue", revenue: 52400, customers: 26 },
  { day: "Wed", revenue: 41800, customers: 21 },
  { day: "Thu", revenue: 68900, customers: 34 },
  { day: "Fri", revenue: 89200, customers: 44 },
  { day: "Sat", revenue: 112600, customers: 56 },
  { day: "Sun", revenue: 78400, customers: 39 },
];

const serviceDistribution = [
  { name: "Hair", value: 35, color: "#7c3aed" },
  { name: "Facial", value: 22, color: "#c084fc" },
  { name: "Spa", value: 18, color: "#e879f9" },
  { name: "Makeup", value: 15, color: "#f472b6" },
  { name: "Nails", value: 10, color: "#fb923c" },
];

const paymentMix = [
  { name: "UPI", value: 48, color: "#7c3aed", fill: "#7c3aed" },
  { name: "Card", value: 28, color: "#c084fc", fill: "#c084fc" },
  { name: "Cash", value: 18, color: "#f472b6", fill: "#f472b6" },
  { name: "Wallet", value: 6, color: "#fb923c", fill: "#fb923c" },
];

const monthlyTrend = [
  { month: "Oct", revenue: 620000 },
  { month: "Nov", revenue: 695000 },
  { month: "Dec", revenue: 780000 },
  { month: "Jan", revenue: 710000 },
  { month: "Feb", revenue: 755000 },
  { month: "Mar", revenue: 812400 },
];

const goalData = [
  { name: "Monthly Target", value: 82, fill: "#7c3aed" },
];

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const dashboard = (stats && stats.totalCustomers > 0) ? stats : RICH_DUMMY;

  return (
    <div className="p-6 max-w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's your salon performance at a glance.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          <p className="text-xs text-muted-foreground mt-1">Live Dashboard</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`₹${dashboard.todayRevenue.toLocaleString()}`} icon={TrendingUp} trend="+18.3% vs yesterday" color="from-violet-600 to-purple-700" />
        <StatCard title="Bills Generated" value={dashboard.todayBills} sub={`${dashboard.monthBills} this month`} icon={Receipt} color="from-rose-500 to-pink-600" />
        <StatCard title="Total Customers" value={dashboard.totalCustomers.toLocaleString()} sub={`${dashboard.todayCustomers} visited today`} icon={Users} color="from-orange-500 to-amber-600" />
        <StatCard title="Pending Appts" value={dashboard.pendingAppointments} sub={`${dashboard.lowStockCount} low stock alerts`} icon={AlertCircle} color="from-emerald-500 to-teal-600" />
      </div>

      {/* Row 2: Weekly Revenue Chart + Service Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-serif text-foreground">Weekly Revenue</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">This Week</span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,.12)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">Service Mix</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" labelLine={false} label={CustomPieLabel}>
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {serviceDistribution.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.name} {s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Services Bar + Payment Mix + Goal Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">Top Services</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.topServices.slice(0, 5).map(s => ({ name: s.name.split(" ")[0], revenue: s.revenue }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v/1000}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} width={60} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 10, border: "none" }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={20}>
                    {dashboard.topServices.slice(0, 5).map((_, i) => (
                      <Cell key={i} fill={serviceDistribution[i]?.color || "#7c3aed"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">Payment Methods</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMix} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={4}>
                    {paymentMix.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {paymentMix.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-xs text-muted-foreground">{p.name} {p.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-2">Monthly Goal</h3>
            <p className="text-xs text-muted-foreground mb-4">Target: ₹10,00,000</p>
            <div className="h-[160px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" data={goalData} startAngle={180} endAngle={-180}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold font-serif text-primary">82%</p>
                <p className="text-xs text-muted-foreground">achieved</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-foreground">₹8,12,400 <span className="text-muted-foreground font-normal text-xs">/ ₹10,00,000</span></p>
              <p className="text-xs text-emerald-600 mt-1">₹1,87,600 remaining this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Monthly Trend + Top Staff + Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">6-Month Trend</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`]} contentStyle={{ borderRadius: 10, border: "none" }} />
                  <Line type="monotone" dataKey="revenue" stroke="#c084fc" strokeWidth={2.5} dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">Top Staff</h3>
            <div className="space-y-3">
              {dashboard.topStaff.slice(0, 4).map((staff: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full rose-gold-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {staff.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate">{staff.name.split(" ")[0]}</span>
                      <span className="text-muted-foreground shrink-0 ml-1">₹{(staff.revenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(staff.revenue / dashboard.topStaff[0].revenue) * 100}%`, background: serviceDistribution[i]?.color || "#7c3aed" }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-muted-foreground">{staff.services}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-serif text-foreground">Recent Bills</h3>
              <button className="text-xs text-secondary font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {dashboard.recentBills.slice(0, 5).map((bill: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{bill.billNumber}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(bill.createdAt), 'hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{Number(bill.finalAmount).toLocaleString()}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase">PAID</span>
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

function StatCard({ title, value, sub, icon: Icon, trend, color }: any) {
  return (
    <Card className={`rounded-2xl shadow-lg overflow-hidden border-0 bg-gradient-to-br ${color} text-white`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 font-medium text-xs uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold font-serif mt-1.5">{value}</h3>
            {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
            {trend && <p className="text-white/80 text-xs mt-2 bg-white/10 inline-block px-2 py-0.5 rounded-full">{trend}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
