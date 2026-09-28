import fs from 'fs';

const xml = fs.readFileSync('temp_docx/word/document.xml', 'utf-8');

function cleanText(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseParagraph(pXml) {
  const styleMatch = pXml.match(/<w:pStyle\s+w:val="([^"]+)"/);
  const style = styleMatch ? styleMatch[1] : '';
  const isList = /<w:numPr>/.test(pXml);

  const runRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
  let pText = '';
  let rMatch;

  while ((rMatch = runRegex.exec(pXml)) !== null) {
    const runContent = rMatch[1];
    const isBold = /<w:b(\s|\/|>)/.test(runContent) && !/<w:b\s+w:val="0"/.test(runContent);
    const isItalic = /<w:i(\s|\/|>)/.test(runContent) && !/<w:i\s+w:val="0"/.test(runContent);

    const tRegex = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
    let textParts = [];
    let tMatch;
    while ((tMatch = tRegex.exec(runContent)) !== null) {
      textParts.push(tMatch[1]);
    }
    let text = textParts.join('');

    if (text) {
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      if (isBold && isItalic) {
        text = `***${text}***`;
      } else if (isBold) {
        text = `**${text}**`;
      } else if (isItalic) {
        text = `*${text}*`;
      }
      pText += text;
    }
  }

  pText = pText.trim();
  if (!pText) return '';

  if (style.includes('Heading1') || style === '1' || style === 'Title') {
    return `\n# ${pText}\n\n`;
  } else if (style.includes('Heading2') || style === '2' || style === 'Subtitle') {
    return `\n## ${pText}\n\n`;
  } else if (style.includes('Heading3') || style === '3') {
    return `\n### ${pText}\n\n`;
  } else if (style.includes('Heading4') || style === '4') {
    return `\n#### ${pText}\n\n`;
  } else if (isList) {
    return `- ${pText}\n`;
  } else {
    return `${pText}\n\n`;
  }
}

function parseTable(tblXml) {
  let md = '';
  // Match rows in this table. Note: to avoid issues with nested tables, we can extract text from each tc.
  const rowRegex = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g;
  let rowMatch;
  let tableRows = [];

  while ((rowMatch = rowRegex.exec(tblXml)) !== null) {
    const rowContent = rowMatch[1];
    const cellRegex = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g;
    let cellMatch;
    let cells = [];

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const cellContent = cellMatch[1];
      const tRegex = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
      let cellText = [];
      let tMatch;
      while ((tMatch = tRegex.exec(cellContent)) !== null) {
        cellText.push(tMatch[1]);
      }
      let cStr = cleanText(cellText.join(' '));
      cells.push(cStr);
    }
    if (cells.length > 0) {
      tableRows.push(cells);
    }
  }

  if (tableRows.length > 0) {
    const colCount = Math.max(...tableRows.map(r => r.length));
    tableRows.forEach((row, i) => {
      while (row.length < colCount) row.push('');
      md += `| ${row.join(' | ')} |\n`;
      if (i === 0) {
        md += `| ${Array(colCount).fill('---').join(' | ')} |\n`;
      }
    });
    md += '\n';
  }
  return md;
}

// Sequential body tokenizer with nesting depth
const bodyMatch = xml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
const body = bodyMatch ? bodyMatch[1] : '';

let pos = 0;
let output = '';

function findMatchingEndTable(startIndex) {
  let depth = 0;
  let i = startIndex;
  while (i < body.length) {
    const nextOpen = body.indexOf('<w:tbl', i);
    const nextClose = body.indexOf('</w:tbl>', i);

    if (nextClose === -1) return -1;

    // Check if open tag is actual <w:tbl> or <w:tbl ...>
    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Check if it's a real tbl tag
      const charAfter = body[nextOpen + 6];
      if (charAfter === '>' || charAfter === ' ' || charAfter === '\n' || charAfter === '\r' || charAfter === '\t') {
        depth++;
      }
      i = nextOpen + 6;
    } else {
      depth--;
      i = nextClose + 8;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

while (pos < body.length) {
  const matchP = body.slice(pos).search(/<w:p[\s>]/);
  const matchTbl = body.slice(pos).search(/<w:tbl[\s>]/);

  if (matchP === -1 && matchTbl === -1) {
    break;
  }

  const nextP = matchP !== -1 ? pos + matchP : -1;
  const nextTbl = matchTbl !== -1 ? pos + matchTbl : -1;

  if (nextTbl !== -1 && (nextP === -1 || nextTbl < nextP)) {
    // Table
    const endTbl = findMatchingEndTable(nextTbl);
    if (endTbl !== -1) {
      const tblXml = body.slice(nextTbl, endTbl);
      output += parseTable(tblXml);
      pos = endTbl;
    } else {
      pos = nextTbl + 6;
    }
  } else {
    // Paragraph
    const endP = body.indexOf('</w:p>', nextP);
    if (endP !== -1) {
      const pXml = body.slice(nextP, endP + 6);
      output += parseParagraph(pXml);
      pos = endP + 6;
    } else {
      pos = nextP + 4;
    }
  }
}

fs.writeFileSync('master.md', output, 'utf-8');
console.log('Saved COMPLETE master.md! Length:', output.length);
