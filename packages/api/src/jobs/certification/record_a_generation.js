import XlsxPopulate from 'xlsx-populate';
import { i18n, t, tCrop } from '../locales/i18nt.js';

export default (data, exportId, from_date, to_date, farm_name, measurement) => {
  return XlsxPopulate.fromBlankAsync().then((workbook) => {
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

    const gray85 = 'D9D9D9';
    const gray95 = 'F2F2F2';

    const defaultStyles = {
      verticalAlignment: 'bottom',
      fontFamily: 'Calibri',
      fill: gray95,
      fontSize: 11,
      border: {
        color: '000000',
        style: 'thin',
      },
      wrapText: true,
    };
    const RichText = XlsxPopulate.RichText;

    const NON_DATA_ROW_COUNT = 6;
    const lastLineNumber = NON_DATA_ROW_COUNT + data.length;

    const imperialOrMetric = (imperial, metric) => (measurement === 'imperial' ? imperial : metric);

    const sheet = workbook.sheet(0);

    sheet.range('A1:L5').style(defaultStyles);
    sheet.range('C4:E5').style({ ...defaultStyles, fill: gray85, verticalAlignment: 'center' });
    sheet.range('C4:E4').style({ ...defaultStyles, fill: gray85, horizontalAlignment: 'center' });

    sheet
      .range('A1:L1')
      .merged(true)
      .style({ ...defaultStyles, fontSize: 14, bold: true });
    sheet.range('B2:J2').merged(true);
    sheet.range('A3:L3').merged(true);
    sheet.range('A4:B4').merged(true);
    sheet.range('C4:E4').merged(true);
    sheet.range('F4:K4').merged(true);
    sheet.range('A5:B5').style({
      ...defaultStyles,
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
    });
    sheet.cell('L5').style({
      ...defaultStyles,
      horizontalAlignment: 'left',
      verticalAlignment: 'center',
    });
    sheet.range('F5:K5').style({ ...defaultStyles, textRotation: 90 });
    sheet
      .range(`A6:L${lastLineNumber}`)
      .style({ ...defaultStyles, fill: undefined, border: false });

    sheet.range(`C6:E${lastLineNumber}`).style({
      ...defaultStyles,
      horizontalAlignment: 'right',
      numberFormat: '0.00',
      fill: undefined,
      border: false,
    });
    sheet.range(`C${lastLineNumber}:E${lastLineNumber}`).style({
      ...defaultStyles,
      horizontalAlignment: 'right',
      fill: gray85,
    });

    sheet.cell('A1').value(t('RECORD_A.HEADER'));
    sheet.cell('A2').value(`${t('RECORD_A.OPERATION_NAME')}:`);
    sheet.cell('B2').value(farm_name);

    sheet.cell('K2').value(`${t('RECORD_A.REPORTING_PERIOD')}:`);
    sheet.cell('L2').value(getDateRangeText(from_date, to_date));
    sheet.cell('A3').value(t('RECORD_A.PLEASE_VERIFY'));
    sheet.cell('C4').value(t('RECORD_A.SIZE_IN_PREFERRED_UNIT'));
    sheet.cell('F4').value(t('RECORD_A.CURRENT_STATUS'));

    // Rich text cell fragments with leading spaces are explicitly encoded to indicate that spacing must be preserved.
    // Fragments without leading spaces are not so encoded, so spreadsheet apps differ on preserving their trailing spaces.
    const a5Text = new RichText()
      .add(t('RECORD_A.NAME_OR_ID'), { bold: true })
      .add(` ${t('RECORD_A.INDIVIDUAL_PRODUCTION_UNIT')}`);
    sheet.cell('A5').value(a5Text);

    sheet.cell('B5').value(t('RECORD_A.CROPS_OR_ANIMALS'));
    sheet.cell('C5').value(imperialOrMetric(t('RECORD_A.ACRES'), t('RECORD_A.HECTARES')));
    sheet.cell('D5').value(imperialOrMetric(t('RECORD_A.ROW_FT'), t('RECORD_A.ROW_M')));
    sheet.cell('E5').value(imperialOrMetric(t('RECORD_A.SQ_FT'), t('RECORD_A.SQ_M')));

    const f5Text = new RichText()
      .add(t('RECORD_A.NEW'), { bold: true })
      .add(` ${t('RECORD_A.NEW_AREA')}`);
    sheet.cell('F5').value(f5Text);

    const g5Text =
      i18n.language === 'en'
        ? new RichText()
            .add(t('RECORD_A.TRANSITIONAL'), { bold: true })
            .add(` ${t('RECORD_A.AREA')}`)
        : new RichText().add(t('RECORD_A.AREA')).add(` ${t('RECORD_A.TRANSITIONAL')}`, {
            bold: true,
          });
    sheet.cell('G5').value(g5Text);

    const h5Text =
      i18n.language === 'en'
        ? new RichText()
            .add(t('RECORD_A.CERTIFIED'), { bold: true })
            .add(` ${t('RECORD_A.ORGANIC_AREA')}`)
        : new RichText()
            .add(t('RECORD_A.ORGANIC_AREA'))
            .add(` ${t('RECORD_A.CERTIFIED')}`, { bold: true });
    sheet.cell('H5').value(h5Text);

    const i5Text =
      i18n.language === 'en'
        ? new RichText()
            .add(t('RECORD_A.NON_ORGANIC'))
            .add(` ${t('RECORD_A.SPLIT')}`, { bold: true })
            .add(` ${t('RECORD_A.PRODUCTION')}`)
        : new RichText()
            .add(t('RECORD_A.NON_ORGANIC'))
            .add(` ${t('RECORD_A.PRODUCTION')}`)
            .add(` ${t('RECORD_A.SPLIT')}`, { bold: true });
    sheet.cell('I5').value(i5Text);

    const j5Text = new RichText()
      .add(t('RECORD_A.NON_PRODUCING'), { bold: true })
      .add(` ${t('RECORD_A.BUILDING')}`);
    sheet.cell('J5').value(j5Text);

    sheet.cell('K5').value(t('RECORD_A.REMOVED'));
    sheet.cell('L5').value(t('RECORD_A.WHY_REMOVED'));
    sheet.cell(`C${lastLineNumber}`).formula(`SUM(C6:C${lastLineNumber - 1})`);
    sheet.cell(`D${lastLineNumber}`).formula(`SUM(D6:D${lastLineNumber - 1})`);
    sheet.cell(`E${lastLineNumber}`).formula(`SUM(E6:E${lastLineNumber - 1})`);

    sheet.column('A').width(28);
    sheet.column('B').width(28);
    sheet.column('C').width(12);
    sheet.column('D').width(12);
    sheet.column('E').width(16);
    sheet.column('F').width(8);
    sheet.column('G').width(8);
    sheet.column('H').width(8);
    sheet.column('I').width(8);
    sheet.column('J').width(10);
    sheet.column('K').width(12);
    sheet.column('L').width(24);

    sheet.row(1).height(30);
    sheet.row(2).height(28);
    sheet.row(3).height(36);
    sheet.row(4).height(32);
    sheet.row(5).height(144);

    const getArea = (area) => area * imperialOrMetric(10.76391, 1);

    data
      .sort((firstRow, secondRow) => {
        if (!firstRow.location_id && secondRow.location_id) {
          return 1;
        } else if (!secondRow.location_id && firstRow.location_id) {
          return -1;
        }
        return firstRow.name > secondRow.name ? 1 : -1;
      })
      .map((row, index) => {
        row.crops = row.crops
          .map((crop_translation_key) => tCrop(crop_translation_key))
          .sort()
          .join(', ');
        row.area = row.area ? getArea(row.area) : null;
        const rowN = index + NON_DATA_ROW_COUNT;
        Object.keys(row).map((k) => {
          if (k === 'location_id') return;
          const cell = `${dataToCellMapping[k]}${rowN}`;
          const value = row[k];
          sheet.cell(cell).value(value);
        });
      });
    return workbook.toFileAsync(`${process.env.EXPORT_WD}/temp/${exportId}/Record A.xlsx`);
  });
};

const getDateRangeText = (from_date, to_date) => {
  const from = from_date?.split('T').shift();
  const to = to_date?.split('T').shift();
  return from === to ? from : `${from} - ${to}`;
};
