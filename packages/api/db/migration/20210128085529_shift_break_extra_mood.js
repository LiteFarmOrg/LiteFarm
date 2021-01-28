const newEnum = ['happy', 'neutral', 'very happy', 'sad', 'very sad', 'na', 'no answer']
exports.up = function (knex) {
  return Promise.all([
    knex('taskType')
      .insert({ task_name: 'Break', task_translation_key: 'BREAK', farm_id: null }),
    knex.raw(`ALTER TABLE SHIFT DROP CONSTRAINT shift_mood_check;
              ALTER TABLE SHIFT ADD CONSTRAINT shift_mood_check 
              CHECK (mood = ANY (ARRAY['${newEnum.join(`'::text,'`)}'::text]))`),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex('taskType').where({ task_name: 'Break' }).andWhere({ farm_id: null }).del(),
    knex.raw(`ALTER TABLE SHIFT DROP CONSTRAINT shift_mood_check;
              ALTER TABLE SHIFT ADD CONSTRAINT shift_mood_check 
              CHECK (mood = ANY (ARRAY['${newEnum.slice(0, -1).join(`'::text,'`)}'::text]))`),
  ]);
};
