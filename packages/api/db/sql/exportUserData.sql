BEGIN;

-- Replace this with the actual user ID of the person you're exporting
-- For example: 'e9129627-6d87-462e-90c1-a55e463a1e14'
WITH
target_user AS (
  SELECT 'user_id_here'::TEXT AS user_id
),
single_user_farms AS (
  SELECT uf.farm_id
  FROM "userFarm" uf
  JOIN target_user tu ON uf.user_id = tu.user_id
  GROUP BY uf.farm_id
  HAVING COUNT(*) = 1
),
export_data AS (
  SELECT json_build_object(
    -- USER RELATED DATA
    'user', (
      SELECT row_to_json(u)
      FROM "users" u
      JOIN target_user tu ON u.user_id = tu.user_id
    ),
    'password', (
      SELECT json_agg(p)
      FROM "password" p
      JOIN target_user tu ON p.user_id = tu.user_id
    ),
    'userLog', (
      SELECT json_agg(ul)
      FROM "userLog" ul
      JOIN target_user tu ON ul.user_id = tu.user_id
    ),
    'showedSpotlight', (
      SELECT json_agg(ss)
      FROM "showedSpotlight" ss
      JOIN target_user tu ON ss.user_id = tu.user_id
    ),
    'releaseBadges', (
      SELECT json_agg(rb)
      FROM "release_badge" rb
      JOIN target_user tu ON rb.user_id = tu.user_id
    ),
    'supportTickets', (
      SELECT json_agg(st)
      FROM "supportTicket" st
      JOIN target_user tu ON st.created_by_user_id = tu.user_id
    ),
    'emailTokens', (
      SELECT json_agg(et)
      FROM "emailToken" et
      JOIN target_user tu ON et.user_id = tu.user_id
    ),
    
    -- FARM RELATED DATA
    'farms', (
      SELECT json_agg(
        json_build_object(
          'farm', f,
          'userFarm', (
            SELECT json_agg(uf)
            FROM "userFarm" uf
            WHERE uf.farm_id = f.farm_id
          ),
          
          -- TASKS AND RELATED DATA
          'taskTypes', (
            SELECT json_agg(tt)
            FROM "task_type" tt
            WHERE tt.farm_id = f.farm_id
          ),
          'tasksData', (
            WITH farm_tasks AS (
                -- Tasks associated via task_type
                SELECT t.task_id
                FROM "task" t
                JOIN "task_type" tt ON t.task_type_id = tt.task_type_id
                WHERE tt.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated via locations
                SELECT lt.task_id
                FROM "location_tasks" lt
                JOIN "location" l ON lt.location_id = l.location_id
                WHERE l.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated via management plans and crop varieties
                SELECT mt.task_id
                FROM "management_tasks" mt
                JOIN "planting_management_plan" pmp ON mt.planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated via transplant_task's planting_management_plan references
                SELECT tt.task_id
                FROM "transplant_task" tt
                JOIN "planting_management_plan" pmp ON tt.planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated via transplant_task's prev_planting_management_plan references
                SELECT tt.task_id
                FROM "transplant_task" tt
                JOIN "planting_management_plan" pmp ON tt.prev_planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated with animals
                SELECT tar.task_id
                FROM "task_animal_relationship" tar
                JOIN "animal" a ON tar.animal_id = a.id
                WHERE a.farm_id = f.farm_id
                
                UNION
                
                -- Tasks associated with animal batches
                SELECT tabr.task_id
                FROM "task_animal_batch_relationship" tabr
                JOIN "animal_batch" ab ON tabr.animal_batch_id = ab.id
                WHERE ab.farm_id = f.farm_id
            ),
            farm_task_ids AS (
                SELECT array_agg(task_id) AS ids FROM farm_tasks
            )
            SELECT json_build_object(
                'locationTasks', (
                SELECT json_agg(lt)
                FROM "location_tasks" lt
                JOIN "location"    l  ON lt.location_id = l.location_id
                WHERE l.farm_id = f.farm_id
                ),

                'taskDocuments', (
                SELECT json_agg(td)
                FROM "task_document" td
                WHERE td.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'animalMovementTaskPurposes', (
                SELECT json_agg(amtp)
                FROM "animal_movement_task_purpose_relationship" amtp
                WHERE amtp.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'taskAnimalRelationships', (
                SELECT json_agg(tar)
                FROM "task_animal_relationship" tar
                WHERE tar.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'taskAnimalBatchRelationships', (
                SELECT json_agg(tabr)
                FROM "task_animal_batch_relationship" tabr
                WHERE tabr.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'soilAmendmentTaskProductsPurposes', (
                SELECT json_agg(satpp)
                FROM "soil_amendment_task_products_purpose_relationship" satpp
                JOIN "soil_amendment_task_products" satp 
                    ON satpp.task_products_id = satp.id
                WHERE satp.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'soilAmendmentTaskProducts', (
                SELECT json_agg(satp)
                FROM "soil_amendment_task_products" satp
                WHERE satp.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'irrigationTypes', (
                SELECT json_agg(it)
                FROM "irrigation_type" it
                WHERE it.farm_id = f.farm_id
                ),

                'harvestUseTypes', (
                SELECT json_agg(hut)
                FROM "harvest_use_type" hut
                WHERE hut.farm_id = f.farm_id
                ),

                'fieldWorkTypes', (
                SELECT json_agg(fwt)
                FROM "field_work_type" fwt
                WHERE fwt.farm_id = f.farm_id
                ),

                -- SPECIALIZED TASK TYPES
                'fieldWorkTasks', (
                SELECT json_agg(fwt)
                FROM "field_work_task" fwt
                WHERE fwt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'harvestTasks', (
                SELECT json_agg(ht)
                FROM "harvest_task" ht
                WHERE ht.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'harvestUses', (
                SELECT json_agg(hu)
                FROM "harvest_use" hu
                WHERE hu.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'irrigationTasks', (
                SELECT json_agg(it)
                FROM "irrigation_task" it
                WHERE it.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'scoutingTasks', (
                SELECT json_agg(st)
                FROM "scouting_task" st
                WHERE st.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'pestControlTasks', (
                SELECT json_agg(pct)
                FROM "pest_control_task" pct
                WHERE pct.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'soilAmendmentTasks', (
                SELECT json_agg(sat)
                FROM "soil_amendment_task" sat
                WHERE sat.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'soilSampleTasks', (
                SELECT json_agg(sst)
                FROM "soil_sample_task" sst
                WHERE sst.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'cleaningTasks', (
                SELECT json_agg(ct)
                FROM "cleaning_task" ct
                WHERE ct.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'plantTasks', (
                SELECT json_agg(pt)
                FROM "plant_task" pt
                WHERE pt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'transplantTasks', (
                SELECT json_agg(tt)
                FROM "transplant_task" tt
                WHERE tt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'animalMovementTasks', (
                SELECT json_agg(amt)
                FROM "animal_movement_task" amt
                WHERE amt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                -- LEGACY TASK TYPES
                'soilTasks', (
                SELECT json_agg(st)
                FROM "soil_task" st
                WHERE st.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'maintenanceTasks', (
                SELECT json_agg(mt)
                FROM "maintenance_task" mt
                WHERE mt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'transportTasks', (
                SELECT json_agg(tt)
                FROM "transport_task" tt
                WHERE tt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'socialTasks', (
                SELECT json_agg(st)
                FROM "social_task" st
                WHERE st.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'saleTasks', (
                SELECT json_agg(st)
                FROM "sale_task" st
                WHERE st.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),

                'washAndPackTasks', (
                SELECT json_agg(wapt)
                FROM "wash_and_pack_task" wapt
                WHERE wapt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                ),
                
                'managementTasks', (
                SELECT json_agg(mt)
                FROM "management_tasks" mt
                WHERE mt.task_id IN (
                    SELECT unnest(ids)
                    FROM farm_task_ids
                )
                )
            )
          ),
          
          -- ANIMAL DATA
          'animalBatchGroupRelationships', (
            SELECT json_agg(abgr)
            FROM "animal_batch_group_relationship" abgr
            JOIN "animal_batch" ab ON abgr.animal_batch_id = ab.id
            WHERE ab.farm_id = f.farm_id
          ),
          'animalGroupRelationships', (
            SELECT json_agg(agr)
            FROM "animal_group_relationship" agr
            JOIN "animal" a ON agr.animal_id = a.id
            WHERE a.farm_id = f.farm_id
          ),
          'animalBatches', (
            SELECT json_agg(ab)
            FROM "animal_batch" ab
            WHERE ab.farm_id = f.farm_id
          ),
          'animals', (
            SELECT json_agg(a)
            FROM "animal" a
            WHERE a.farm_id = f.farm_id
          ),
          'customAnimalBreeds', (
            SELECT json_agg(cab)
            FROM "custom_animal_breed" cab
            WHERE cab.farm_id = f.farm_id
          ),
          'customAnimalTypes', (
            SELECT json_agg(cat)
            FROM "custom_animal_type" cat
            WHERE cat.farm_id = f.farm_id
          ),
          
          -- NOMINATION DATA
          'nominations', (
            SELECT json_agg(json_build_object(
              'nomination', n,
              'nominationCrops', (
                SELECT json_agg(nc)
                FROM "nomination_crop" nc
                WHERE nc.nomination_id = n.nomination_id
              ),
              'nominationStatuses', (
                SELECT json_agg(ns)
                FROM "nomination_status" ns
                WHERE ns.nomination_id = n.nomination_id
              )
            ))
            FROM "nomination" n
            WHERE n.farm_id = f.farm_id
          ),
          
          -- CROP AND MANAGEMENT PLAN DATA
          'cropVarieties', (
            SELECT json_agg(json_build_object(
              'cropVariety', cv,
              'cropVarietySales', (
                SELECT json_agg(cvs)
                FROM "crop_variety_sale" cvs
                WHERE cvs.crop_variety_id = cv.crop_variety_id
              ),
              'managementPlans', (
                SELECT json_agg(json_build_object(
                  'managementPlan', mp,
                  'cropManagementPlan', (
                    SELECT row_to_json(cmp)
                    FROM "crop_management_plan" cmp
                    WHERE cmp.management_plan_id = mp.management_plan_id
                  ),
                  'plantingManagementPlans', (
                    SELECT json_agg(json_build_object(
                      'plantingManagementPlan', pmp,
                      'containerMethods', (
                        SELECT json_agg(cm)
                        FROM "container_method" cm
                        WHERE cm.planting_management_plan_id = pmp.planting_management_plan_id
                      ),
                      'broadcastMethods', (
                        SELECT json_agg(bm)
                        FROM "broadcast_method" bm
                        WHERE bm.planting_management_plan_id = pmp.planting_management_plan_id
                      ),
                      'bedMethods', (
                        SELECT json_agg(bm)
                        FROM "bed_method" bm
                        WHERE bm.planting_management_plan_id = pmp.planting_management_plan_id
                      ),
                      'rowMethods', (
                        SELECT json_agg(rm)
                        FROM "row_method" rm
                        WHERE rm.planting_management_plan_id = pmp.planting_management_plan_id
                      ),
                      'managementTasks', (
                        SELECT json_agg(mt)
                        FROM "management_tasks" mt
                        WHERE mt.planting_management_plan_id = pmp.planting_management_plan_id
                      )
                    ))
                    FROM "planting_management_plan" pmp
                    WHERE pmp.management_plan_id = mp.management_plan_id
                  )
                ))
                FROM "management_plan" mp
                WHERE mp.crop_variety_id = cv.crop_variety_id
              )
            ))
            FROM "crop_variety" cv
            WHERE cv.farm_id = f.farm_id
          ),
          'managementPlanGroups', (
            WITH farm_management_plan_groups AS (
              SELECT DISTINCT mp.management_plan_group_id
              FROM "management_plan" mp
              JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
              WHERE cv.farm_id = f.farm_id
              AND mp.management_plan_group_id IS NOT NULL
            )
            SELECT json_agg(mpg)
            FROM "management_plan_group" mpg
            WHERE mpg.management_plan_group_id IN (
              SELECT management_plan_group_id FROM farm_management_plan_groups
            )
          ),
          
          -- LEGACY CROP DATA
          'crops', (
            SELECT json_agg(json_build_object(
              'crop', c,
              'waterBalances', (
                SELECT json_agg(wb)
                FROM "waterBalance" wb
                WHERE wb.crop_id = c.crop_id
              ),
              'cropDiseases', (
                SELECT json_agg(cd)
                FROM "cropDisease" cd
                WHERE cd.crop_id = c.crop_id
              )
            ))
            FROM "crop" c
            WHERE c.farm_id = f.farm_id
          ),
          'waterBalanceSchedules', (
            SELECT json_agg(wbs)
            FROM "waterBalanceSchedule" wbs
            WHERE wbs.farm_id = f.farm_id
          ),
          'diseases', (
            SELECT json_agg(json_build_object(
              'disease', d,
              'cropDiseases', (
                SELECT json_agg(cd)
                FROM "cropDisease" cd
                WHERE cd.disease_id = d.disease_id
              )
            ))
            FROM "disease" d
            WHERE d.farm_id = f.farm_id
          ),
          
          -- LOCATION DATA
          'locations', (
            SELECT json_agg(json_build_object(
              'location', l,
              'figures', (
                SELECT json_agg(json_build_object(
                  'figure', fig,
                  'areas', (
                    SELECT json_agg(a)
                    FROM "area" a
                    WHERE a.figure_id = fig.figure_id
                  ),
                  'lines', (
                    SELECT json_agg(ln)
                    FROM "line" ln
                    WHERE ln.figure_id = fig.figure_id
                  ),
                  'points', (
                    SELECT json_agg(p)
                    FROM "point" p
                    WHERE p.figure_id = fig.figure_id
                  )
                ))
                FROM "figure" fig
                WHERE fig.location_id = l.location_id
              ),
              'field', (
                SELECT row_to_json(fld)
                FROM "field" fld
                WHERE fld.location_id = l.location_id
              ),
              'garden', (
                SELECT row_to_json(g)
                FROM "garden" g
                WHERE g.location_id = l.location_id
              ),
              'gate', (
                SELECT row_to_json(g)
                FROM "gate" g
                WHERE g.location_id = l.location_id
              ),
              'waterValve', (
                SELECT row_to_json(wv)
                FROM "water_valve" wv
                WHERE wv.location_id = l.location_id
              ),
              'bufferZone', (
                SELECT row_to_json(bz)
                FROM "buffer_zone" bz
                WHERE bz.location_id = l.location_id
              ),
              'watercourse', (
                SELECT row_to_json(wc)
                FROM "watercourse" wc
                WHERE wc.location_id = l.location_id
              ),
              'fence', (
                SELECT row_to_json(f)
                FROM "fence" f
                WHERE f.location_id = l.location_id
              ),
              'barn', (
                SELECT row_to_json(b)
                FROM "barn" b
                WHERE b.location_id = l.location_id
              ),
              'farmSiteBoundary', (
                SELECT row_to_json(fsb)
                FROM "farm_site_boundary" fsb
                WHERE fsb.location_id = l.location_id
              ),
              'naturalArea', (
                SELECT row_to_json(na)
                FROM "natural_area" na
                WHERE na.location_id = l.location_id
              ),
              'surfaceWater', (
                SELECT row_to_json(sw)
                FROM "surface_water" sw
                WHERE sw.location_id = l.location_id
              ),
              'residence', (
                SELECT row_to_json(r)
                FROM "residence" r
                WHERE r.location_id = l.location_id
              ),
              'greenhouse', (
                SELECT row_to_json(g)
                FROM "greenhouse" g
                WHERE g.location_id = l.location_id
              ),
              'ceremonialArea', (
                SELECT row_to_json(ca)
                FROM "ceremonial_area" ca
                WHERE ca.location_id = l.location_id
              ),
              'pin', (
                SELECT row_to_json(p)
                FROM "pin" p
                WHERE p.location_id = l.location_id
              ),
              'organicHistory', (
                SELECT json_agg(oh)
                FROM "organic_history" oh
                WHERE oh.location_id = l.location_id
              )
            ))
            FROM "location" l
            WHERE l.farm_id = f.farm_id
          ),
          
          -- FARM INTEGRATIONS AND DOCUMENTS
          'farmAddons', (
            SELECT json_agg(fa)
            FROM "farm_addon" fa
            WHERE fa.farm_id = f.farm_id
          ),
          'documents', (
            SELECT json_agg(d)
            FROM "document" d
            WHERE d.farm_id = f.farm_id
          ),
          
          -- PRODUCT DATA
          'products', (
            SELECT json_agg(json_build_object(
              'product', p,
              'soilAmendmentProducts', (
                SELECT json_agg(sap)
                FROM "soil_amendment_product" sap
                WHERE sap.product_id = p.product_id
              )
            ))
            FROM "product" p
            WHERE p.farm_id = f.farm_id
          ),
          
          -- FINANCIAL DATA
          'sales', (
            SELECT json_agg(s)
            FROM "sale" s
            WHERE s.farm_id = f.farm_id
          ),
          'farmExpenses', (
            SELECT json_agg(fe)
            FROM "farmExpense" fe
            WHERE fe.farm_id = f.farm_id
          ),
          'farmExpenseTypes', (
            SELECT json_agg(fet)
            FROM "farmExpenseType" fet
            WHERE fet.farm_id = f.farm_id
          ),
          'revenueTypes', (
            SELECT json_agg(rt)
            FROM "revenue_type" rt
            WHERE rt.farm_id = f.farm_id
          ),
          
          -- LEGACY TABLES
          'shifts', (
            SELECT json_agg(json_build_object(
              'shift', s,
              'shiftTasks', (
                SELECT json_agg(st)
                FROM "shiftTask" st
                WHERE st.shift_id = s.shift_id
              )
            ))
            FROM "shift" s
            WHERE s.farm_id = f.farm_id
          ),
          'prices', (
            SELECT json_agg(p)
            FROM "price" p
            WHERE p.farm_id = f.farm_id
          ),
          'yields', (
            SELECT json_agg(y)
            FROM "yield" y
            WHERE y.farm_id = f.farm_id
          ),
          
          -- CERTIFIER DATA
          'organicCertifierSurvey', (
            SELECT row_to_json(ocs)
            FROM "organicCertifierSurvey" ocs
            WHERE ocs.farm_id = f.farm_id
          ),
          
          -- NOTIFICATION DATA
          'notifications', (
            SELECT json_agg(json_build_object(
              'notification', n,
              'notificationUsers', (
                SELECT json_agg(nu)
                FROM "notification_user" nu
                WHERE nu.notification_id = n.notification_id
              )
            ))
            FROM "notification" n
            WHERE n.farm_id = f.farm_id
          ),
          
          -- FERTILIZERS AND PESTICIDES
          'fertilizers', (
            SELECT json_agg(fert)
            FROM "fertilizer" fert
            WHERE fert.farm_id = f.farm_id
          ),
          'pesticides', (
            SELECT json_agg(p)
            FROM "pesticide" p
            WHERE p.farm_id = f.farm_id
          ),
          
          -- FINANCE REPORTS
          'financeReports', (
            SELECT json_agg(fr)
            FROM "finance_report" fr
            WHERE fr.farm_id = f.farm_id
          )
        )
      )
      FROM "farm" f
      WHERE f.farm_id IN (SELECT farm_id FROM single_user_farms)
    )
  ) AS full_export
)
SELECT full_export::jsonb
FROM export_data;