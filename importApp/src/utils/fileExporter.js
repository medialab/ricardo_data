import XLSX from 'xlsx';
import {
  csvFormatRows,
} from 'd3-dsv';

import FileSaver from 'file-saver';

export function downloadFile ( array, fileName, ext) {
  let file;
  const header = array[0]
  switch(ext) {
    case 'csv': {
      const csvString = csvFormatRows(array)
      file = new File(
        [csvString],
        fileName,
        { type: 'text/csv;charset=utf-8' }
      )
      FileSaver.saveAs(file)
      break
    }
    case 'xlsx':
    default: {
      const sheet = XLSX.utils.aoa_to_sheet(array, {header});
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'SheetJS');
      XLSX.writeFile(wb, fileName);
      break
    }
  }
}
