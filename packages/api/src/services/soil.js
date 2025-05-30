/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (crop_data.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import axios from 'axios';
import csv from 'csvtojson';
import SoilAnalysisReport from '../models/soilAnalysisReportModel.js';
import SoilAnalysisSample from '../models/soilAnalysisSampleModel.js';
import Location from '../models/locationModel.js';
import SoilAnalyte from '../models/soilAnalyteModel.js';
import SoilAnalysisResult from '../models/soilAnalysisResultModel.js';

const CELL_PARSERS = {
  field_name: async (value, farm_id) => {
    const [field] = await Location.query().where({
      farm_id,
      name: value,
    });
    return field ? { location_id: field.location_id } : {};
  },
  sample_id: (value) => {
    return { external_id: value };
  },
  sampling_date: (value) => {
    return { date_collected: value };
  },
  depth_range: (value) => {
    const depth_range = value ? value.split('-') : null;
    return {
      depths: depth_range ? { from: Number(depth_range[0]), to: Number(depth_range[1]) } : null,
    };
  },
};

const insertReport = async (document_id) => {
  const report = await SoilAnalysisReport.transaction(async (trx) => {
    return await SoilAnalysisReport.query(trx).upsertGraph(
      { document_id, status: 'PENDING' },
      { noUpdate: true, noDelete: true },
    );
  });
  return report;
};

const updateReportStatus = async (id, status, error) => {
  await SoilAnalysisReport.transaction(async (trx) => {
    return await SoilAnalysisReport.query(trx)
      .findById(id)
      .patch({ status, error_message: error || null });
  });
};

const insertSample = async (json, report_id, farm_id) => {
  const sample_data = { report_id };
  for (const key in json) {
    if (CELL_PARSERS[key]) {
      const parsedValue = await CELL_PARSERS[key](json[key], farm_id);
      Object.assign(sample_data, parsedValue);
      delete json[key];
    }
  }
  const sample = await SoilAnalysisSample.transaction(async (trx) => {
    const result = await SoilAnalysisSample.query(trx).upsertGraph(sample_data, {
      noUpdate: true,
      noDelete: true,
    });
    return result;
  });
  return sample;
};

const insertResults = async (json, sample_id) => {
  for (const key in json) {
    const [analyte_name, unit] = key.split('_');
    const existing_analytes = await SoilAnalyte.query().where({
      key: analyte_name,
    });
    let analyte = existing_analytes[0];

    if (!analyte) {
      analyte = await SoilAnalysisSample.transaction(async (trx) => {
        const result = await SoilAnalyte.query(trx).upsertGraph(
          { key: analyte_name },
          { noUpdate: false, noDelete: true },
        );
        return result;
      });
    }

    await SoilAnalysisResult.transaction(async (trx) => {
      await SoilAnalysisResult.query(trx).upsertGraph({
        sample_id,
        analyte_id: analyte.id,
        value: isNaN(json[key]) ? 0 : Number(json[key]),
        unit: unit || 'unknown',
      });
    });
  }
};

const onSuccess = (report_id) => updateReportStatus(report_id, 'COMPLETED');
const onError = async (report_id, error) =>
  await updateReportStatus(report_id, 'FAILED', error.message);

const parseFile = async (document, report) => {
  const file = document.files?.[0];
  const response = await axios.get(file.url, { responseType: 'stream' });
  const stream = response.data;
  let err;

  await csv({ delimiter: 'auto' })
    .fromStream(stream)
    .subscribe(
      async (json) => {
        try {
          const sample = await insertSample(json, report.id, document.farm_id);
          await insertResults(json, sample.id);
        } catch (error) {
          console.error(error);
          err = error;
          await onError(report.id, error);
        }
      },
      (error) => {
        onError(report.id, error);
      },
      () => {
        if (!err) {
          onSuccess(report.id);
        }
      },
    );
};

export const parseSoilAnalysisDocument = async (document) => {
  try {
    const report = await insertReport(document.document_id);
    await parseFile(document, report);
  } catch (error) {
    console.error(error);
  }
};
