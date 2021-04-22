exports.up = async function(knex) {

  const currentFarms = await knex('farm');
  const countries = await knex('countries');

  const newStructure = {
    country_id: null,
  };


  const updatedFarms = currentFarms.map((farm) => {
    const { currency } = farm.units;
    const farm_id = farm.farm_id;
    const match = countries.find(({ iso }) => iso === currency);
    if (match) {
      return {
        ...newStructure,
        country_id: match.id,
        farm_id,
      };
    } else {
      return {
        ...newStructure,
        farm_id,
      };
    }
  });

  return Promise.all(updatedFarms.map((updatedFarm) => {
    const { farm_id, ...data } = updatedFarm;
    return knex('farm').where({ farm_id }).update(data);
  }));

};

exports.down = function(knex) {
  return Promise.all([]);

};




