import XlsxPopulate from 'xlsx-populate';
import { i18n, t, tCrop } from '../locales/i18nt';
const boolToStringTransformation = (bool) =>
  bool ? i18n.t('Y') : bool !== null ? i18n.t('N') : i18n.t('N/A');
const blankTransformation = () => '';
const dataToCellMapping = {
  crop_variety: 'A',
  supplier: 'B',
  organic: 'D',
  searched: 'E',
  treated: 'F',
  treated_doc: 'G',
  genetically_engineered: 'H',
};

// the following i18n calls exist for the i18n parser to pick up the strings
i18n.t('YES');
i18n.t('NO');
i18n.t('NOT_SURE');
const treatedTransformation = (str) => {
  if (str) return i18n.t(str);
  else return '';
};
const dataTransformsMapping = {
  organic: boolToStringTransformation,
  searched: boolToStringTransformation,
  treated: treatedTransformation,
  treated_doc: blankTransformation,
  genetically_engineered: blankTransformation,
};

export default (data, exportId, from_date, to_date, farm_name) => {
  return XlsxPopulate.fromBlankAsync().then((workbook) => {
    const defaultStyles = {
      verticalAlignment: 'center',
      fontFamily: 'Calibri',
      fill: 'F2F2F2',
    };
    const RichText = XlsxPopulate.RichText;
    const rowSix = new RichText();
    const rowSeven = new RichText();
    const rowEight = new RichText();
    const rowNine = new RichText();
    const reportDate = new Date().toISOString().split('T')[0];

    rowSix
      .add(`2. ${t('RECORD_D.NOTE.TWO.PART_1')}`)
      .add(` ${t('RECORD_D.NOTE.TWO.PART_2')}`, { bold: true })
      .add(` ${t('RECORD_D.NOTE.TWO.PART_3')}:`);
    rowSeven.add(`     A.  ${t('RECORD_D.NOTE.TWO.A')}`);
    rowEight.add(`     B.  ${t('RECORD_D.NOTE.TWO.B')}`);
    rowNine.add(`     C.  ${t('RECORD_D.NOTE.TWO.C')}`);
    workbook.sheet(0).cell('A1').value(t('RECORD_D.HEADER'));
    workbook.sheet(0).range('A1:I1').style({
      bold: true,
      fontSize: 20,
      fill: 'F2F2F2',
    });
    workbook.sheet(0).range('A6:I9').style({
      fill: 'F2F2F2',
    });

    workbook
      .sheet(0)
      .range('A1:I1')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('A2:I2')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('A3:I3')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('A4:I4')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('A5:I5')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('A6:I6')
      .style({ ...defaultStyles, ...getBlackBorder('top') });
    workbook
      .sheet(0)
      .range('A9:I9')
      .style({ ...defaultStyles, ...getBlackBorder('bottom') });
    workbook
      .sheet(0)
      .range('I1:I10')
      .style({ ...defaultStyles, ...getBlackBorder('right') });
    workbook
      .sheet(0)
      .range('A10:I10')
      .style({
        ...defaultStyles,
        wrapText: true,
        bold: true,
        border: {
          color: '000000',
          style: 'thin',
        },
        horizontalAlignment: 'center',
      });

    workbook.sheet(0).cell('A2').value(t('OPERATION_NAME'));
    workbook.sheet(0).cell('B2').value(farm_name);
    workbook
      .sheet(0)
      .cell('F2')
      .value(`${t('RECORD_D.DATE_COMPLETED')}: `);
    workbook.sheet(0).cell('H2').value(reportDate);
    workbook.sheet(0).cell('A3').value(t('RECORD_D.REPORTING_PERIOD'));
    workbook
      .sheet(0)
      .cell('B3')
      .value(`${t('RECORD_D.FROM')}: `);
    workbook.sheet(0).cell('C3').value(from_date);
    workbook
      .sheet(0)
      .cell('D3')
      .value(`${t('RECORD_D.TO')}: `);
    workbook.sheet(0).cell('E3').value(to_date);
    workbook.sheet(0).cell('A4').value(t('RECORD_D.NOTE.LIST_ALL'));
    workbook
      .sheet(0)
      .cell('A5')
      .value(`1. ${t('RECORD_D.NOTE.ONE')}`);
    workbook.sheet(0).cell('A6').value(rowSix).style({ wrapText: false });
    workbook.sheet(0).cell('A7').value(rowSeven).style({ wrapText: false });
    workbook.sheet(0).cell('A8').value(rowEight).style({ wrapText: false });
    workbook.sheet(0).cell('A9').value(rowNine).style({ wrapText: false });
    workbook.sheet(0).cell('A10').value(t('RECORD_D.TABLE_COLUMN.SEED_CROP_OR_PLANTING_STOCK'));
    workbook.sheet(0).cell('B10').value(t('RECORD_D.TABLE_COLUMN.SUPPLIER'));
    workbook.sheet(0).cell('C10').value(t('RECORD_D.TABLE_COLUMN.LOT_NUMBER'));
    workbook.sheet(0).cell('D10').value(t('RECORD_D.TABLE_COLUMN.STATUS_CERTIFIED_ORGANIC'));
    workbook.sheet(0).cell('E10').value(t('RECORD_D.TABLE_COLUMN.IS_SEARCH_COMPLETED'));
    workbook.sheet(0).cell('F10').value(t('RECORD_D.TABLE_COLUMN.LIST_SEED_TREATMENTS'));
    workbook.sheet(0).cell('G10').value(t('RECORD_D.TABLE_COLUMN.TREATMENT_DOCS_AVAILABLE'));
    workbook.sheet(0).cell('H10').value(t('RECORD_D.TABLE_COLUMN.NON_GE_DOCS_AVAILABLE'));
    workbook.sheet(0).cell('I10').value(t('RECORD_D.TABLE_COLUMN.NOTES'));
    workbook.sheet(0).column('A').width(25);
    workbook.sheet(0).column('B').width(25);
    workbook.sheet(0).column('C').width(15);
    workbook.sheet(0).column('D').width(15);
    workbook.sheet(0).column('E').width(19);
    workbook.sheet(0).column('F').width(20);
    workbook.sheet(0).column('G').width(15);
    workbook.sheet(0).column('H').width(15);
    workbook.sheet(0).column('I').width(25);
    workbook.sheet(0).row(2).height(23);
    workbook.sheet(0).row(3).height(23);
    workbook.sheet(0).row(4).height(23);
    workbook.sheet(0).row(5).height(23);
    workbook.sheet(0).row(6).height(30);
    workbook.sheet(0).row(10).height(88);

    data.map((row, index) => {
      const rowN = index + 11;

      // set crop_variety text
      row.crop_variety = `${row.crop_variety_name} (${tCrop(row.crop_translation_key)})`;
      delete row.crop_variety_name;
      delete row.crop_translation_key;

      Object.keys(row).map((k) => {
        const cell = `${dataToCellMapping[k]}${rowN}`;
        const value = dataTransformsMapping[k] ? dataTransformsMapping[k](row[k]) : row[k];
        workbook.sheet(0).cell(cell).value(value);
      });
    });
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Record D.xlsx`);
  });
};

function getBlackBorder(direction) {
  return {
    [`${direction}Border`]: {
      color: '000000',
      style: 'thin',
    },
  };
}
