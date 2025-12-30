import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vote, VoteRecord } from './types';

interface GeneratePDFOptions {
  vote: Vote;
  records: VoteRecord[];
}

export async function generateVoteReportPDF({ vote, records }: GeneratePDFOptions): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const navyDark: [number, number, number] = [15, 23, 42];
  const navyMedium: [number, number, number] = [30, 41, 59];
  const goldColor: [number, number, number] = [212, 168, 83];
  const goldLight: [number, number, number] = [251, 243, 219];
  const grayLight: [number, number, number] = [248, 250, 252];
  const grayMedium: [number, number, number] = [100, 116, 139];
  const greenColor: [number, number, number] = [34, 197, 94];
  const blueColor: [number, number, number] = [59, 130, 246];

  // Calculate statistics
  const totalVotes = records.length;
  const optionsWithVotes = vote.options.map(option => ({
    ...option,
    actualVotes: records.filter(r => r.optionId === option.id).length
  }));
  const sortedOptions = [...optionsWithVotes].sort((a, b) => b.actualVotes - a.actualVotes);
  const winningOption = sortedOptions[0];

  // Country statistics
  const countryStats: { [key: string]: number } = {};
  records.forEach(record => {
    const country = record.voterInfo.pays || 'Non specifie';
    countryStats[country] = (countryStats[country] || 0) + 1;
  });
  const sortedCountries = Object.entries(countryStats).sort((a, b) => b[1] - a[1]);

  // ==================== HEADER ====================
  // Navy gradient background
  doc.setFillColor(...navyDark);
  doc.rect(0, 0, pageWidth, 52, 'F');

  // Decorative gold accent line
  doc.setFillColor(...goldColor);
  doc.rect(0, 52, pageWidth, 3, 'F');

  // Decorative element - subtle pattern
  doc.setFillColor(...navyMedium);
  doc.circle(pageWidth - 10, 0, 25, 'F');
  doc.circle(pageWidth + 5, 30, 15, 'F');

  // Logo circle with gold border
  doc.setFillColor(...goldColor);
  doc.circle(28, 26, 15, 'F');
  doc.setFillColor(...navyDark);
  doc.circle(28, 26, 12, 'F');
  doc.setTextColor(...goldColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('R', 24, 30);

  // Title and subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RAMPI', 50, 24);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...goldColor);
  doc.text('Rapport Officiel de Vote', 50, 33);

  // Date badge
  doc.setFillColor(...navyMedium);
  const dateText = `${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  const dateWidth = doc.getTextWidth(dateText) + 16;
  doc.roundedRect(pageWidth - dateWidth - 15, 18, dateWidth, 18, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(dateText, pageWidth - 15, 29, { align: 'right' });

  // ==================== VOTE TITLE SECTION ====================
  let yPos = 68;

  // Vote title with icon
  doc.setFillColor(...navyDark);
  doc.circle(22, yPos - 2, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('V', 20, yPos);

  doc.setTextColor(...navyDark);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(vote.title, 32, yPos);

  yPos += 8;

  // Description
  if (vote.description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayMedium);
    const descLines = doc.splitTextToSize(vote.description, pageWidth - 50);
    doc.text(descLines, 32, yPos);
    yPos += descLines.length * 5 + 8;
  } else {
    yPos += 5;
  }

  // ==================== INFO CARDS ====================
  const cardWidth = (pageWidth - 45) / 3;
  const cardHeight = 28;
  const cardY = yPos;

  // Card 1: Period
  doc.setFillColor(...grayLight);
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...blueColor);
  doc.roundedRect(15, cardY, 4, cardHeight, 2, 2, 'F');

  doc.setTextColor(...blueColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PERIODE DU VOTE', 24, cardY + 8);
  doc.setTextColor(...navyDark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Du ${new Date(vote.startDate).toLocaleDateString('fr-FR')}`, 24, cardY + 16);
  doc.text(`Au ${new Date(vote.endDate).toLocaleDateString('fr-FR')}`, 24, cardY + 23);

  // Card 2: Total votes
  doc.setFillColor(...grayLight);
  doc.roundedRect(20 + cardWidth, cardY, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...greenColor);
  doc.roundedRect(20 + cardWidth, cardY, 4, cardHeight, 2, 2, 'F');

  doc.setTextColor(...greenColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DES VOTES', 29 + cardWidth, cardY + 8);
  doc.setTextColor(...navyDark);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(totalVotes.toString(), 29 + cardWidth, cardY + 22);

  // Card 3: Winner
  doc.setFillColor(...grayLight);
  doc.roundedRect(25 + cardWidth * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...goldColor);
  doc.roundedRect(25 + cardWidth * 2, cardY, 4, cardHeight, 2, 2, 'F');

  doc.setTextColor(...goldColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OPTION GAGNANTE', 34 + cardWidth * 2, cardY + 8);
  doc.setTextColor(...navyDark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  if (totalVotes > 0) {
    const winnerText = winningOption.label.length > 15 ? winningOption.label.substring(0, 15) + '...' : winningOption.label;
    doc.text(winnerText, 34 + cardWidth * 2, cardY + 17);
    const winPercentage = ((winningOption.actualVotes / totalVotes) * 100).toFixed(1);
    doc.setTextColor(...goldColor);
    doc.setFontSize(9);
    doc.text(`${winPercentage}% des votes`, 34 + cardWidth * 2, cardY + 24);
  } else {
    doc.text('Aucun vote', 34 + cardWidth * 2, cardY + 18);
  }

  yPos = cardY + cardHeight + 15;

  // ==================== RESULTS SECTION ====================
  // Section header with gold accent
  doc.setFillColor(...goldColor);
  doc.roundedRect(15, yPos, 4, 20, 2, 2, 'F');

  doc.setTextColor(...navyDark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultats detailles', 24, yPos + 6);

  doc.setTextColor(...grayMedium);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Repartition des votes par option', 24, yPos + 14);

  yPos += 25;

  // Results with progress bars
  sortedOptions.forEach((option, index) => {
    const percentage = totalVotes > 0 ? (option.actualVotes / totalVotes) * 100 : 0;
    const barWidth = pageWidth - 80;
    const isWinner = index === 0 && totalVotes > 0;

    // Option label
    doc.setTextColor(...navyDark);
    doc.setFontSize(10);
    doc.setFont('helvetica', isWinner ? 'bold' : 'normal');
    doc.text(option.label, 20, yPos);

    // Votes count and percentage on the right
    doc.setTextColor(...grayMedium);
    doc.setFontSize(9);
    doc.text(`${option.actualVotes} vote${option.actualVotes !== 1 ? 's' : ''}`, pageWidth - 45, yPos, { align: 'right' });

    if (isWinner) {
      doc.setTextColor(...goldColor);
    } else {
      doc.setTextColor(...navyDark);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${percentage.toFixed(1)}%`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 5;

    // Progress bar background
    doc.setFillColor(...grayLight);
    doc.roundedRect(20, yPos, barWidth, 6, 3, 3, 'F');

    // Progress bar fill
    if (percentage > 0) {
      if (isWinner) {
        doc.setFillColor(...goldColor);
      } else {
        doc.setFillColor(...navyMedium);
      }
      doc.roundedRect(20, yPos, Math.max((barWidth * percentage) / 100, 6), 6, 3, 3, 'F');
    }

    // Winner star indicator
    if (isWinner && totalVotes > 0) {
      doc.setFillColor(...goldColor);
      doc.circle(15, yPos + 3, 3, 'F');
    }

    yPos += 14;
  });

  yPos += 5;

  // ==================== COUNTRY STATISTICS ====================
  if (sortedCountries.length > 0 && yPos < 200) {
    doc.setFillColor(...blueColor);
    doc.roundedRect(15, yPos, 4, 20, 2, 2, 'F');

    doc.setTextColor(...navyDark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Repartition par pays', 24, yPos + 6);

    doc.setTextColor(...grayMedium);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sortedCountries.length} pays represente${sortedCountries.length > 1 ? 's' : ''}`, 24, yPos + 14);

    yPos += 25;

    // Country mini cards (top 6)
    const displayCountries = sortedCountries.slice(0, 6);
    const countryCardWidth = (pageWidth - 40) / 3;

    displayCountries.forEach((country, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 15 + col * (countryCardWidth + 5);
      const y = yPos + row * 18;

      doc.setFillColor(...grayLight);
      doc.roundedRect(x, y, countryCardWidth, 14, 3, 3, 'F');

      doc.setTextColor(...navyDark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const countryName = country[0].length > 12 ? country[0].substring(0, 12) + '...' : country[0];
      doc.text(countryName, x + 4, y + 9);

      doc.setTextColor(...blueColor);
      doc.text(country[1].toString(), x + countryCardWidth - 4, y + 9, { align: 'right' });
    });

    yPos += Math.ceil(displayCountries.length / 3) * 18 + 10;
  }

  // ==================== VOTERS LIST ====================
  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 25;
  }

  doc.setFillColor(...greenColor);
  doc.roundedRect(15, yPos, 4, 20, 2, 2, 'F');

  doc.setTextColor(...navyDark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Liste des votants', 24, yPos + 6);

  doc.setTextColor(...grayMedium);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${records.length} participant${records.length !== 1 ? 's' : ''} enregistre${records.length !== 1 ? 's' : ''}`, 24, yPos + 14);

  yPos += 25;

  if (records.length === 0) {
    doc.setFillColor(...grayLight);
    doc.roundedRect(15, yPos, pageWidth - 30, 30, 4, 4, 'F');
    doc.setTextColor(...grayMedium);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun vote enregistre pour le moment.', pageWidth / 2, yPos + 18, { align: 'center' });
  } else {
    // Voters table with improved design
    const votersData = records.map((record, index) => {
      const votedDate = new Date(record.votedAt);
      const dateStr = votedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      const timeStr = votedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      return [
        (index + 1).toString(),
        `${record.voterInfo.prenom} ${record.voterInfo.nom}`,
        record.voterInfo.email,
        record.voterInfo.telephone || '-',
        record.voterInfo.pays || '-',
        record.optionLabel,
        `${dateStr} ${timeStr}`
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Nom complet', 'Email', 'Telephone', 'Pays', 'Vote', 'Date/Heure']],
      body: votersData,
      theme: 'plain',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: navyDark,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: grayLight
      },
      margin: { left: 15, right: 15, bottom: 30 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 28 },
        2: { cellWidth: 40 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 28, fontStyle: 'bold' },
        6: { cellWidth: 24, halign: 'center' }
      }
    });
  }

  // ==================== FOOTER ON ALL PAGES ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer background
    doc.setFillColor(...navyDark);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    // Gold accent line
    doc.setFillColor(...goldColor);
    doc.rect(0, pageHeight - 20, pageWidth, 1, 'F');

    // Logo in footer
    doc.setFillColor(...goldColor);
    doc.circle(22, pageHeight - 10, 5, 'F');
    doc.setTextColor(...navyDark);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('R', 20, pageHeight - 8);

    // Footer text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('RAMPI - Reseau Africain des Magistrats de Propriete Intellectuelle', 32, pageHeight - 8);

    // Page number badge
    doc.setFillColor(...navyMedium);
    const pageText = `${i} / ${pageCount}`;
    doc.roundedRect(pageWidth - 30, pageHeight - 15, 20, 10, 3, 3, 'F');
    doc.setTextColor(...goldColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(pageText, pageWidth - 20, pageHeight - 8, { align: 'center' });
  }

  // ==================== SAVE PDF ====================
  const sanitizedTitle = vote.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `RAMPI_Rapport_${sanitizedTitle}_${dateStr}.pdf`;

  doc.save(filename);
}
