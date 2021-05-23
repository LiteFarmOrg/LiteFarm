exports.up = async function(knex) {
  const getBucketName = () => {
    const environment = process.env.NODE_ENV || 'development';
    if (environment === 'production') return 'litefarmapp';
    if (environment === 'integration') return 'litefarmbeta';
    return 'litefarm';
  };
  await knex.schema.alterTable('crop', t => {
    t.string('crop_photo_url').notNullable().defaultTo(`https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/default.jpg`);
  });
  const imageNames = ['cabbage_chinese.jpg', 'cotton_all_varieties.jpg', 'maize-hybrid.jpg', 'durum_wheat.jpg', 'mushrooms.jpg', 'flax_.jpg', 'sorghum.jpg', 'chestnut_tree.jpg', 'lime.jpg', 'rapeseed_colza.jpg', 'walnut_tree.jpg', 'chayote.jpg', 'sugarcane_for_sugar_or_alcohol.jpg', 'fig.jpg', 'grapes-for_table_use.jpg', 'sugarcane_for_thatching.jpg', 'beans.jpg', 'wheat.jpg', 'onion-red.jpg', 'pecan_nut.jpg', 'turnip.jpg', 'palm-sago.jpg', 'plum.jpg', 'persimmon.jpg', 'potato.jpg', 'gourd_african.jpg', 'tomato.jpg', 'spelt_wheat.jpg', 'black_pepper.jpg', 'brussel_sprouts.jpg', 'sweet_peppers.jpg', 'caraway_seeds.jpg', 'sisal.jpg', 'kale.jpg', 'strawberry.jpg', 'endive.jpg', 'lemon_grass.jpg', 'buckwheat.jpg', 'papaya_pawpaw.jpg', 'parsnip.jpg', 'nutmeg_tree.jpg', 'medlar.jpg', 'basil.jpg', 'clover_fodder.jpg', 'dates.jpg', 'jerusalem_artichoke.jpg', 'chickpea_plant.jpg', 'oats.jpg', 'chard.jpg', 'pepper-black.jpg', 'ornamental_plants.jpg', 'cardamom.jpg', 'quince.jpg', 'cabbage_fodder.jpg', 'millet_finger.jpg', 'yam.jpg', 'chili_dry_pepper.jpg', 'coconut.jpg', 'quinoa.jpg', 'fenugreek-seeds.jpg', 'sunflower-for_seed.jpg', 'maize-ordinary.jpg', 'taro.jpg', 'cassava_manioc.jpg', 'palm_oil.jpg', 'maize(corn).jpg', 'sweet_potato.jpg', 'onion-green.jpg', 'arugula.jpg', 'mint_all_varieties.jpg', 'garlic.jpg', 'maize-for_cereals.jpg', 'poppy_seed.jpg', 'tung_tree.jpg', 'currants_all_varieties.jpg', 'apple.jpg', 'rice.jpg', 'cauliflower.jpg', 'cowpea.jpg', 'okra.jpg', 'rutabaga_swede.jpg', 'broccoli.jpg', 'hazelnut.jpg', 'sunflower.jpg', 'peanut_plant.jpg', 'coconut_tree.jpg', 'guava.jpg', 'chili_fresh.jpg', 'sainfoins.jpg', 'chicory_for_greens.jpg', 'sesame.jpg', 'geranium.jpg', 'collards.jpg', 'drumstick_tree.jpg', 'olive.jpg', 'clementine.jpg', 'vetch.jpg', 'cardoon.jpg', 'celery.jpg', 'chili_all_varieties.jpg', 'broad_bean.jpg', 'raspberry_all_varieties.jpg', 'beet_fodder_(mangel).jpg', 'mulberry_all_varieties.jpg', 'gourd_american.jpg', 'fenugreek.jpg', 'grass_-_sudan.jpg', 'rose.jpg', 'alfalfa_sprouts.jpg', 'watermelon.jpg', 'millet_bajra_pearl.jpg', 'cherry_all_varieties.jpg', 'quinoa_plant.jpg', 'sunflower-girasol.jpg', 'lemon.jpg', 'kohlrabi.jpg', 'palm_palmyra.jpg', 'liquorice-root.jpg', 'cantaloupe.jpg', 'blueberry.jpg', 'nectarine.jpg', 'hops.jpg', 'pumpkin.jpg', 'buckwheat_seeds.jpg', 'mango.jpg', 'apricot.jpg', 'rosemary.jpg', 'asparagus.jpg', 'nutmeg.jpg', 'sugarcane_for_fodder.jpg', 'squash.jpg', 'oil_palm.jpg', 'arracacha.jpg', 'onion.jpg', 'areca(betel_nut).jpg', 'blackberries_.jpg', 'fennel-seed.jpg', 'breadfruit.jpg', 'rice_african.jpg', 'maize_sweet_corn.jpg', 'citronella.jpg', 'earth_pea.jpg', 'onion-dry.jpg', 'plantain.jpg', 'beet.jpg', 'vanilla_flower.jpg', 'kola_nut.jpg', 'wheat_seeds.jpg', 'grass_-_orchard.jpg', 'pomegranate.jpg', 'spinach.jpg', 'triticale.jpg', 'almond.jpg', 'mustard.jpg', 'sorghum-jowar.jpg', 'orange_bitter.jpg', 'grapes_.jpg', 'tea.jpg', 'avocado.jpg', 'pigeon_pea.jpg', 'trefoil_plant.jpg', 'maize_grain.jpg', 'opium.jpg', 'cinammon.jpg', 'millet_broom.jpg', 'cocoa_cacao.jpg', 'saffron.jpg', 'buckwheat_plant.jpg', 'maize-silage.jpg', 'litchi.jpg', 'mace.jpg', 'cilantro.jpg', 'walnut.jpg', 'rubber.jpg', 'macadamia_nut.jpg', 'chickpea.jpg', 'papaya_tree.jpg', 'hazelnut_filbert.jpg', 'macadamia.jpg', 'grapefruit.jpg', 'lettuce.jpg', 'soybean.jpg', 'beet_sugar.jpg', 'hemp_.jpg', 'castor_bean.jpg', 'beans-dry_for_grains.jpg', 'beet_red.jpg', 'radish.jpg', 'orange.jpg', 'loquat.jpg', 'oatmeal.jpg', 'artichoke.jpg', 'vanilla.jpg', 'rhubarb.jpg', 'custard_apple.jpg', 'melon_.jpg', 'lupine.jpg', 'alfalfa_for_fodder.jpg', 'safflower.jpg', 'pyrethum.jpg', 'bell_peppers.jpg', 'pistachio_nut.jpg', 'citron.jpg', 'soybean_plant.jpg', 'pear.jpg', 'tangerine.jpg', 'bergamot.jpg', 'ginger.jpg', 'carob.jpg', 'fennel.jpg', 'tobacco.jpg', 'chickpea_gram_pea.jpg', 'jasmine.jpg', 'peach.jpg', 'maguey.jpg', 'mandarin.jpg', 'cress.jpg', 'lavender.jpg', 'barley.jpg', 'cabbage.jpg', 'coffee_plant.jpg', 'chicory.jpg', 'rye.jpg', 'coffee.jpg', 'banana.jpg', 'brazil_nut.jpg', 'carrot_fodder.jpg', 'groundnut_peanut.jpg', 'carrot.jpg', 'clover.jpg', 'pea.jpg', 'hazelnut_plant.jpg', 'grapes-for_raisins.jpg', 'beans-harvested_green,dry.jpg', 'chestnut.jpg', 'millet_foxtail.jpg', 'eggplant.jpg', 'prune.jpg', 'sunflower_for_fodder.jpg', 'persimmon_kaki.jpg', 'clove.jpg', 'sugarcane.jpg', 'cashew_tree.jpg', 'grapes-for_wine.jpg', 'gooseberry_all_varieties.jpg', 'sapodilla.jpg', 'barley_seeds.jpg', 'cashew_nuts.jpg', 'turnip_-_for_fodder.jpg', 'corn-salad,sweet.jpg', 'rice_grain.jpg', 'oregano.jpg', 'cranberry.jpg', 'pomelo.jpg', 'satsuma.jpg', 'default.jpg', 'black_salsify.jpg', 'pistachio_tree.jpg', 'timothy_plant.jpg', 'chia.jpg', 'pineapple.jpg', 'millet_japanese.jpg', 'anise_seeds.jpg', 'cucumber.jpg', 'lentil.jpg', 'indigo.jpg', 'daikon_radish.jpg', 'yerba_mate.jpg', 'millet_proso.jpg', 'soybean_hay.jpg', 'leek.jpg', 'parsley.jpg', 'celeriac.jpg'];
  const imageNamesWithoutExtension = new Set(imageNames.map(name => name.replace('.jpg', '')));
  const crops = await knex('crop').where({});
  for (const crop of crops) {
    let imageName = 'default';
    const lowerCaseTranslationKey = crop.crop_translation_key.toLowerCase();
    if (imageNamesWithoutExtension.has(lowerCaseTranslationKey)) {
      imageName = lowerCaseTranslationKey;
    } else {
      const originalTranslationKey = lowerCaseTranslationKey.split(' - ')[0].split(' ').join('_');
      if (imageNamesWithoutExtension.has(originalTranslationKey)) {
        imageName = originalTranslationKey;
      } else {
        const wordsInTranslationKey = lowerCaseTranslationKey.split('_');
        for (let i = 0; i < wordsInTranslationKey.length; i++) {
          const subStringOfTranslationKey = wordsInTranslationKey.slice(0, i + 1).join('_');
          if (imageNamesWithoutExtension.has(subStringOfTranslationKey)) {
            imageName = subStringOfTranslationKey;
            break;
          }
        }
      }
    }
    await knex('crop').where({ crop_id: crop.crop_id }).update({ crop_photo_url: `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/${imageName}.jpg` });
  }
};

exports.down = function(knex) {
  return knex.schema.alterTable('crop', t => {
    t.dropColumn('crop_photo_url');
  });
};
