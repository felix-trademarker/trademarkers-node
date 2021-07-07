let rpoOrder = require('../repositories/orders');
let rpoUserMysql = require('../repositories/users');
let rpoTrademarksMysql = require('../repositories/trademarks');
let rpoTrademarks = require('../repositories/mongoTrademarks');
let rpoInvoice = require('../repositories/invoice');
var rpoUserMongo = require('../repositories/usersMongo');

var mailService = require('../services/mailerService');

var helpers = require('../helpers');

exports.createOrderCode = async function() {

  // let code = makeid(2) + '-' + makeid(4) + '-' + makeid(1);
  let code = '';
  // console.log(code);

  let flag = true;
  for(;flag;){

    code = makeid(4) + '-' + makeid(2); 
    let order = await rpoOrder.findOrderNumber(code);

    if (order.length <= 0) flag = false;

  }

  return code;
  
}

exports.createInvoiceCode = async function() {

  // let code = makeid(2) + '-' + makeid(4) + '-' + makeid(1);
  let code = '';
  // console.log(code);

  let flag = true;
  for(;flag;){

    code = makeid(3) + '-' + makeid(6); 
    let order = await rpoInvoice.findInvoiceNumber(code);

    if (order.length <= 0) flag = false;

  }

  return code;
  
}

exports.getOldOrders = async function(obj) {

  let orders = await rpoOrder.fetchOrderByUser(obj.id);
  let userProfile = await rpoUserMysql.getUserProfile(obj.id);

  console.log("profile", userProfile[0]);

  if (orders.length > 0) {
    for (var i = 0; i < orders.length; i++) {

      let trademarks = await rpoTrademarksMysql.fetchTmByOrder(orders[i].id);
      let invoice = await rpoInvoice.fetchByOrderIdMysql(orders[i].id);

      // console.log("order", orders[i]);
      // console.log("invoice", invoice);
      // console.log("trademarks", trademarks);

      let orderData = {
        orderNumber: orders[i].order_number,
        charge: invoice[0],
        paid: invoice[0].status == 'pending' ? false : true,
        userId: obj._id,
        user: obj,
        cartItems: trademarks,
        created_at: orders[i].created_at,
        created_at_formatted: orders[i].created_at
      }

      orderData.charge.amount = orders[i].total_amount * 100

      // add order data
      let storedOrder = await rpoOrder.put(orderData);

      for (var t = 0; t < trademarks.length; t++) {

        let serviceType = '';
        let markType = '';

        if (trademarks[t].service == "Trademark Registration") {
          serviceType = 'registration';
        } else if(trademarks[t].service == "Trademark Study"){
          serviceType = 'study';
        } else if(trademarks[t].service == "Trademark Monitoring"){
          serviceType = 'monitoring';
        }

        if (trademarks[t].type == "Word-Only") {
          markType = 'word';
        } else if(trademarks[t].type == "Design-Only or Stylized Word-Only (Figurative)"){
          markType = 'logo';
        } else if(trademarks[t].type == "Combined Word and Design"){
          markType = 'lword';
        }

        let trdData = {
          userId: obj._id,
          user: obj,
          orderCode: orderData.orderNumber,
          userEmail: obj.email,
          serialNumber: trademarks[t].filing_number,
          mark: trademarks[t].name,
          serviceType: serviceType,
          type: markType,
          class: trademarks[t].classes,
          description: trademarks[t].classes_description,
          country: trademarks[t].office,
          countryId: trademarks[t].country_id,
          colorClaim: trademarks[t].color_claim,
          colorClaimText: '',
          nature: userProfile[0].nature,
          company: userProfile[0].company,
          fname: userProfile[0].first_name,
          lname: userProfile[0].last_name,
          phone: userProfile[0].phone_number,
          fax: userProfile[0].fax,
          position: userProfile[0].nature == "Company" ? userProfile[0].company : '',
          repCountry: userProfile[0].country,
          repStreet: userProfile[0].street,
          repCity: userProfile[0].city,
          repState: userProfile[0].state,
          repZipCode: userProfile[0].zip_code,
          companyCountry: userProfile[0].country,
          companyStreet: userProfile[0].street,
          companyCity: userProfile[0].city,
          companyState: userProfile[0].state,
          companyZipCode: userProfile[0].zip_code,
          commerce: trademarks[t].commerce,
          filed: trademarks[t].recently_filed,
          priority: trademarks[t].claim_priority,
          origin: trademarks[t].priority_country,
          originDate: trademarks[t].priority_date,
          originTm: trademarks[t].priority_number,
          status: trademarks[t].office_status,
          created_at: trademarks[t].created_at,
          created_at_formatted: trademarks[t].created_at
        }

        await rpoTrademarks.put(trdData);

      }
      
      // store order and trademarks

    }
  }

  let data = {
    isMigrate : true
  }
  await rpoUserMongo.updateUser(obj._id, data);

}

exports.fixOrderRecords = async function() {
  let orders = await rpoOrder.getAll()

  for (var i = 0; i < orders.length; i++) {

    if ( !orders[i].cartItems && orders[i].charge && orders[i].charge.order_id ) {
      
      let user = await rpoUserMongo.getByIdM(orders[i].userId)
      let trademarks = await rpoTrademarksMysql.fetchTmByOrder(orders[i].charge.order_id);
      // let invoice = await rpoInvoice.fetchByOrderIdMysql(orders[i].id);

      let data = {
        user : user[0],
        cartItems: trademarks,
        created_at: orders[i].charge.created_at,
        created_at_formatted: orders[i].charge.created_at
      }

      rpoOrder.update(orders[i]._id,data);

    } else if (orders[i].userId && !orders[i].user ) {

      let user = await rpoUserMongo.getByIdM(orders[i].userId)

      let data = {
        user : user[0],
      }

      if ( orders[i].cartItems[0] && orders[i].cartItems[0].user ) {
        data.user = orders[i].cartItems[0].user
      }
    
      rpoOrder.update(orders[i]._id,data);

    } else if (!orders[i].charge) {
      // console.log(orders[i].orderNumber);
    } else if ( orders[i].charge && !orders[i].charge.amount && orders[i].charge.amount_captured && orders[i].cartItems  ) {

      let data = {
        charge : orders[i].charge
      }

      data.charge.amount = orders[i].charge.amount_captured;
      rpoOrder.update(orders[i]._id,data);

    } else if ( orders[i].charge && orders[i].charge.amount && orders[i].cartItems  ) {
      // get total amount 
      let totalAmount = 0;
      for (var t = 0; t < orders[i].cartItems.length; t++) {
        totalAmount += orders[i].cartItems[t].amount
      }

      let data = {
        charge : orders[i].charge
      }

      data.charge.amount = totalAmount;
      rpoOrder.update(orders[i]._id,data);
    }

  }

  // console.log(orders);
}

// USED ONLY IN TEST NOT USING IN SYSTEM
exports.syncOrders = async function() {

  let users = await rpoUserMysql.getUsers();
  

  for (var i = 0; i < users.length; i++) {

    // fetch orders from this user
    let orders = await rpoOrder.fetchOrderByUser(users[i].id);
    let userProfile = await rpoUserMysql.getUserProfile(users[i].id)

    if (orders.length > 0) {

      // insert user in collection if not exist
      rpoUserMysql.putUser(users[i]);

      // format address
      let street = userProfile[0] && userProfile[0].street ? userProfile[0].street : '';
      let city = userProfile[0] && userProfile[0].city ? userProfile[0].city : '';
      let state = userProfile[0] && userProfile[0].state ? userProfile[0].state : '';
      let country = userProfile[0] && userProfile[0].country ? userProfile[0].country : '';
      let zip_code = userProfile[0] && userProfile[0].zip_code ? userProfile[0].zip_code : '';
      let phone_number = userProfile[0] && userProfile[0].phone_number ? userProfile[0].phone_number : '';
      let fax = userProfile[0] && userProfile[0].fax ? userProfile[0].fax : '';
      let house = userProfile[0] && userProfile[0].house ? userProfile[0].house : '';
      let company = userProfile[0] && userProfile[0].house ? userProfile[0].company : '';
      let first_name = userProfile[0] && userProfile[0].first_name ? userProfile[0].first_name : '';
      let last_name = userProfile[0] && userProfile[0].last_name ? userProfile[0].last_name : '';

      let address = street + " " + city +", "+ state + " " + country +" "+ zip_code;

      // FORMAT DATA FOR STORING IN ORDER SUMMARY
      let summary = {
        customerId: users[i].id,
        name: users[i].name,
        email: users[i].email,
        address: address,
        city: city,
        state: state,
        street: street,
        house: house,
        zipCode: zip_code,
        country: country,
        phone: phone_number,
        fax: fax,
        entity: company ? 'company' : 'individual',
        orders: [],
        contacts: {
          greet: 'Mr/Mrs',
          name: first_name
        }

      };

      // fetch trademarks per order
      
      for (var o = 0; o < orders.length; o++) {

        let ordersData = {
          orderNo: orders[o].order_number,
          orderId: orders[o].id,
          items: []
        } 

        let trademarks = await rpoTrademarksMysql.fetchTmByOrder(orders[o].id);

        for (var t = 0; t < trademarks.length; t++) {

          

          let classArr = [];

          if (trademarks[t].classes) {
            let classNumber = trademarks[t].classes.split(",")
            let classDescription = trademarks[t].classes_description;
            for (let i = 0; i < classNumber.length; i++) {
                if(classNumber[i]) {
                    classArr.push({
                        classNo: classNumber[i],
                        goodsServices: classDescription
                    });
                }
            }
          }
          

          let item = {
            service: trademarks[t].service,
            type: trademarks[t].type,
            name: trademarks[t].name,
            class: classArr

          }
          ordersData.items.push(item)
          
        }

        summary.orders.push(ordersData)

      }
      rpoOrder.put(summary);

    }

  }


  
}

exports.getUserWithOrder = async function() {

  console.log("===============called migration============");

  let usersMySql = await rpoUserMysql.getUsers()
  let migrated = true;
  let userMyQ = null;

  for (let i = 0, track = true; track; i++) {

    if (usersMySql.length > i) {
      console.log("=============== Checking in Mongo "+usersMySql[i].email+" ============");
      // check if user in mongo
      let user = await rpoUserMongo.getById(usersMySql[i].id)
      // console.log("user >> ", user[0].email);
      if ( user.length <= 0 ) {
        // nothing found 
        // exe migrate
        console.log("=============== Not in Mongo "+usersMySql[i].email+" ============");
        userMyQ = usersMySql[i]
        track = false
      }

    } else {
      track = false
      migrated = false;
    }
    
  }

  if (userMyQ && !userMyQ.email.includes("temporary") ) {
    console.log("=============== FOUND USER "+userMyQ.email+" ============");
    let flag = true

    for ( ; flag; ) {
        custNo = "CU-" + helpers.makeid(4)

        let dataCustomer = await rpoUserMongo.findUserNo(custNo)
        // console.log("check user", dataCustomer.length );
        if ( dataCustomer.length <= 0 ) {
            flag = false
        }
    }
    userMyQ.custNo = custNo
    userMyQ.isMigrate = false

    let storedUser = await rpoUserMongo.putUser(userMyQ);
    userMyQ._id = storedUser.insertedId;

    let mailData = {
      subject: `User Migrated | ${custNo} | ${userMyQ.email}`,
      message: `<p>Email: ${userMyQ.email}</p>
                <p>Mysql ID: ${userMyQ.id}</p>
                <p>Mongo ID: ${userMyQ._id}</p>`
    }
    mailService.notifyWebMaster(mailData);
    
  } else {
    console.log("=============== NULL ============");
    let mailData = {
      subject: `User Migration Complete`,
      message: `<p>DONE Turn Off!</p>`
    }
  }

  return userMyQ;

}




function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;

  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}




