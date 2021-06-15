const DocumentModel = require('../models/documentModel');

const documentController = {
  getDocumentsByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await DocumentModel.query().whereNotDeleted().withGraphFetched('[file]').where({ farm_id });
        return result?.length ? res.status(200).send(result) : res.status(404).send('No documents found');
      } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
      }
    };
  },
  createDocument() {
    return async (req, res, next) => {
      try {
        const result = await DocumentModel.query().context(req.user).insert(req.body);
        return res.status(201).json(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
};
module.exports = documentController;
