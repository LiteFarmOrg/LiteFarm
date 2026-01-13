/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTapeSurveyPrepopulatedData } from './useTapeSurveyPrepopulatedData';
import { saveSurveyProgress, completeSurvey, tapeSurveySelector } from './tapeSurveySlice';
import SurveyComponent from '../../../components/SurveyComponent';
import surveyJson from './tapeQuestions.json';
import PageTitle from '../../../components/PageTitle';
import { Button } from '@mui/material';

function TAPESurvey() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { prepopulatedData, isLoading } = useTapeSurveyPrepopulatedData();

  const { surveyData: savedData, currentPageNo: savedPageNo } = useSelector(tapeSurveySelector);

  const initialData = { ...prepopulatedData, ...savedData };

  const handleDataChange = useCallback((currentPageNo: number, surveyData: Record<string, any>) => {
    dispatch(saveSurveyProgress({ currentPageNo, surveyData }));
  }, []);

  const handleComplete = useCallback((currentPageNo: number, surveyData: any) => {
    dispatch(completeSurvey({ currentPageNo, surveyData }));
    history.push('/insights/tape/results');
  }, []);
  const acopy = structuredClone(surveyJson);
  acopy.pages.shift();
  const [copy, setCopy] = useState(acopy);
  const lengthofpages = surveyJson.pages.length;
  const [loadedSurvey, setLoadedSurvey] = useState(surveyJson);
  const handleChangeSurvey = () => {
    if (loadedSurvey.pages.length === lengthofpages) {
      console.log('hi');
      setLoadedSurvey(copy);
    } else {
      setLoadedSurvey(surveyJson);
    }
  };

  return (
    <>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <Button onClick={handleChangeSurvey} />
      {!isLoading && ( // wait for prepopulated data to load
        <SurveyComponent
          surveyJson={loadedSurvey}
          onComplete={handleComplete}
          onValueChanged={handleDataChange}
          initialData={initialData}
          initialPageNo={savedPageNo}
        />
      )}
    </>
  );
}

export default TAPESurvey;
