'use strict'

let getCategoriesFoot = () => {
  let categories = [];
  for(let i = 7; i < 21; i++){
    categories.push('U'+i);
  }
  categories.push('Sénior', 'Vétéran');
  return categories;
}

exports.getCategoriesFoot = (req, res) => {
  res.status(200).json({
    categories: getCategoriesFoot()
  });
}
