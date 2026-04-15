
import { jsPDF } from 'jspdf';
import { EventData } from '../types';

export type PDFLayout = '25_A5' | '50_A4';

export const generatePDF = async (event: EventData, layout: PDFLayout = '25_A5') => {
  const isA5 = layout === '25_A5';
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA5 ? 'a5' : 'a4'
  });

  const slotsPerPage = isA5 ? 25 : 50;
  const totalSlots = event.finalSeq - event.initialSeq + 1;
  const totalPages = Math.ceil(totalSlots / slotsPerPage);

  const margin = isA5 ? 7 : 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);
  
  // Cabeçalho ajustado
  let headerHeight = 0;
  if (isA5) {
    headerHeight = event.headerImage ? 45 : 55;
  } else {
    headerHeight = event.headerImage ? 60 : 75;
  }

  const spacing = isA5 ? 2 : 4;
  const gridStartY = margin + headerHeight + spacing;
  const gridHeight = pageHeight - margin - gridStartY - (isA5 ? 2 : 4);

  const gridCols = 5;
  const gridRows = isA5 ? 5 : 10;
  const cellWidth = contentWidth / gridCols;
  const cellHeight = gridHeight / gridRows;

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^\x20-\x7E]/g, "") 
      .trim();
  };

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage();

    if (event.headerImage) {
      // --- Caso exista imagem de cabeçalho ---
      try {
        doc.addImage(event.headerImage, 'JPEG', margin, margin, contentWidth, headerHeight, undefined, 'FAST');
      } catch (err) {
        console.error("Erro ao inserir imagem no PDF, revertendo para texto", err);
        drawFallbackHeader(doc, event, margin, contentWidth, headerHeight, isA5);
      }
    } else {
      // --- Caso não exista imagem (Fallback) ---
      drawFallbackHeader(doc, event, margin, contentWidth, headerHeight, isA5);
    }

    // --- Grade de Cartelas ---
    for (let i = 0; i < slotsPerPage; i++) {
      const slotNum = event.initialSeq + (p * slotsPerPage) + i;
      if (slotNum > event.finalSeq) break;

      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      const x = margin + (col * cellWidth);
      const y = gridStartY + (row * cellHeight);

      // Borda da Cartela
      doc.setDrawColor(210, 210, 220);
      doc.setLineWidth(0.05);
      doc.rect(x + 0.2, y + 0.2, cellWidth - 0.4, cellHeight - 0.4, 'S');

      // Número Centralizado
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(isA5 ? 24 : 20); 
      doc.setFont('helvetica', 'bold');
      const numStr = slotNum.toString();
      const numWidth = doc.getTextWidth(numStr);
      
      const numYOffset = isA5 ? 10 : 8;
      doc.text(numStr, x + (cellWidth / 2) - (numWidth / 2), y + numYOffset);

      // Campos de Preenchimento
      const labelFontSize = isA5 ? 6 : 5;
      doc.setFontSize(labelFontSize);
      doc.setFont('helvetica', 'bold');
      
      const nameY = y + (isA5 ? 16 : 13);
      const celY = y + (isA5 ? 20 : 16);
      
      doc.text("NOME:", x + 2, nameY);
      doc.text("CEL:", x + 2, celY);
      
      doc.setDrawColor(235, 235, 235);
      doc.setLineWidth(0.1);
      
      const lineStartName = x + (isA5 ? 10 : 9);
      const lineStartCel = x + (isA5 ? 8 : 7);
      
      doc.line(lineStartName, nameY, x + cellWidth - 2, nameY);
      doc.line(lineStartCel, celY, x + cellWidth - 2, celY);

      // Rodapé da Cartela
      const footerFontSize = isA5 ? 4.5 : 4;
      doc.setFontSize(footerFontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      
      const valY = y + cellHeight - (isA5 ? 4.5 : 3.5);
      const prizeY = y + cellHeight - (isA5 ? 2.5 : 2);
      
      doc.text(`Valor: R$ ${formatCurrency(event.value)}`, x + 2, valY);
      
      const prizeCartela = cleanText(event.prize);
      const prizeLinesCartela = doc.splitTextToSize(`Sorteio: ${prizeCartela}`, cellWidth - 4);
      doc.text(prizeLinesCartela, x + 2, prizeY);
    }

    // Rodapé da página
    doc.setFontSize(isA5 ? 5 : 6);
    doc.setTextColor(180, 180, 180);
    doc.text(`Pagina ${p + 1} de ${totalPages} | Layout: ${isA5 ? '25/A5' : '50/A4'} | Raffle Master`, margin, pageHeight - (isA5 ? 2 : 3));
  }

  doc.save(`RIFA-${cleanText(event.title).toUpperCase().replace(/\s+/g, '-')}-${layout}.pdf`);
};

function drawFallbackHeader(doc: jsPDF, event: EventData, margin: number, contentWidth: number, headerHeight: number, isA5: boolean) {
  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").trim();
  };

  // Fundo do Cabeçalho
  doc.setFillColor(255, 255, 255); 
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.1);
  doc.roundedRect(margin, margin, contentWidth, headerHeight, 2, 2, 'FD');
  
  // Título Centralizado
  const title = (cleanText(event.title).toUpperCase() || "SORTEIO");
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isA5 ? 16 : 20);
  const centerX = margin + (contentWidth / 2);
  doc.text(title, centerX, margin + (isA5 ? 10 : 12), { align: 'center' });
  
  // Linha de Destaque Centralizada
  doc.setDrawColor(79, 70, 229); // Indigo
  doc.setLineWidth(0.6);
  doc.line(centerX - 15, margin + (isA5 ? 12 : 14), centerX + 15, margin + (isA5 ? 12 : 14));

  // Espaço para Descrição
  const infoBoxHeight = isA5 ? 12 : 15;
  const infoBoxY = margin + headerHeight - infoBoxHeight - (isA5 ? 2 : 3);
  const descAreaTop = margin + (isA5 ? 15 : 18);
  const descAreaBottom = infoBoxY - 1;
  const descAreaHeight = descAreaBottom - descAreaTop;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(isA5 ? 8 : 9);
  doc.setTextColor(80, 80, 100);
  
  const descText = cleanText(event.description) || "Participe deste sorteio e concorra a premios incriveis.";
  const descLines = doc.splitTextToSize(descText, contentWidth - 10);
  
  const lineHeight = isA5 ? 4 : 4.5;
  const totalDescHeight = descLines.length * lineHeight;
  const descStartY = descAreaTop + (descAreaHeight / 2) - (totalDescHeight / 2) + (isA5 ? 2 : 3);

  doc.text(descLines, centerX, descStartY, { align: 'center', maxWidth: contentWidth - 10 });

  // Quadro de Informações (Info Box)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 2, infoBoxY, contentWidth - 4, infoBoxHeight, 1, 1, 'F');
  
  doc.setFontSize(isA5 ? 6 : 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const labelY = infoBoxY + (isA5 ? 4 : 5);
  const valueY = infoBoxY + (isA5 ? 9 : 11);

  // Colunas do Info Box
  const colWidth = (contentWidth - 4) / 4;

  const truncate = (text: string, width: number) => {
    if (doc.getTextWidth(text) <= width) return text;
    let t = text;
    while (t.length > 0 && doc.getTextWidth(t + '...') > width) {
      t = t.substring(0, t.length - 1);
    }
    return t + '...';
  };

  doc.text("LOCAL:", margin + 4, labelY);
  doc.setFont('helvetica', 'normal');
  doc.text(truncate(cleanText(event.location).toUpperCase() || "NAO INFORMADO", colWidth - 4), margin + 4, valueY);

  doc.setFont('helvetica', 'bold');
  doc.text("DATA:", margin + 4 + colWidth, labelY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(event.drawDate).toLocaleDateString(), margin + 4 + colWidth, valueY);

  doc.setFont('helvetica', 'bold');
  doc.text("VALOR:", margin + 4 + (colWidth * 2), labelY);
  doc.setTextColor(16, 185, 129); // Emerald Green
  doc.text(`R$ ${formatCurrency(event.value)}`, margin + 4 + (colWidth * 2), valueY);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text("PREMIO:", margin + 4 + (colWidth * 3), labelY);
  doc.setFont('helvetica', 'normal');
  const prizeText = cleanText(event.prize).toUpperCase() || "PREMIO SURPRESA";
  
  doc.text(truncate(prizeText, colWidth - 4), margin + 4 + (colWidth * 3), valueY);
}

