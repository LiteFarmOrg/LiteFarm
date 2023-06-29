import { Model, AjvValidator } from 'objection';
import addFormats from 'ajv-formats';

class BaseFormatModel extends Model {
  // enable ajv formats to validate the date field (and others) when inserting in database
  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (ajv) => {
        addFormats(ajv);
      },
      options: {
        allErrors: true,
        validateSchema: true,
        ownProperties: true,
      },
    });
  }
}

export default BaseFormatModel;
