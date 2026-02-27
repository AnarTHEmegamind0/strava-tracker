'use client';

interface WeekComparisonProps {
  thisWeek: {
    total_distance: number;
    total_time: number;
    total_elevation: number;
    activity_count: number;
  };
  changes: {
    distance: number;
    time: number;
    elevation: number;
    count: number;
  };
}

function formatChange(value: number, isCount = false): string {
  if (isCount) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}`;
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(0)}%`;
}

function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}

export default function WeekComparison({ thisWeek, changes }: WeekComparisonProps) {
  const stats = [
    {
      label: 'Зай',
      value: `${(thisWeek.total_distance / 1000).toFixed(1)} км`,
      change: changes.distance,
      icon: '🏃',
    },
    {
      label: 'Хугацаа',
      value: `${Math.floor(thisWeek.total_time / 3600)}ц ${Math.floor((thisWeek.total_time % 3600) / 60)}м`,
      change: changes.time,
      icon: '⏱️',
    },
    {
      label: 'Өндөрлөг',
      value: `${Math.round(thisWeek.total_elevation)} м`,
      change: changes.elevation,
      icon: '⛰️',
    },
    {
      label: 'Дасгалууд',
      value: thisWeek.activity_count.toString(),
      change: changes.count,
      isCount: true,
      icon: '📊',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Энэ долоо хоног vs Өнгөрсөн долоо хоног
      </h3>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {stat.value}
            </p>
            <p className={`text-sm font-medium ${getChangeColor(stat.change)}`}>
              {formatChange(stat.change, stat.isCount)} өмнөхөөс
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
