/*
 *  Copyright 2024 LiteFarm.org
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

CREATE VIEW animal_union_batch_id_view AS
SELECT
  *,
  ROW_NUMBER() OVER (PARTITION BY farm_id ORDER BY created_at, id, batch)::INTEGER AS internal_identifier
FROM (
  SELECT
    id,
    farm_id,
    FALSE AS batch,
    created_at
  FROM
    animal a

  UNION ALL

  SELECT
    id,
    farm_id,
    TRUE AS batch,
    created_at
  FROM
    animal_batch ab
) animal_union_batch_id_view
ORDER BY
  created_at, id, batch;
