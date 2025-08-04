import productModel from '../../models/productModel.js';
function createOrPatchProduct(taskType) {
  return async (req, res, next) => {
    try {
      const { user_id } = req.auth;
      if (req.body[taskType]) {
        if (req.body[taskType].product_id) {
          const { product, product_id } = req.body[taskType];
          await productModel.query().context({ user_id }).patch(product).where({ product_id });
          delete req.body[taskType].product;
        } else if (req.body[taskType].product) {
          const { product } = req.body[taskType];
          const { product_id } = await productModel
            .query()
            .context({ user_id })
            .insert({
              ...product,
              farm_id: req.headers.farm_id,
            })
            .returning('*');
          req.body[taskType].product_id = product_id;
          delete req.body[taskType].product;
        }
      }
      next();
    } catch (error) {
      console.log(error);

      if (error.type === 'LiteFarmCustom') {
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      }
      return res.status(400).send({ error });
    }
  };
}

export { createOrPatchProduct };
