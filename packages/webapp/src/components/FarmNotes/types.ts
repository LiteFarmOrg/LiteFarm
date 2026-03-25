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

// Local type definition until LF-5214 (RTK Query API layer) merges and adds FarmNote to
// store/api/types/index.ts. At that point, update imports to point to that file.
export interface FarmNote {
  id: string;
  farm_id: string;
  user_id: string;
  note: string;
  is_private: boolean;
  image_url?: string;
  updated_at: string;
  to_sync?: boolean; // client-only flag for offline-queued notes
}
