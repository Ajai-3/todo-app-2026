import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, sub, color = '#10b981' }: StatCardProps) {
  return (
    <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`, backgroundSize: '14px 14px', opacity: 0.3 }} />
      <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(135deg, ${color}25 0%, rgba(9, 9, 11, 0.8) 50%, rgba(0, 0, 0, 1) 100%)` }} />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color }}>{value}</div>
            {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
