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
    <Card className="bg-[#1a3a3a] border-emerald-900/50">
      <CardContent className="p-4">
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
