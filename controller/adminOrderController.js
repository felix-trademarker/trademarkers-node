var rpo = require('../repositories/orders');
var rpoUsers = require('../repositories/usersMongo');

const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt');

let moment = require('moment');
const { toInteger } = require('lodash');

var helpers = require('../helpers');

exports.index = async function(req, res, next) {

  // console.log(db.mongoConnection);

  let orders = await rpo.getAll();
  
  res.render('admin/order/', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    orders: orders
  });
    
}

exports.show = async function(req, res, next) {

  let id = req.params['id'];

  let orders = await rpo.getById(id);

  if (orders[0] && !orders[0].user) {
    if (orders[0].userId) {
      let users = await rpoUsers.getByIdM(orders[0].userId)
      rpo.update(orders[0]._id, {user:users[0]})
      orders[0].user = users[0]
    }
  }

  
  res.render('admin/order/view', {
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard View',
    order: orders[0]
  });
    
}

exports.add = async function(req, res, next) {

  let id = req.params['id'];

  let user = await rpo.getByIdM(id);
  
  res.render('admin/user/add', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    user: user[0]
  });
    
}

exports.addSubmit = async function(req, res, next) {

  // let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  // let addData = req.body;

  var hash = bcrypt.hashSync(req.body.password, 10); 

  hash = hash.replace("$2b$", "$2y$");

  let flag = true
  let custNo = ""

  for ( ; flag; ) {
      custNo = "CU-" + helpers.makeid(4)

      let dataCustomer = await rpo.findUserNo(custNo)
      // console.log("check user", dataCustomer.length );
      if ( dataCustomer.length <= 0 ) {
          flag = false
      }
  }

  let checkEmail = await rpo.findUser(req.body.email)

  if ( checkEmail.length > 0 ) {
    res.flash('error', 'Email Already Exist!');
    res.redirect('/njs-admin/manage/user/');
  } else {
    let userData = {
      name: req.body.lname + ", " + req.body.fname,
      firstName:req.body.fname,
      lastName:req.body.lname,
      email: req.body.email,
      secondaryEmail: req.body.email,
      password: hash,
      custNo: custNo,
      created_at: toInteger(moment().format('YYMMDD')),
      created_at_formatted: moment().format()
    }
  
    await rpo.putUser(userData);
  
    res.flash('success', 'Added successfully!');
    res.redirect('/njs-admin/manage/user/');
  }

  
  next()
  

}

exports.edit = async function(req, res, next) {

  let id = req.params['id'];

  let user = await rpo.getByIdM(id);
  
  res.render('admin/user/edit', { 
    layout: 'layouts/admin-layout', 
    title: 'Admin Dashboard',
    user: user[0]
  });
    
}

exports.editSubmit = async function(req, res, next) {

  let id = req.params['id'];
  // let country = await rpo.getByIdM(id);

  let updateData = req.body;


  await rpo.updateUser(id, updateData);

  res.flash('success', 'Updated successfully!');
  res.redirect('/njs-admin/manage/user/');

}

exports.deleteService = async function(req, res, next) {

  // console.log(req.body);

  let result = await rpoAddedServices.remove(req.body.id)

  // console.log(result);

  res.json(result);

}


