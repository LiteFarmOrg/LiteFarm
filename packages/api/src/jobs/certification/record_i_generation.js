const XlsxPopulate = require('xlsx-populate');
const boolToStringTransformation = (bool) => bool ? 'Y' : bool !== null ? 'N' : 'N/A';
const dataToCellMapping = {
  name: 'A',
  supplier: 'B',
  quantity: 'C',
  date: 'D',
  crop_location: 'E',
  on_permitted_substances_list: 'G',
}
const dataTransformsMapping = {
  on_permitted_substances_list: boolToStringTransformation,
  genetically_engineered: boolToStringTransformation,
}

module.exports = (data, farm_id, from_date, to_date, farm_name, isInputs) => {
  return XlsxPopulate.fromBlankAsync()
    .then((workbook) => {
      const defaultStyles = {
        verticalAlignment: 'center',
        fontFamily: 'Calibri',
        fill: 'F2F2F2',
      }

      workbook.sheet(0).range('A1:G1').style({
        bold: true,
        fontSize: 20,
        fill: 'F2F2F2'
      });
      // workbook.sheet(0).range('A6:G9').style({
      //   fill: 'F2F2F2',
      // });

      workbook.sheet(0).range('A1:G1').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A2:G2').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A3:G3').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A4:G4').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A5:G5').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A6:G6').style({ ...defaultStyles, fill: 'D9D9D9', ...getBlackBorder('bottom')  });
      workbook.sheet(0).range('A7:G7').style({ ...defaultStyles, fill: 'D9D9D9', ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A8:G8').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A9:G9').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('A10:G10').style({ ...defaultStyles, ...getBlackBorder('bottom') });
      workbook.sheet(0).range('G1:G9').style({ ...getBlackBorder('right') });
      workbook.sheet(0).range('A10:G10').style({ ...defaultStyles, wrapText: true, bold: true,
        border: {
          color: '000000',
          style: 'thin',
        },
        horizontalAlignment: 'center'
      });

      const title = isInputs ? 'INPUTS' : 'CLEANERS';
      const RichText = XlsxPopulate.RichText;
      const rowFour = new RichText();
      const rowFive = new RichText();
      const rowSix = new RichText();
      const rowSeven = new RichText();
      const rowEight = new RichText();
      const rowNine = new RichText();
      rowFour.add('List ALL Inputs used in the last 12 months or since your last submitted Record I.   You may choose to use this document to keep a running record of inputs used throughout the season.', { bold: true })
      rowFive.add('Please use a separate Input Record for each category of input as described below and upload each in the corresponding upload location of Section 99 - Uploads:', { bold: true })
      rowSix.add('1. Soil Amendments, crop nutrition, crop production aids and materials: eg.', { bold: true }).add('as mulches, fertilizers, foliar sprays, compost, manure, potting soil mixes or components, peat moss, soil amendments etc.')
      rowSeven.add('2.  Cleaners, disinfectants, sanitizers, facility pest management substances', { bold: true });
      rowEight.add('Note: Preparation Inputs:  Food additives, Other ingredients, Processing aids are to be listed on Record PM - Processing Master Ingredients and processing aids list.', { bold: true });
      rowNine.add('Note: Livestock Inputs: Feed, feed additives and feed supplements, health care products and production aids, animal bedding etc.  are to be listed on Record LI-Livestock Inputs', { bold: true });
      workbook.sheet(0).cell('A1').value(`Record I- ${title}`);
      workbook.sheet(0).cell('A2').value('OPERATION NAME');
      workbook.sheet(0).cell('B2').value(farm_name);
      workbook.sheet(0).cell('E2').value('REPORTING PERIOD: ');
      workbook.sheet(0).cell('F2').value(from_date + ' - ' + to_date);
      workbook.sheet(0).cell('A3').value('Input Category');
      workbook.sheet(0).cell('B3').value('Both');
      workbook.sheet(0).cell('A4').value(rowFour).style({ wrapText: false });
      workbook.sheet(0).cell('A5').value(rowFive).style({ wrapText: false });
      workbook.sheet(0).cell('A6').value(rowSix).style({ wrapText: false });
      workbook.sheet(0).cell('A7').value(rowSeven).style({ wrapText: false });
      workbook.sheet(0).cell('A8').value(rowEight).style({ wrapText: false });
      workbook.sheet(0).cell('A9').value(rowNine).style({ wrapText: false });
      workbook.sheet(0).cell('A10').value('Product name');
      workbook.sheet(0).cell('B10').value('Brand Name or Source/Supplier');
      workbook.sheet(0).cell('C10').value('Quantity');
      workbook.sheet(0).cell('D10').value('Date Used');
      workbook.sheet(0).cell('E10').value('Crop / Field Applied to or Production Unit used in');
      workbook.sheet(0).cell('F10').value('Notes');
      workbook.sheet(0).cell('G10').value('Listed in the PSL? (Y/N)');
      workbook.sheet(0).column('A').width(31);
      workbook.sheet(0).column('B').width(34);
      workbook.sheet(0).column('C').width(19);
      workbook.sheet(0).column('D').width(15);
      workbook.sheet(0).column('E').width(33);
      workbook.sheet(0).column('F').width(35);
      workbook.sheet(0).column('G').width(11);
      workbook.sheet(0).row(2).height(23);
      workbook.sheet(0).row(3).height(23);
      workbook.sheet(0).row(4).height(23);
      workbook.sheet(0).row(5).height(23);
      workbook.sheet(0).row(6).height(23);
      workbook.sheet(0).row(7).height(23);
      workbook.sheet(0).row(8).height(23);
      workbook.sheet(0).row(9).height(23);
      workbook.sheet(0).row(10).height(35);
      data.map((row, i) => {
        const rowN = i + 11;
        Object.keys(row).map((k) => {
          const cell = `${dataToCellMapping[k]}${rowN}`;
          const value = dataTransformsMapping[k] ? dataTransformsMapping[k](row[k]) : row[k];
          workbook.sheet(0).cell(cell).value(value);
        })
      })
      return workbook.toFileAsync(`${process.env.EXPORT_WD}/iCertify-RecordI-${title}.xlsx`);
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
