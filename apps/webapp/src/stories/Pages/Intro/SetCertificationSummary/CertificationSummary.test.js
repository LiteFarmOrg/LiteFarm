import { getOrganicSurveyReqBody } from '../../../../containers/OrganicCertifierSurvey/SetCertificationSummary/utils/getOrganicSurveyReqBody';

describe('getOrganicSurveyReqBody test', () => {
  test('Should get supported organic certifier', () => {
    const listOfFormData = [
      {
        certification_id: 1,
        certifier_id: 9,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
      {
        certification_id: 1,
        certifier_id: 9,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certification: '345',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
    ];
    const expected = {
      certification_id: 1,
      certifier_id: 9,
      farm_id: undefined,
      interested: true,
      requested_certification: null,
      requested_certifier: null,
      survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
    };
    for (const formData of listOfFormData) {
      expect(getOrganicSurveyReqBody(formData)).toEqual(expected);
    }
  });

  test('Should get requested organic certifier', () => {
    const listOfFormData = [
      {
        certification_id: 1,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
      {
        certification_id: 1,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certification: '345',
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
    ];
    const expected = {
      certification_id: 1,
      certifier_id: null,
      farm_id: undefined,
      interested: true,
      requested_certification: null,
      requested_certifier: 'test',
      survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
    };
    for (const formData of listOfFormData) {
      expect(getOrganicSurveyReqBody(formData)).toEqual(expected);
    }
  });

  test('Should get unsupported certification PGS', () => {
    const listOfFormData = [
      {
        certification_id: 2,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
      {
        certification_id: 2,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certification: '345',
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
    ];
    const expected = {
      certification_id: 2,
      certifier_id: null,
      farm_id: undefined,
      interested: true,
      requested_certification: null,
      requested_certifier: 'test',
      survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
    };
    for (const formData of listOfFormData) {
      expect(getOrganicSurveyReqBody(formData)).toEqual(expected);
    }
  });

  test('Should get other certification', () => {
    const listOfFormData = [
      {
        certification_id: 0,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: true,
        requested_certification: 'test',
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
    ];
    const expected = {
      certification_id: null,
      certifier_id: null,
      farm_id: undefined,
      interested: true,
      requested_certification: 'test',
      requested_certifier: 'test',
      survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
    };
    for (const formData of listOfFormData) {
      expect(getOrganicSurveyReqBody(formData)).toEqual(expected);
    }
  });

  test('Should get uninterested', () => {
    const listOfFormData = [
      {
        certification_id: 0,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: false,
        requested_certification: 'test',
        requested_certifier: 'test',
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
      {
        certification_id: 1,
        certifier_id: 9,
        farm_id: '8f96ca50-5ce3-11eb-8eb1-0b45a4dc4124',
        interested: false,
        survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
      },
    ];
    const expected = {
      certification_id: null,
      certifier_id: null,
      farm_id: undefined,
      interested: false,
      requested_certification: null,
      requested_certifier: null,
      survey_id: 'a99e5b36-5d1d-11eb-8eb1-0b45a4dc4124',
    };
    for (const formData of listOfFormData) {
      expect(getOrganicSurveyReqBody(formData)).toEqual(expected);
    }
  });
});
