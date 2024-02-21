CREATE VIEW animal_union_batch_internal_identifier AS
SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY farm_id ORDER BY created_at)::INTEGER AS internal_identifier
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
) animal_union_batch_internal_identifier
ORDER BY
    created_at;