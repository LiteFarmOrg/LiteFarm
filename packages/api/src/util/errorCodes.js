export async function handleObjectionError(err, res, trx) {
  switch (err.name) {
    case 'ValidationError': {
      await trx.rollback();
      const errorString = Object.keys(err.data).reduce((acc, cv, ci) => {
        const comma = Object.keys(err.data).length - 1 == ci ? '' : ', ';
        return acc.concat(`${cv} ${err.data[cv][0].message}${comma}`);
      }, '');
      return res.status(err.statusCode).send(`Validation error: ${errorString}`);
    }
    case 'CheckViolationError': {
      await trx.rollback();
      return res.status(400).send(`Constraint check error: ${err.constraint}`);
    }
    case 'ForeignKeyViolationError': {
      await trx.rollback();
      return res.status(400).send(`Foreign key violation: ${err.nativeError.detail}`);
    }
    default: {
      console.error(err);
      await trx.rollback();
      return res.status(500).json({
        err,
      });
    }
  }
}
