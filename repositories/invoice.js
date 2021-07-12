let _table = process.env.TBLEXT + "invoice";

let conn = require('../config/DbConnect');
var ObjectID = require('mongodb').ObjectID;
// DATABASE CONNECTION
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

	findById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { id: id };

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

	findInvoiceNumber : async function(number) {
		return new Promise(function(resolve, reject) {

			let query = { invoiceCode: number };

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
	
	fetchByOrderIdMysql: async function ( order_id ) {

		return new Promise(function(resolve, reject) {
			connection.query("SELECT * FROM invoices WHERE order_id = ?",[(order_id * 1)],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	put: async function(data) {
		return new Promise(function(resolve, reject) {
			conn.getDb().collection(_table).insertOne(data, 
				function(err, res2) {
					if (err) reject(err);

					resolve(res2);
				}
			);
		});

	},

	update: async function(id,data) {

		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };

			conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
				if (result) {
			
					resolve(result)
				} else {
		
					reject(err);
				}
			});

		});

	},

}; 