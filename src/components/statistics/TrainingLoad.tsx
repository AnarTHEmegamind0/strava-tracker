'use client';

import { useState, useEffect } from 'react';

interface TrainingLoadData {
  analysis: string;
  atl: number;
  ctl: number;
  tsb: number;
  status: string;
}

export default function TrainingLoad() {
  const [data, setData] = useState<TrainingLoadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingLoad = async () => {
      try {
        const response = await fetch('/api/ai/training-load');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch training load:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingLoad();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'fresh':
        return { 
          label: 'Сэргэсэн', 
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
          emoji: '🟢',
          description: 'Хүнд дасгал хийхэд бэлэн'
        };
      case 'optimal':
        return { 
          label: 'Тохиромжтой', 
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          emoji: '🔵',
          description: 'Хамгийн сайн байдалд байна'
        };
      case 'tired':
        return { 
          label: 'Ядарсан', 
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          emoji: '🟡',
          description: 'Хөнгөн дасгал зөвлөж байна'
        };
      case 'overreached':
        return { 
          label: 'Хэт ачаалалтай', 
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
          emoji: '🔴',
          description: 'Амралт авах шаардлагатай'
        };
      default:
        return { 
          label: 'Тодорхойгүй', 
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          emoji: '⚪',
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          📈 Дасгалын ачаалал (Training Load)
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FC4C02] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          📈 Дасгалын ачаалал (Training Load)
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Ачаалал тооцоолох боломжгүй. Дасгал илүү хийх хэрэгтэй.
        </p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(data.status);
  
  // Calculate bar widths (normalize to max 100)
  const maxLoad = Math.max(data.atl, data.ctl, 20);
  const atlWidth = (data.atl / maxLoad) * 100;
  const ctlWidth = (data.ctl / maxLoad) * 100;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          📈 Дасгалын ачаалал
        </h3>
        <div className={`self-start rounded-full px-3 py-1 text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
          {statusInfo.emoji} {statusInfo.label}
        </div>
      </div>

      {/* Load Metrics */}
      <div className="mb-6 space-y-4">
        {/* ATL - Acute Training Load */}
        <div>
          <div className="mb-1 flex justify-between text-sm gap-2">
            <span className="text-gray-600 dark:text-gray-400">ATL (7 хоног)</span>
            <span className="font-semibold text-gray-900 dark:text-white">{data.atl}</span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${atlWidth}%` }}
            />
          </div>
        </div>

        {/* CTL - Chronic Training Load */}
        <div>
          <div className="mb-1 flex justify-between text-sm gap-2">
            <span className="text-gray-600 dark:text-gray-400">CTL (28 хоног)</span>
            <span className="font-semibold text-gray-900 dark:text-white">{data.ctl}</span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${ctlWidth}%` }}
            />
          </div>
        </div>

        {/* TSB - Training Stress Balance */}
        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600 dark:text-gray-400">TSB (Тэнцвэр)</span>
            <span className={`text-2xl font-bold ${data.tsb >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.tsb >= 0 ? '+' : ''}{data.tsb}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            TSB = CTL - ATL. Эерэг бол сэргэсэн, сөрөг бол ядарсан.
          </p>
        </div>
      </div>

      {/* Status Description */}
      <div className={`rounded-lg p-4 ${statusInfo.bg}`}>
        <p className={`text-sm font-medium ${statusInfo.color} mb-2`}>
          {statusInfo.description}
        </p>
      </div>

      {/* AI Analysis */}
      {data.analysis && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span>🤖</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Шинжилгээ</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {data.analysis}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          <strong>ATL</strong> = Acute Training Load (сүүлийн 7 хоногийн ачаалал)<br/>
          <strong>CTL</strong> = Chronic Training Load (сүүлийн 28 хоногийн ачаалал)<br/>
          <strong>TSB</strong> = Training Stress Balance (бие сэргэсэн эсэх)
        </p>
      </div>
    </div>
  );
}
