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

      const RichText = XlsxPopulate.RichText;
      const rowFive = new RichText();
      const rowSix = new RichText();
      const rowSeven = new RichText();
      const rowEight = new RichText();
      rowFive.add('1. Soil Amendments, crop nutrition, crop production aids and materials: eg.', { bold: true }).add('as mulches, fertilizers, foliar sprays, compost, manure, potting soil mixes or components, peat moss, soil amendments etc.')
      rowSix.add('2.  Cleaners, disinfectants, sanitizers, facility pest management substances', { bold: true });
      rowSeven.add('Note: Preparation Inputs:  Food additives, Other ingredients, Processing aids are to be listed on Record PM - Processing Master Ingredients and processing aids list.', { bold: true });
      rowEight.add('Note: Livestock Inputs: Feed, feed additives and feed supplements, health care products and production aids, animal bedding etc.  are to be listed on Record LI-Livestock Inputs', { bold: true });
      workbook.sheet(0).cell('A1').value('Record I- INPUTS');
      workbook.sheet(0).cell('A2').value('OPERATION NAME');
      workbook.sheet(0).cell('B2').value(farm_name);
      workbook.sheet(0).cell('E2').value('REPORTING PERIOD: ');
      workbook.sheet(0).cell('F2').value(from_date + ' - ' + to_date);
      workbook.sheet(0).cell('A3').value('Input Category');
      workbook.sheet(0).cell('B3').value('Both');
      workbook.sheet(0).cell('A4').value('List ALL Inputs used in the last 12 months or since your last submitted Record I.   You may choose to use this document to keep a running record of inputs used throughout the season. \n Please use a separate Input Record for each category of input as described below and upload each in the corresponding upload location of Section 99 - Uploads:');
      workbook.sheet(0).cell('A5').value(rowFive).style({ wrapText: false });
      workbook.sheet(0).cell('A6').value(rowSix).style({ wrapText: false });
      workbook.sheet(0).cell('A7').value(rowSeven).style({ wrapText: false });
      workbook.sheet(0).cell('A8').value(rowEight).style({ wrapText: false });
      workbook.sheet(0).cell('A9').value('Product name');
      workbook.sheet(0).cell('B9').value('Brand Name or Source/Supplier');
      workbook.sheet(0).cell('C9').value('Quantity');
      workbook.sheet(0).cell('D9').value('Date Used');
      workbook.sheet(0).cell('E9').value('Crop / Field Applied to or Production Unit used in');
      workbook.sheet(0).cell('F9').value('Notes');
      workbook.sheet(0).cell('G9').value('Listed in the PSL? (Y/N)');
      workbook.sheet(0).column('A').width(25);
      workbook.sheet(0).column('B').width(25);
      workbook.sheet(0).column('C').width(15);
      workbook.sheet(0).column('D').width(15);
      workbook.sheet(0).column('E').width(15);
      workbook.sheet(0).column('F').width(25);
      workbook.sheet(0).column('G').width(15);
      workbook.sheet(0).row(2).height(23);
      workbook.sheet(0).row(3).height(23);
      workbook.sheet(0).row(4).height(23);
      workbook.sheet(0).row(5).height(23);
      workbook.sheet(0).row(6).height(30);
      workbook.sheet(0).row(9).height(75);
      data.map((row, i) => {
        const rowN = i + 11;
        Object.keys(row).map((k) => {
          const cell = `${dataToCellMapping[k]}${rowN}`;
          const value = dataTransformsMapping[k] ? dataTransformsMapping[k](row[k]) : row[k];
          workbook.sheet(0).cell(cell).value(value);
        })
      })
      return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${farm_id}/iCertify-RecordI.xlsx`);
    })
}

function getBlackBorder(direction) {
  return {
    [`${direction}Border`] : {
      color: '000000',
      style: 'thin',
    },
  }
}
