var rpo = require('../repositories/prices');
var rpoCountries = require('../repositories/countries')

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let lists = await rpo.getAll();
  let countries = await rpoCountries.getAll()

  let country = countries.find(x => x.id === 101 )
  console.log("country",country);
  
  res.render('admin/prices/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    lists: lists,
    countries: countries
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  let articles = await rpo.getById(id);
  
  res.render('admin/prices/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    article: articles[0]
  });
    
}

exports.add = async function(req, res, next) {

  // let id = req.params['id'];

  let countries = await rpoCountries.getAll();
  
  res.render('admin/prices/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    countries: countries
  });
    
}

exports.addSubmit = async function(req, res, next) {

  let data = req.body

  

  data.country_id = data.country_id * 1.0
  data.initial_cost = data.initial_cost * 1.0
  data.additional_cost = data.additional_cost * 1.0
  data.logo_initial_cost = data.logo_initial_cost * 1.0
  data.logo_additional_cost = data.logo_additional_cost * 1.0
  data.tax = data.tax * 1.0

  data.create_at = toInteger(moment().format('YYMMDD'))
  data.created_at_formatted = moment().format()

  await rpo.put(data);
  
  res.flash('success', 'Added successfully!');

  res.redirect('/njs-admin/manage/prices/');

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let list = await rpo.getByIdM(id);
  let countries = await rpoCountries.getAll();
  
  res.render('admin/prices/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    list: list[0],
    countries: countries
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  let updateData = req.body;

  updateData.country_id = updateData.country_id * 1.0
  updateData.initial_cost = updateData.initial_cost * 1.0
  updateData.additional_cost = updateData.additional_cost * 1.0
  updateData.logo_initial_cost = updateData.logo_initial_cost * 1.0
  updateData.logo_additional_cost = updateData.logo_additional_cost * 1.0
  updateData.tax = updateData.tax * 1.0

  await rpo.update(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/prices/');

}

exports.deleteRecord = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpo.remove(req.params.id)

  console.log("res", result);
  res.flash('success', 'Deleted successfully!');
  res.redirect('/njs-admin/manage/prices/');

}


