const conditionallyApplyMiddleware = (condition, middlewareIfCondition, middlewareOtherwise) =>
  (req, res, next) => condition ?
    middlewareIfCondition(req, res, next) :
    middlewareOtherwise(req, res, next);

module.exports = conditionallyApplyMiddleware;
