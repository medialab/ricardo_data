
import XLSX from 'xlsx';
import {
  csvParse,
  csvParseRows,
  tsvParse,
} from 'd3-dsv';

export function parseTable( file ) {
  return new Promise( ( resolve, reject ) => {
    let reader = new FileReader();
    reader.onload = ( event ) => {
      let data;
      if (file.name.split('.')[1] === 'csv') {
        data = csvParseRows(event.target.result);
      }
      else {
        data = tsvParse(event.target.result);
      }
      resolve(data);
      reader = undefined;
    };
    reader.onerror = ( event ) => {
      reject( event.target.error );
      reader = undefined;
    };
    return reader.readAsText( file );
  } );
}

export function parseSheet( file ) {
  return new Promise( (resolve, reject) => {
    let reader = new FileReader();
    // Handle errors loadrABS
    reader.onload = ( event ) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, {type: 'binary'});
			// Get first worksheet
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			// Convert to "2D Array"
      const data = XLSX.utils.sheet_to_json(ws, {
        header: 1, 
        defval: '', // set null and undefined to empty string for validation
        blankrows: false // skip blank rows
      });
      resolve(data)
      reader = undefined;
    };
    reader.onerror = ( event ) => {
      reject( event.target.error );
      reader = undefined;
    };
    // Read file into memory as UTF-8
    reader.readAsBinaryString( file );
  })
}