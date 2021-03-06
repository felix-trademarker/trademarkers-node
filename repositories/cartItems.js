let _table = process.env.TBLEXT + "cartItems";
let conn = require('../config/DbConnect');

var ObjectID = require('mongodb').ObjectID;

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	put: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
 
	fetchCustomerCart : async function(userId) {
		return new Promise(function(resolve, reject) {

			let query = { 
				userId: ObjectID(userId),
				status: 'active'
			};

			let db = conn.getDb();
			
			db.collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	update: function(id,data) {

        let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {

		});

	},
	
	remove: async function(id) {

		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			conn.getDb().collection(_table).deleteOne(query, function(err, result) {
				if (result) {
					console.log('ok');
					resolve(result)
				} else {
					console.log('err', err.message);
					reject(err);
				}
			});
		});

    }

};