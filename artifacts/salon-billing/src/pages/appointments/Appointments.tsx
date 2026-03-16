import { useListAppointments } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Sparkles } from "lucide-react";

export default function Appointments() {
  // Use today's date for default view
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading } = useListAppointments({ date: today });

  const statusColors: any = {
    'scheduled': 'bg-blue-100 text-blue-700',
    'confirmed': 'bg-purple-100 text-purple-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule for {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <button className="bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20">
          Book Appointment
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 min-h-[500px]">
        {isLoading ? (
          <p>Loading schedule...</p>
        ) : data?.appointments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.appointments.map((apt: any) => (
              <div key={apt.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors hover:shadow-md group">
                <div className="md:w-32 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg">
                    <Clock className="w-5 h-5"/> {apt.appointmentTime}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{apt.duration} mins</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                    <p className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-secondary"/> {apt.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{apt.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Service & Staff</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary"/> {apt.serviceName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">with {apt.staffName}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[apt.status]}`}>
                    {apt.status}
                  </span>
                  <button className="mt-3 text-sm text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
