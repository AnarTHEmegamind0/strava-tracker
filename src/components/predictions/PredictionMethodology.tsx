'use client';

import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function PredictionMethodology() {
  const [openItems, setOpenItems] = useState<string[]>(['riegel']);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'riegel',
      title: 'Riegel томьёо',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4">
            <p className="text-center font-mono text-xl md:text-2xl text-[#FC4C02] font-bold tracking-wide">
              T₂ = T₁ × (D₂ / D₁)^1.06
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { symbol: 'T₁', desc: 'Мэдэгдэж буй зайн хугацаа', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
              { symbol: 'D₁', desc: 'Мэдэгдэж буй зай', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
              { symbol: 'T₂', desc: 'Таамаглах зайн хугацаа', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
              { symbol: 'D₂', desc: 'Таамаглах зай', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' },
            ].map((item) => (
              <div key={item.symbol} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center font-mono font-bold`}>
                  {item.symbol}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <span className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-mono font-bold">
              1.06
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Ядралын коэффициент</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Зай урт болох тусам хурд буурдаг байдлыг илэрхийлнэ
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Энэ томьёог Питер Ригель 1977 онд боловсруулсан бөгөөд гүйлтийн таамаглалд өргөн хэрэглэгддэг.
          </p>
        </div>
      ),
    },
    {
      id: 'howItWorks',
      title: 'Хэрхэн ажилладаг вэ?',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#FC4C02] via-orange-400 to-amber-400" />
          
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'Өгөгдөл цуглуулах',
                desc: 'Таны бүх гүйлтийн бүртгэлийг авч, зай болон хугацааг задлан шинжилнэ.',
                icon: '📊',
              },
              {
                step: 2,
                title: 'Хамгийн сайн гүйлтийг олох',
                desc: '5км, 10км, 15км, хагас марафон зайд хамгийн хурдан гүйлтүүдийг тодорхойлно.',
                icon: '🏆',
              },
              {
                step: 3,
                title: 'Таамаглал гаргах',
                desc: 'Riegel томьёог ашиглан зорилтот зай бүрт хугацааг тооцоолно.',
                icon: '🔮',
              },
            ].map((item, index) => (
              <div key={item.step} className="flex gap-4 relative">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-[#FC4C02] flex items-center justify-center font-bold text-[#FC4C02] z-10 shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'confidence',
      title: 'Итгэлцүүрийн түвшин',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          {[
            {
              level: 'Өндөр',
              range: '70-150%',
              desc: 'Таамаглах зайтай ойролцоо зайн гүйлт байгаа',
              color: 'bg-green-500',
              bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            },
            {
              level: 'Дунд',
              range: '40-250%',
              desc: 'Таамаглах зайтай дунд зэрэг зайн гүйлт байгаа',
              color: 'bg-yellow-500',
              bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            },
            {
              level: 'Бага',
              range: '<40% эсвэл >250%',
              desc: 'Таамаглах зайнаас хол зайн гүйлт дээр суурилсан',
              color: 'bg-red-500',
              bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            },
          ].map((item) => (
            <div key={item.level} className={`flex items-center gap-4 p-4 rounded-xl border ${item.bg}`}>
              <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.level}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                    {item.range}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'limitations',
      title: 'Анхаарах зүйлс',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          {[
            { icon: '💪', text: 'Таамаглал нь таны одоогийн чадварт суурилсан - дасгалаа үргэлжлүүлбэл сайжирна' },
            { icon: '🌤️', text: 'Уур амьсгал, газрын гадаргуу, өндөршил зэрэг нөлөөлнө' },
            { icon: '🍌', text: 'Урт зайн уралдаанд (марафон) тэжээллэг чухал үүрэгтэй' },
            { icon: '📈', text: 'Илүү олон өгөгдөл байх тусам таамаглал илүү үнэн зөв болно' },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {accordionItems.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isOpen 
                    ? 'bg-[#FC4C02] text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                <div className="pt-4">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-[#FC4C02] to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Илүү сайн таамаглал авахын тулд</h4>
            <ul className="space-y-2 text-white/90 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Янз бүрийн зайд уралдааны хурдтай гүйлт хий
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Долоо хоногт нэг удаа &quot;бүх хүчээрээ&quot; гүйлт оруул
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Тогтмол дасгал хийж өгөгдлөө баяжуул
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
