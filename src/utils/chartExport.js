/**
 * Chart export utilities — PNG (via SVG → canvas) and CSV.
 * Works with Recharts' rendered SVG elements.
 */

/**
 * Export a Recharts chart container to PNG.
 * Finds the nearest SVG element within the wrapper and rasterizes it.
 */
export function exportChartPNG(wrapperEl, filename = 'chart.png') {
  if (!wrapperEl) return;
  const svg = wrapperEl.querySelector('svg');
  if (!svg) return;

  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(svg);

  // Ensure xmlns is present
  if (!svgStr.includes('xmlns')) {
    svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const width = svg.viewBox?.baseVal?.width || svg.clientWidth || 800;
  const height = svg.viewBox?.baseVal?.height || svg.clientHeight || 400;

  const img = new Image();
  const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
  const image64 = 'data:image/svg+xml;base64,' + svg64;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x for crisp export
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d1424';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };
  img.src = image64;
}

/**
 * Export an array of objects to CSV.
 */
export function exportCSV(data, filename = 'data.csv') {
  if (!Array.isArray(data) || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val == null) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    ),
  ];
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
