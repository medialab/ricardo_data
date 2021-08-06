import XLSX from "xlsx";

import FileSaver from "file-saver";
import { unparse } from "papaparse";

export function downloadFlow(array, fileName, ext) {
  let file;
  const header = array[0];
  switch (ext) {
    case "csv":
    default: {
      const csvString = unparse(array) + "\r\n";
      file = new File([csvString], `${fileName}.${ext}`, {
        type: "text/csv;charset=utf-8",
      });
      FileSaver.saveAs(file);
      break;
    }
    case "xlsx": {
      const sheet = XLSX.utils.aoa_to_sheet(array, { header });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "SheetJS");
      XLSX.writeFile(wb, `${fileName}.${ext}`);
      break;
    }
  }
}

export function downloadTable(array, fileName, ext) {
  let file;
  switch (ext) {
    case "csv":
    default: {
      const csvString = unparse(array) + "\r\n";
      file = new File([csvString], `${fileName}.${ext}`, {
        type: "text/csv;charset=utf-8",
      });
      FileSaver.saveAs(file);
      break;
    }
  }
}
