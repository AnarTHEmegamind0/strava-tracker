'use client';

import { PersonalRecord } from '@/types';

interface PersonalRecordsProps {
  records: PersonalRecord[];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatValue(type: string, value: number): string {
  // Distance records (5km, 10km, 15km, half marathon) - value is time in seconds
  if (type.includes('км хамгийн хурдан') || type === 'Хагас марафон') {
    return formatTime(value);
  }
  
  switch (type) {
    case 'Хамгийн урт зай':
      return `${(value / 1000).toFixed(2)} км`;
    case 'Хамгийн их өндөрлөг':
      return `${Math.round(value)} м`;
    case 'Хамгийн урт хугацаа':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return hours > 0 ? `${hours}ц ${minutes}м` : `${minutes}м`;
    case 'Хамгийн хурдан хурд':
      const mins = Math.floor(value);
      const secs = Math.round((value - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')} /км`;
    default:
      return value.toString();
  }
}

function getIcon(type: string): string {
  // Distance-based records
  if (type === '5км хамгийн хурдан') return '🏃';
  if (type === '10км хамгийн хурдан') return '🏃‍♂️';
  if (type === '15км хамгийн хурдан') return '🏃‍♀️';
  if (type === 'Хагас марафон') return '🏅';
  
  switch (type) {
    case 'Хамгийн урт зай': return '📏';
    case 'Хамгийн их өндөрлөг': return '⛰️';
    case 'Хамгийн урт хугацаа': return '⏱️';
    case 'Хамгийн хурдан хурд': return '⚡';
    default: return '🏆';
  }
}

export default function PersonalRecords({ records }: PersonalRecordsProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Хувийн рекордууд
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Одоогоор рекорд байхгүй. Дасгал хийсээр байгаарай!
        </p>
      </div>
    );
  }

  // Separate distance PRs and other records
  const distancePRs = records.filter(r => 
    r.type.includes('км хамгийн хурдан') || r.type === 'Хагас марафон'
  );
  const otherRecords = records.filter(r => 
    !r.type.includes('км хамгийн хурдан') && r.type !== 'Хагас марафон'
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Хувийн рекордууд
      </h3>
      
      {/* Distance PRs Section */}
      {distancePRs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Зайн рекордууд
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {distancePRs.map((record, index) => (
              <div
                key={index}
                className="flex min-w-0 flex-col rounded-lg border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:border-orange-800/30 dark:from-orange-900/20 dark:to-red-900/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getIcon(record.type)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {record.type}
                  </span>
                </div>
                <p className="mb-1 text-xl font-bold text-[#FC4C02] sm:text-2xl">
                  {formatValue(record.type, record.value)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {record.activity_name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(record.date).toLocaleDateString('mn-MN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Records Section */}
      {otherRecords.length > 0 && (
        <div>
          {distancePRs.length > 0 && (
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Бусад рекордууд
            </h4>
          )}
          <div className="space-y-3">
            {otherRecords.map((record, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:gap-4 dark:bg-gray-700/50"
              >
                <span className="text-2xl sm:shrink-0">{getIcon(record.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {record.type}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {record.activity_name}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-base font-bold text-[#FC4C02] sm:text-lg">
                    {formatValue(record.type, record.value)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(record.date).toLocaleDateString('mn-MN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
