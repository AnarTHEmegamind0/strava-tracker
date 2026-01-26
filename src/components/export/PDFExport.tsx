'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DBActivity } from '@/types';

interface PDFExportProps {
  activities: DBActivity[];
  athleteName: string;
}

export default function PDFExport({ activities, athleteName }: PDFExportProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(252, 76, 2); // Strava orange
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Дасгалын тайлан', 14, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${athleteName} | Generated ${new Date().toLocaleDateString()}`, 14, 32);
      
      // Summary Stats
      const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
      const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
      const totalElevation = activities.reduce((sum, a) => sum + a.elevation_gain, 0);
      const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0);
      
      // Activity type breakdown
      const typeBreakdown: Record<string, { count: number; distance: number; time: number }> = {};
      activities.forEach(a => {
        if (!typeBreakdown[a.type]) {
          typeBreakdown[a.type] = { count: 0, distance: 0, time: 0 };
        }
        typeBreakdown[a.type].count++;
        typeBreakdown[a.type].distance += a.distance / 1000;
        typeBreakdown[a.type].time += a.moving_time;
      });
      
      doc.setTextColor(0, 0, 0);
      
      // Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Хураангуй', 14, 55);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        ['Нийт дасгал', activities.length.toString()],
        ['Нийт зай', `${totalDistance.toFixed(1)} км`],
        ['Нийт хугацаа', `${Math.floor(totalTime / 3600)}ц ${Math.floor((totalTime % 3600) / 60)}м`],
        ['Нийт өндөрлөг', `${totalElevation.toFixed(0)} м`],
        ['Нийт калори', totalCalories.toLocaleString()],
      ];
      
      autoTable(doc, {
        startY: 60,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 60 },
        },
        margin: { left: 14 },
      });
      
      // Activity Type Breakdown
      const typeTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Дасгалын задаргаа', 14, typeTableY);
      
      const typeData = Object.entries(typeBreakdown).map(([type, data]) => [
        type,
        data.count.toString(),
        `${data.distance.toFixed(1)} км`,
        `${Math.floor(data.time / 3600)}ц ${Math.floor((data.time % 3600) / 60)}м`,
      ]);
      
      autoTable(doc, {
        startY: typeTableY + 5,
        head: [['Дасгалын төрөл', 'Тоо', 'Зай', 'Хугацаа']],
        body: typeData,
        theme: 'striped',
        headStyles: { fillColor: [252, 76, 2], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });
      
      // Recent Activities Table
      doc.addPage();
      
      doc.setFillColor(252, 76, 2);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Сүүлийн дасгалууд', 14, 17);
      
      const recentActivities = activities.slice(0, 30).map(a => {
        const date = new Date(a.start_date).toLocaleDateString();
        const distance = `${(a.distance / 1000).toFixed(2)} км`;
        const duration = `${Math.floor(a.moving_time / 60)}:${(a.moving_time % 60).toString().padStart(2, '0')}`;
        const pace = a.average_speed > 0 && a.type === 'Run'
          ? `${Math.floor((1000 / a.average_speed) / 60)}:${Math.floor((1000 / a.average_speed) % 60).toString().padStart(2, '0')} /км`
          : '-';
        const elevation = `${a.elevation_gain.toFixed(0)} м`;
        
        return [date, a.name.slice(0, 25), a.type, distance, duration, pace, elevation];
      });
      
      autoTable(doc, {
        startY: 35,
        head: [['Огноо', 'Нэр', 'Төрөл', 'Зай', 'Хугацаа', 'Хурд', 'Өндөрлөг']],
        body: recentActivities,
        theme: 'striped',
        headStyles: { fillColor: [252, 76, 2], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 45 },
          2: { cellWidth: 20 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { cellWidth: 22 },
          6: { cellWidth: 22 },
        },
        margin: { left: 10, right: 10 },
      });
      
      // Personal Records Section (if we have running activities)
      const runActivities = activities.filter(a => a.type === 'Run');
      if (runActivities.length > 0) {
        const currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
        
        if (currentY < 250) {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Гүйлтийн рекордууд', 14, currentY);
          
          // Find PRs
          const longestRun = runActivities.reduce((max, a) => a.distance > max.distance ? a : max);
          const fastestPace = runActivities
            .filter(a => a.distance >= 1000) // At least 1km
            .reduce((min, a) => a.average_speed > min.average_speed ? a : min);
          const mostElevation = runActivities.reduce((max, a) => a.elevation_gain > max.elevation_gain ? a : max);
          
          const prData = [
            ['Хамгийн урт гүйлт', `${(longestRun.distance / 1000).toFixed(2)} км`, longestRun.name, new Date(longestRun.start_date).toLocaleDateString()],
            ['Хамгийн хурдан', `${Math.floor((1000 / fastestPace.average_speed) / 60)}:${Math.floor((1000 / fastestPace.average_speed) % 60).toString().padStart(2, '0')} /км`, fastestPace.name, new Date(fastestPace.start_date).toLocaleDateString()],
            ['Хамгийн их өндөрлөг', `${mostElevation.elevation_gain.toFixed(0)} м`, mostElevation.name, new Date(mostElevation.start_date).toLocaleDateString()],
          ];
          
          autoTable(doc, {
            startY: currentY + 5,
            head: [['Рекорд', 'Утга', 'Дасгал', 'Огноо']],
            body: prData,
            theme: 'striped',
            headStyles: { fillColor: [252, 76, 2], textColor: 255 },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 },
          });
        }
      }
      
      // Footer on all pages
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Хуудас ${i} / ${pageCount} | Дасгалын бүртгэл`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`training-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating || activities.length === 0}
      className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors px-4 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>{generating ? 'PDF үүсгэж байна...' : 'Дасгалын тайлан татах (PDF)'}</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </button>
  );
}
