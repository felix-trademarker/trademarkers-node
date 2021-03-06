let _table = process.env.TBLEXT + "orders";

let conn = require('../config/DbConnect');

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

	putCart: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
	
	fetchTmByOrder: async function ( order_id ) {

		return new Promise(function(resolve, reject) {
			connection.query("SELECT * FROM trademarks WHERE order_id = ?",[(order_id * 1)],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	fetchTmBySerial: function ( number ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM action_code_cases WHERE number = ? ORDER BY updated_at DESC LIMIT 1',[number],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	fetchTmByMark: function ( mark ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM trademarks WHERE name = ? ORDER BY updated_at DESC LIMIT 1',[mark],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},


	fetchTmById: function ( trademark_id ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM trademarks WHERE id = ?',[trademark_id],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	fetchTmByUser: async function ( user_id, sort ) {

		return new Promise(function(resolve, reject) {

			let query = "";

			if (sort) {
				let sortBy = (sort == 'registered' ? "AND office_status = 'Registered'" : "AND office_status <> 'Registered'");

				query = `SELECT * 
							FROM trademarks 
							WHERE user_id = ${user_id}
							AND service = 'Trademark Registration'
							${sortBy}
						`;
			} else {
				console.log('tet');
				query = `SELECT * 
							FROM trademarks 
							WHERE user_id = '${user_id}'
							GROUP BY filing_number
						`;
			}

			connection.query(query,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},

	fetchTmCertById: function ( trademark_id ) {

		return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM certificates WHERE trademark_id = ?',[trademark_id],function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});

	},
}; 