export function HeatmapView({ reviewLogs = [] }: { reviewLogs?: any[] }) {
  const today = new Date();

  // Create a map of date string (YYYY-MM-DD) to count
  const activityMap: Record<string, number> = {};
  reviewLogs.forEach(log => {
    const d = new Date(log.reviewed_at);
    // adjust to local date string YYYY-MM-DD
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
  });

  // Start from the 1st day of the month, 11 months ago
  const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

  const monthBlocks = [];

  for (let i = 0; i < 12; i++) {
    const mDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const year = mDate.getFullYear();
    const month = mDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const columns = [];
    let currentColumn = new Array(7).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      // Map Sunday(0) to 6, Monday(1) to 0, ..., Saturday(6) to 5
      const dayOfWeek = d.getDay();
      const mappedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      currentColumn[mappedDay] = d;

      if (mappedDay === 6 || day === daysInMonth) {
        columns.push(currentColumn);
        currentColumn = new Array(7).fill(null);
      }
    }

    monthBlocks.push({
      name: mDate.toLocaleString('default', { month: 'short' }),
      columns
    });
  }

  const days = Array.from({ length: 7 });

  return (
    <div className="flex flex-col w-full">
      <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-max flex gap-2">
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px] pt-1 pr-1">
            {days.map((_, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-400 leading-3 h-3 w-6 text-right"
              >
                {i === 1 ? 'Mon' : i === 3 ? 'Wed' : i === 5 ? 'Fri' : ''}
              </div>
            ))}
          </div>

          {/* Month Blocks */}
          <div className="flex gap-2.5">
            {monthBlocks.map((block, mIdx) => (
              <div key={mIdx} className="flex flex-col">
                {/* Grid columns for this month */}
                <div className="flex gap-[3px] mt-1">
                  {block.columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-[3px]">
                      {col.map((day, dayIdx) => {
                        if (!day) {
                          // Empty placeholder to maintain grid alignment
                          return <div key={dayIdx} className="w-3 h-3" />;
                        }
                        
                        const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                        const count = activityMap[dateKey] || 0;
                        
                        let level = 0;
                        if (count > 0) level = 1;
                        if (count > 2) level = 2;
                        if (count > 5) level = 3;
                        if (count > 10) level = 4;

                        // Using opacity for intensity
                        let colorClass = 'bg-gray-100';
                        if (level === 1) colorClass = 'bg-gray-900 opacity-25';
                        if (level === 2) colorClass = 'bg-gray-900 opacity-50';
                        if (level === 3) colorClass = 'bg-gray-900 opacity-75';
                        if (level === 4) colorClass = 'bg-gray-900';

                        // Render actual day square
                        return (
                          <div
                            key={dayIdx}
                            className={`w-3 h-3 rounded-[2px] ${colorClass}`}
                            title={`${day.toDateString()}: ${count} reviews`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Month label below the block */}
                <div className="text-[10px] text-gray-400 mt-2 text-center w-full">
                  {block.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1 md:hidden">
        Scroll to see full year &rarr;
      </div>
    </div>
  );
}
