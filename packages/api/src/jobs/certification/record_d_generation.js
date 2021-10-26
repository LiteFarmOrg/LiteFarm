const XlsxPopulate = require('xlsx-populate');
const boolToStringTransformation = (bool) => bool ? 'Y' : bool !== null ? 'N' : 'N/A';
const treatmentDocTransformation = (str) => str.substr(0,1);
const dataToCellMapping = {
  crop_variety_name: 'A',
  supplier: 'B',
  organic: 'D',
  searched: 'E',
  treated: 'F',
  treated_doc: 'G',
  genetically_engineered: 'H',
}
const dataTransformsMapping = {
  organic: boolToStringTransformation,
  searched: boolToStringTransformation,
  treated_doc: treatmentDocTransformation,
  genetically_engineered: boolToStringTransformation,
}

module.exports = (data, farm_id, from_date, to_date, farm_name) => {
  return XlsxPopulate.fromBlankAsync()
    .then((workbook) => {
      const defaultStyles = {
        verticalAlignment: 'center',
        fontFamily: 'Calibri',
        fill: 'F2F2F2',
      }
      const RichText = XlsxPopulate.RichText;
      const rowSix = new RichText();
      const rowSeven = new RichText();
      const rowEight = new RichText();
      const rowNine = new RichText();
      const reportDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
      rowSix.add('2. Where ').add(' non-organic seed/stock ', { bold: true }).add('is used, the following documentation is required to be available at inspection:');
      rowSeven.add('     A.  Commercial Availability Search per COS 5.3- (Record D1 or equivalent)');
      rowEight.add('     B.  Documentation confirming non-GE status');
      rowNine.add('     C.  Documentation confirming that any treatments, such as inoculants or seed coatings are PSL compliant (note: NOP compliance is not sufficient)');
      workbook.sheet(0).cell('A1').value('Record D- Seed and Planting Stock');
      workbook.sheet(0).range('A1:I1').style({
        bold: true,
        fontSize: 20,
        fill: 'F2F2F2'
      });
      workbook.sheet(0).range('A6:I9').style({
        fill: 'F2F2F2',
      });

      workbook.sheet(0).range('A1:I1').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A2:I2').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A3:I3').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A4:I4').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A5:I5').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A6:I6').style({ ...defaultStyles, ...getBlackBorder('top') });
      workbook.sheet(0).range('A9:I9').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('I1:I10').style({ ...defaultStyles, ...getBlackBorder('right') });
      workbook.sheet(0).range('A10:I10').style({ ...defaultStyles, wrapText: true, bold: true,
        border: {
          color: '000000',
          style: 'thin',
        },
        horizontalAlignment: 'center'
      });

      workbook.sheet(0).cell('A2').value('OPERATION NAME');
      workbook.sheet(0).cell('B2').value(farm_name);
      workbook.sheet(0).cell('F2').value('Date Completed: ');
      workbook.sheet(0).cell('H2').value(reportDate);
      workbook.sheet(0).cell('A3').value('Reporting Period');
      workbook.sheet(0).cell('B3').value('From: ');
      workbook.sheet(0).cell('C3').value(from_date);
      workbook.sheet(0).cell('D3').value('To: ');
      workbook.sheet(0).cell('E3').value(to_date);
      workbook.sheet(0).cell('A4').value('List ALL seed and planting stock used during the reporting period.  Please note:');
      workbook.sheet(0).cell('A5').value('1. Ensure that purchase receipts, labels, tags and organic certificates for all seed/stock is available for review during inspection.');
      workbook.sheet(0).cell('A6').value(rowSix).style({ wrapText: false });
      workbook.sheet(0).cell('A7').value(rowSeven).style({ wrapText: false });
      workbook.sheet(0).cell('A8').value(rowEight).style({ wrapText: false });
      workbook.sheet(0).cell('A9').value(rowNine).style({ wrapText: false  });
      workbook.sheet(0).cell('A10').value('Seed Crop/Variety or Planting Stock');
      workbook.sheet(0).cell('B10').value('Source / Supplier');
      workbook.sheet(0).cell('C10').value('Lot # (where applicable)');
      workbook.sheet(0).cell('D10').value('Seed/Stock Status = Certified Organic (Y/N)');
      workbook.sheet(0).cell('E10').value('If Non-CO Seed/Stock, is a Search completed (Y/N)');
      workbook.sheet(0).cell('F10').value('List seed Treatments (If Any)');
      workbook.sheet(0).cell('G10').value('Treatment Documents available (Y/N)');
      workbook.sheet(0).cell('H10').value('Non-GE Documents available (Y/N)');
      workbook.sheet(0).cell('I10').value('Notes /Perennial planting dates / etc.');
      workbook.sheet(0).column('A').width(25);
      workbook.sheet(0).column('B').width(25);
      workbook.sheet(0).column('C').width(15);
      workbook.sheet(0).column('D').width(15);
      workbook.sheet(0).column('E').width(15);
      workbook.sheet(0).column('F').width(20);
      workbook.sheet(0).column('G').width(15);
      workbook.sheet(0).column('H').width(15);
      workbook.sheet(0).column('I').width(25);
      workbook.sheet(0).row(2).height(23);
      workbook.sheet(0).row(3).height(23);
      workbook.sheet(0).row(4).height(23);
      workbook.sheet(0).row(5).height(23);
      workbook.sheet(0).row(6).height(30);
      workbook.sheet(0).row(10).height(75);
      data.map((row, i) => {
        const rowN = i + 11;
        Object.keys(row).map((k) => {
          const cell = `${dataToCellMapping[k]}${rowN}`;
          const value = dataTransformsMapping[k] ? dataTransformsMapping[k](row[k]) : row[k];
          workbook.sheet(0).cell(cell).value(value);
        })
      })
      return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${farm_name}/iCertify-RecordD.xlsx`);
    })
}

function getBlackBorder(direction) {
  return {
    [`${direction}Border`] : {
      color: '000000',
      style: 'thin'
    },
  }
}
