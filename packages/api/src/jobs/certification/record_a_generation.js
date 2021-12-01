const XlsxPopulate = require('xlsx-populate');
const i18n = require('../locales/i18n');

const dataToCellMapping = {
  name: 'A',
  crops: 'B',
  area: 'E',
  isNew: 'F',
  isTransitional: 'G',
  isOrganic: 'H',
  isNonOrganic: 'I',
  isNonProducing: 'J',
};

module.exports = (data, exportId, from_date, to_date, farm_name, measurement) => {
  return XlsxPopulate.fromBlankAsync()
    .then((workbook) => {
      const defaultStyles = {
        verticalAlignment: 'bottom',
        fontFamily: 'Calibri',
        fill: 'F2F2F2',
        fontSize: 11,
        border: {
          color: '000000',
          style: 'thin',
        },
        wrapText: true,
      };
      const RichText = XlsxPopulate.RichText;

      const { t } = i18n;

      const lastLineNumber = 6 + data.length;

      workbook.sheet(0).range(`A1:L${5}`).style(defaultStyles);
      workbook.sheet(0).range('C4:E5').style({ ...defaultStyles, fill: 'D9D9D9', verticalAlignment: 'center' });
      workbook.sheet(0).range('C4:E4').style({ ...defaultStyles, fill: 'D9D9D9', horizontalAlignment: 'center' });


      workbook.sheet(0).range('A1:L1').merged(true).style({ ...defaultStyles, fontSize: 14, bold: true });
      workbook.sheet(0).range('B2:J2').merged(true);
      workbook.sheet(0).range('A3:L3').merged(true);
      workbook.sheet(0).range('A4:B4').merged(true);
      workbook.sheet(0).range('C4:E4').merged(true);
      workbook.sheet(0).range('F4:K4').merged(true);
      workbook.sheet(0).range('A5:B5').style({
        ...defaultStyles,
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
      });
      workbook.sheet(0).cell('L5').style({
        ...defaultStyles,
        horizontalAlignment: 'left',
        verticalAlignment: 'center',
      });
      workbook.sheet(0).range(`F5:K5`).style({ ...defaultStyles, textRotation: 90 });
      workbook.sheet(0).range(`A6:L${lastLineNumber}`).style({ ...defaultStyles, fill: undefined, border: false });

      workbook.sheet(0).range(`C6:E${lastLineNumber}`).style({
        ...defaultStyles,
        horizontalAlignment: 'right',
        numberFormat: '0.00',
        fill: undefined,
        border: false,
      });
      workbook.sheet(0).range(`C${lastLineNumber}:E${lastLineNumber}`).style({
        ...defaultStyles,
        horizontalAlignment: 'right',
        fill: 'D9D9D9',
      });


      workbook.sheet(0).cell('A1').value(t('RECORD_A.HEADER'));
      workbook.sheet(0).cell('A2').value(`${t('RECORD_A.OPERATION_NAME')}:`);
      workbook.sheet(0).cell('B2').value(farm_name);

      workbook.sheet(0).cell('K2').value(`${t('RECORD_A.REPORTING_PERIOD')}:`);
      workbook.sheet(0).cell('L2').value(getDateRangeText(from_date, to_date));
      workbook.sheet(0).cell('A3').value(t('RECORD_A.PLEASE_VERIFY'));
      workbook.sheet(0).cell('C4').value(t('RECORD_A.SIZE_IN_PREFERRED_UNIT'));
      workbook.sheet(0).cell('F4').value(t('RECORD_A.CURRENT_STATUS'));
      const a5Text = new RichText().add(`${t('RECORD_A.NAME_OR_ID')}`, { bold: true })
        .add(' ')
        .add(t('RECORD_A.INDIVIDUAL_PRODUCTION_UNIT'));
      workbook.sheet(0).cell('A5').value(a5Text);
      workbook.sheet(0).cell('B5').value(t('RECORD_A.CROPS_OR_ANIMALS'));
      workbook.sheet(0).cell('C5').value(measurement === 'imperial' ? t('RECORD_A.ACRES') : t('RECORD_A.HECTARES'));
      workbook.sheet(0).cell('D5').value(measurement === 'imperial' ? t('RECORD_A.ROW_FT') : t('RECORD_A.ROW_M'));
      workbook.sheet(0).cell('E5').value(measurement === 'imperial' ? t('RECORD_A.SQ_FT') : t('RECORD_A.SQ_M'));
      const f5Text = new RichText().add(`${t('RECORD_A.NEW')} `, { bold: true })
        .add(t('RECORD_A.NEW_AREA'));
      workbook.sheet(0).cell('F5').value(f5Text);
      const g5Text = new RichText().add(`${t('RECORD_A.TRANSITIONAL')} `, { bold: true })
        .add(t('RECORD_A.AREA'));
      workbook.sheet(0).cell('G5').value(g5Text);
      const h5Text = new RichText().add(`${t('RECORD_A.CERTIFIED')} `, { bold: true })
        .add(t('RECORD_A.ORGANIC_AREA'));
      workbook.sheet(0).cell('H5').value(h5Text);
      const i5Text = new RichText().add(`${t('RECORD_A.NON_ORGANIC')} `)
        .add(`${t('RECORD_A.SPLIT')} `, { bold: true })
        .add(t('RECORD_A.PRODUCTION'));
      workbook.sheet(0).cell('I5').value(i5Text);
      const j5Text = new RichText().add(`${t('RECORD_A.NON_PRODUCING')} `, { bold: true })
        .add(t('RECORD_A.BUILDING'));
      workbook.sheet(0).cell('J5').value(j5Text);
      workbook.sheet(0).cell('K5').value(t('RECORD_A.REMOVED'));
      workbook.sheet(0).cell('L5').value(t('RECORD_A.WHY_REMOVED'));
      workbook.sheet(0).cell(`C${lastLineNumber}`).formula(`=SUM(C6:C${lastLineNumber - 1})`);
      workbook.sheet(0).cell(`D${lastLineNumber}`).formula(`=SUM(D6:D${lastLineNumber - 1})`);
      workbook.sheet(0).cell(`E${lastLineNumber}`).formula(`=SUM(E6:E${lastLineNumber - 1})`);

      workbook.sheet(0).column('A').width(28);
      workbook.sheet(0).column('B').width(28);
      workbook.sheet(0).column('C').width(12);
      workbook.sheet(0).column('D').width(12);
      workbook.sheet(0).column('E').width(16);
      workbook.sheet(0).column('F').width(8);
      workbook.sheet(0).column('G').width(8);
      workbook.sheet(0).column('H').width(8);
      workbook.sheet(0).column('I').width(8);
      workbook.sheet(0).column('J').width(10);
      workbook.sheet(0).column('K').width(8);
      workbook.sheet(0).column('L').width(20);


      workbook.sheet(0).row(1).height(30);
      workbook.sheet(0).row(2).height(24);
      workbook.sheet(0).row(3).height(36);
      workbook.sheet(0).row(4).height(32);
      workbook.sheet(0).row(5).height(144);

      const getArea = (area, measurement) => (area * (measurement === 'imperial' ? 10.76391 : 1));

      data.sort((firstRow, secondRow) => firstRow.name > secondRow.name ? 1 : -1)
        .map((row, index) => {
          row.crops = row.crops.map(crop_translation_key => t(`crop:${crop_translation_key}`)).sort().join(', ');
          row.area = row.area ? getArea(row.area, measurement) : null;
          const rowN = index + 6;
          Object.keys(row).map((k) => {
            const cell = `${dataToCellMapping[k]}${rowN}`;
            const value = row[k];
            workbook.sheet(0).cell(cell).value(value);
          });
        });
      return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/iCertify-RecordA.xlsx`);
    });
};

const getDateRangeText = (from_date, to_date) => {
  const from = from_date?.split('T').shift();
  const to = to_date?.split('T').shift();
  return from === to ? from : `${from} - ${to}`;
};
