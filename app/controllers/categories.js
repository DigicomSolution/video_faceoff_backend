import db from '../models';
const Op = require('sequelize').Op;


const addCategory =  async({name}) => {
  name.map(async(i) => {
    await db.category.create({
      name: i
    });
    return true;
  });
  return true;
};

const categoryList =  async() => {
  const category = await db.category.findAll({
    where: {
      name: { [Op.ne]: null }
    },
    order: [
      ['name', 'ASC']
    ],
  }).catch(e => console.log(e));
  if (!category.length) throw new Error('No Category');
  return category;
};

module.exports = {
  addCategory,
  categoryList,
};