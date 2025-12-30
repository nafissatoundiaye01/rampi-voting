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

  // Colors
  const navyColor: [number, number, number] = [15, 23, 42];
  const goldColor: [number, number, number] = [212, 168, 83];

  // Header background
  doc.setFillColor(...navyColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo placeholder (circle)
  doc.setFillColor(...goldColor);
  doc.circle(25, 22, 12, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RAMPI', 45, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport de Vote', 45, 28);

  // Date du rapport
  doc.setFontSize(9);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth - 15, 20, { align: 'right' });

  // Vote title section
  let yPos = 55;

  doc.setTextColor(...navyColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(vote.title, 15, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (vote.description) {
    const descLines = doc.splitTextToSize(vote.description, pageWidth - 30);
    doc.text(descLines, 15, yPos);
    yPos += descLines.length * 5 + 5;
  }

  // Vote info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...navyColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode du vote:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(vote.startDate).toLocaleDateString('fr-FR')} a ${vote.startTime || '00:00'} - ${new Date(vote.endDate).toLocaleDateString('fr-FR')} a ${vote.endTime || '23:59'}`, 55, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Total des votes:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const totalVotes = records.length;
  doc.text(`${totalVotes} vote${totalVotes !== 1 ? 's' : ''}`, 55, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Affichage resultats:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(vote.showResults ? 'Oui' : 'Non', 55, yPos);

  yPos += 15;

  // Results section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyColor);
  doc.text('Resultats du vote', 15, yPos);

  yPos += 8;

  // Results table - Calculate from actual records for accurate data
  const actualTotalVotes = records.length;
  const resultsData = vote.options.map(option => {
    const optionVotes = records.filter(r => r.optionId === option.id).length;
    const percentage = actualTotalVotes > 0 ? ((optionVotes / actualTotalVotes) * 100).toFixed(1) : '0.0';
    return [option.label, optionVotes.toString(), `${percentage}%`];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Option', 'Votes', 'Pourcentage']],
    body: resultsData,
    theme: 'striped',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: navyColor
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' }
    }
  });

  // Get the final Y position after the table
  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Check if we need a new page for voters list
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Voters list section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyColor);
  doc.text('Liste des votants', 15, yPos);

  yPos += 8;

  if (records.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Aucun vote enregistre pour le moment.', 15, yPos);
  } else {
    // Voters table
    const votersData = records.map((record, index) => {
      const votedDate = new Date(record.votedAt);
      const dateStr = votedDate.toLocaleDateString('fr-FR');
      const timeStr = votedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      return [
        (index + 1).toString(),
        `${record.voterInfo.prenom} ${record.voterInfo.nom}`,
        record.voterInfo.email,
        record.voterInfo.telephone,
        record.voterInfo.pays,
        record.optionLabel,
        `${dateStr} ${timeStr}`
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Nom complet', 'Email', 'Telephone', 'Pays', 'Vote', 'Date et Heure']],
      body: votersData,
      theme: 'striped',
      headStyles: {
        fillColor: navyColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7,
        textColor: navyColor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 38 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 28 },
        6: { cellWidth: 28, halign: 'center' }
      }
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Footer line
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('RAMPI - Reseau Africain des Magistrats de Propriete Intellectuelle', 15, pageHeight - 10);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }

  // Generate filename
  const sanitizedTitle = vote.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `RAMPI_Rapport_${sanitizedTitle}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);
}
