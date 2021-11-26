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

module.exports = (data, farm_id, from_date, to_date, farm_name, measurement) => {
  return XlsxPopulate.fromBlankAsync()
    .then((workbook) => {
      const defaultStyles = {
        verticalAlignment: 'center',
        fontFamily: 'Calibri',
        fill: 'F2F2F2',
        fontSize: 11,
      };
      const RichText = XlsxPopulate.RichText;

      const { t } = i18n;


      workbook.sheet(0).range('A1:L5').style(defaultStyles);
      workbook.sheet(0).range('C4:E5').style({ ...defaultStyles, fill: 'D9D9D9' });
      workbook.sheet(0).range('C4:E4').style({ ...defaultStyles, fill: 'D9D9D9', horizontalAlignment: 'center' });


      workbook.sheet(0).range('A1:L1').merged(true).style({ ...defaultStyles, fontSize: 14, bold: true });
      workbook.sheet(0).range('B2:J2').merged(true);
      workbook.sheet(0).range('A3:L3').merged(true);
      workbook.sheet(0).range('A4:B4').merged(true);
      workbook.sheet(0).range('C4:E4').merged(true);
      workbook.sheet(0).range('F4:K4').merged(true);
      workbook.sheet(0).range('A5:B5').style({ ...defaultStyles, horizontalAlignment: 'center' });


      workbook.sheet(0).cell('A1').value(t('RECORD_A.HEADER'));
      workbook.sheet(0).cell('A2').value(`${t('RECORD_A.OPERATION_NAME')}:`);
      workbook.sheet(0).cell('B2').value(farm_name);

      workbook.sheet(0).cell('K2').value(`${t('RECORD_A.YEAR')}:`);
      workbook.sheet(0).cell('L2').value(new Date().getFullYear());
      workbook.sheet(0).cell('A3').value(t('RECORD_A.PLEASE_VERIFY'));
      workbook.sheet(0).cell('C4').value(t('RECORD_A.SIZE_IN_PREFERRED_UNIT'));
      workbook.sheet(0).cell('F4').value(t('RECORD_A.CURRENT_STATUS'));
      const a5Text = new RichText().add(`${t('RECORD_A.NAME_OR_ID')} `, { bold: true })
        .add(t('RECORD_A.INDIVIDUAL_PRODUCTION_UNIT'));
      workbook.sheet(0).cell('A5').value(a5Text);
      workbook.sheet(0).cell('B5').value(t('RECORD_A.CROPS_OR_ANIMALS'));
      workbook.sheet(0).cell('C5').value(t('RECORD_A.ACRES'));
      workbook.sheet(0).cell('D5').value(t('RECORD_A.ROW_FT'));
      workbook.sheet(0).cell('E5').value(t('RECORD_A.SQ FT'));
      workbook.sheet(0).cell('F5').value(t('RECORD_A.NEW_AREA'));
      workbook.sheet(0).cell('G5').value(t('RECORD_A.TRANSITIONAL'));
      workbook.sheet(0).cell('H5').value(t('RECORD_A.ORGANIC'));
      workbook.sheet(0).cell('I5').value(t('RECORD_A.NON_ORGANIC'));
      workbook.sheet(0).cell('J5').value(t('RECORD_A.NON_PRODUCING'));
      workbook.sheet(0).cell('K5').value(t('RECORD_A.REMOVED'));
      workbook.sheet(0).cell('L5').value(t('RECORD_A.WHY_REMOVED'));


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
      const getArea = (area, measurement) => (area * (measurement === 'imperial' ? 10.76391 : 1))?.toFixed(2);

      data.map((row, index) => {
        row.crops = row.crops.map(crop_translation_key => t(`crop:${crop_translation_key}`)).join(', ');
        row.area = row.area ? getArea(row.area, measurement) : null;
        const rowN = index + 6;
        Object.keys(row).map((k) => {
          const cell = `${dataToCellMapping[k]}${rowN}`;
          const value = row[k];
          workbook.sheet(0).cell(cell).value(value);
        });
      });
      return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${farm_name}/iCertify-RecordA.xlsx`);
    });
};
