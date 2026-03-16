import { useState } from "react";
import { useListAppointments, useListCustomers, useListStaff, useListServices, useCreateAppointment, useUpdateAppointment } from "@workspace/api-client-react";
import { format, addDays, subDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Sparkles, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  'scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
  'confirmed': 'bg-violet-100 text-violet-700 border-violet-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const categoryColors: Record<string, string> = {
  'Hair Services': 'border-l-violet-500',
  'Facial': 'border-l-pink-400',
  'Spa': 'border-l-teal-500',
  'Makeup': 'border-l-rose-500',
  'Nail Care': 'border-l-orange-400',
  'default': 'border-l-purple-400',
};

// Rich dummy data for showcase
const DUMMY_APPOINTMENTS = [
  { id: 1, customerId: 1, customerName: "Meena Krishnan", customerPhone: "+91-9898989898", staffId: 1, staffName: "Priya Sharma", serviceId: 1, serviceName: "Haircut & Styling", serviceCategory: "Hair Services", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "10:00", duration: 30, status: "completed", notes: "" },
  { id: 2, customerId: 2, customerName: "Sunita Agarwal", customerPhone: "+91-9797979797", staffId: 2, staffName: "Anjali Mehta", serviceId: 5, serviceName: "Facial - Basic", serviceCategory: "Facial", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "11:00", duration: 45, status: "in-progress", notes: "Sensitive skin" },
  { id: 3, customerId: 3, customerName: "Deepa Nair", customerPhone: "+91-9696969696", staffId: 4, staffName: "Kavya Singh", serviceId: 10, serviceName: "Bridal Makeup", serviceCategory: "Makeup", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "12:30", duration: 180, status: "confirmed", notes: "Bridal function evening" },
  { id: 4, customerId: 4, customerName: "Rekha Joshi", customerPhone: "+91-9595959595", staffId: 1, staffName: "Priya Sharma", serviceId: 4, serviceName: "Keratin Treatment", serviceCategory: "Hair Services", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "14:00", duration: 120, status: "scheduled", notes: "" },
  { id: 5, customerId: 5, customerName: "Pooja Verma", customerPhone: "+91-9494949494", staffId: 5, staffName: "Sneha Reddy", serviceId: 8, serviceName: "Body Massage", serviceCategory: "Spa", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "15:30", duration: 60, status: "scheduled", notes: "Aromatherapy preference" },
  { id: 6, customerId: 6, customerName: "Anita Bose", customerPhone: "+91-9393939393", staffId: 3, staffName: "Riya Patel", serviceId: 12, serviceName: "Manicure", serviceCategory: "Nail Care", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "16:30", duration: 45, status: "scheduled", notes: "" },
  { id: 7, customerId: 7, customerName: "Divya Rao", customerPhone: "+91-9292929292", staffId: 2, staffName: "Anjali Mehta", serviceId: 6, serviceName: "Facial - Gold", serviceCategory: "Facial", appointmentDate: format(new Date(), 'yyyy-MM-dd'), appointmentTime: "17:30", duration: 60, status: "scheduled", notes: "" },
];

export default function Appointments() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: apiData, isLoading, refetch } = useListAppointments({ date: dateStr });
  const { data: customersData } = useListCustomers();
  const { data: staffData } = useListStaff();
  const { data: servicesData } = useListServices();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const apiAppointments = apiData?.appointments || [];
  // Show dummy data when empty for showcase
  const appointments = apiAppointments.length > 0 ? apiAppointments : (isToday ? DUMMY_APPOINTMENTS : []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateAppointment.mutateAsync({ id, data: { status: status as any } });
      refetch();
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Appointments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {appointments.length} appointments · {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="px-3 py-2.5 hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-2.5 flex items-center gap-2 border-x border-border">
              <CalendarIcon className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">{format(selectedDate, 'dd MMM yyyy')}</span>
            </div>
            <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="px-3 py-2.5 hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 text-sm">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", count: appointments.length, color: "bg-violet-100 text-violet-700" },
          { label: "Confirmed", count: appointments.filter(a => a.status === "confirmed" || a.status === "scheduled").length, color: "bg-blue-100 text-blue-700" },
          { label: "In Progress", count: appointments.filter(a => a.status === "in-progress").length, color: "bg-amber-100 text-amber-700" },
          { label: "Completed", count: appointments.filter(a => a.status === "completed").length, color: "bg-green-100 text-green-700" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center font-bold text-lg`}>{s.count}</div>
            <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No appointments for this date.</p>
            <button onClick={() => setShowBookingModal(true)} className="mt-4 text-secondary font-semibold text-sm hover:underline">
              + Schedule one now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {appointments.map((apt: any) => (
              <div key={apt.id} className={`flex gap-4 p-4 hover:bg-muted/30 transition-colors border-l-4 ${categoryColors[apt.serviceCategory] || categoryColors.default} group`}>
                <div className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-border/50 pr-4">
                  <div className="flex items-center gap-1 text-primary font-bold text-sm">
                    <Clock className="w-3.5 h-3.5" /> {apt.appointmentTime}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{apt.duration}m</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Customer</p>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-secondary shrink-0" />{apt.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Service</p>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />{apt.serviceName}
                    </p>
                    <p className="text-xs text-muted-foreground">with {apt.staffName}</p>
                  </div>
                  <div>
                    {apt.notes && <p className="text-xs text-muted-foreground italic">"{apt.notes}"</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[apt.status]}`}>
                    {apt.status}
                  </span>
                  <select onChange={e => handleStatusChange(apt.id, e.target.value)} defaultValue={apt.status}
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-background opacity-0 group-hover:opacity-100 transition-opacity">
                    {['scheduled','confirmed','in-progress','completed','cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookingModal && (
        <BookingModal
          customers={customersData?.customers || []}
          staff={staffData?.staff || []}
          services={servicesData?.services || []}
          selectedDate={dateStr}
          onClose={() => setShowBookingModal(false)}
          onCreate={(data: any) => {
            createAppointment.mutate({ data }, {
              onSuccess: () => { toast({ title: "Appointment booked!" }); setShowBookingModal(false); refetch(); },
              onError: () => toast({ title: "Failed to book", variant: "destructive" })
            });
          }}
          isLoading={createAppointment.isPending}
        />
      )}
    </div>
  );
}

function BookingModal({ customers, staff, services, selectedDate, onClose, onCreate, isLoading }: any) {
  const [form, setForm] = useState({
    customerId: "",
    staffId: "",
    serviceId: "",
    appointmentDate: selectedDate,
    appointmentTime: "10:00",
    notes: ""
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.staffId || !form.serviceId) return;
    onCreate({ ...form, customerId: Number(form.customerId), staffId: Number(form.staffId), serviceId: Number(form.serviceId) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-serif font-bold text-primary">Book Appointment</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Schedule a new salon appointment</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Customer *</label>
              <select required value={form.customerId} onChange={e => set('customerId', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none appearance-none">
                <option value="">Select customer</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Service *</label>
              <select required value={form.serviceId} onChange={e => set('serviceId', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none appearance-none">
                <option value="">Select service</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} — ₹{Number(s.price).toLocaleString()}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Assign Staff *</label>
            <select required value={form.staffId} onChange={e => set('staffId', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none appearance-none">
              <option value="">Select staff member</option>
              {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {s.specialization}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date *</label>
              <input type="date" required value={form.appointmentDate} onChange={e => set('appointmentDate', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Time *</label>
              <input type="time" required value={form.appointmentTime} onChange={e => set('appointmentTime', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any special instructions..."
              className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary/40 outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 rounded-xl rose-gold-gradient text-white font-bold text-sm shadow-lg disabled:opacity-50 hover:-translate-y-0.5 transition-all duration-200">
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
