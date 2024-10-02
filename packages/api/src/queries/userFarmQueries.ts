import db from '../db.js';
import { FarmId, UserId } from '../types.js';

export const getPermissions = (farmId: FarmId, userId: UserId, checkConsent = true) => {
  let query = db
    .selectFrom('userFarm as uf')
    .innerJoin('rolePermissions as rp', 'uf.role_id', 'rp.role_id')
    .innerJoin('permissions as p', 'p.permission_id', 'rp.permission_id')
    .select(['p.name', 'uf.role_id'])
    .distinct()
    .where('uf.farm_id', '=', farmId)
    .where('uf.user_id', '=', userId)
    .where('uf.status', '=', 'Active');

  if (checkConsent) query = query.where('uf.has_consent', '=', true);
  return query.execute();
};
