import { Target, Crown, Flame, Timer } from 'lucide-react';

export function StatRow({ userProblems = [] }: { userProblems?: any[] }) {
  const reviewed = userProblems.length;
  const mastered = userProblems.filter(p => p.is_mastered).length;
  const inProgress = Math.max(0, reviewed - mastered);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dueToday = userProblems.filter(p => {
    if (!p.due || p.is_mastered) return false;
    const dueDate = new Date(p.due);
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const daysFromNow = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Count as due if it is today or overdue (daysFromNow <= 0)
    return daysFromNow <= 0;
  }).length;

  const stats = [
    { 
      label: 'Problems reviewed', 
      value: reviewed.toString(), 
      icon: Target,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-900',
    },
    { 
      label: 'Mastered', 
      value: mastered.toString(), 
      icon: Crown,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-900',
    },
    { 
      label: 'In progress', 
      value: inProgress.toString(), 
      icon: Flame,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-900',
    },
    { 
      label: 'Due', 
      value: dueToday.toString(), 
      icon: Timer,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col">
                <div className="text-3xl font-extrabold tracking-tight text-gray-900 font-mono">
                  {stat.value}
                </div>
                <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
