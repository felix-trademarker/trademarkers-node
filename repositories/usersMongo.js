let _table = process.env.TBLEXT + "users";
let ObjectID = require('mongodb').ObjectID;
let conn = require('../config/DbConnect');

module.exports = {

	findUser : async function(email) {
		return new Promise(function(resolve, reject) {

			let query = { email: email };

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

	getResearchers : async function() {
		return new Promise(function(resolve, reject) {

			let query = { role_id: 4 };

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

	getResearchersById : async function(_id) {
		return new Promise(function(resolve, reject) {

			// let query = { role_id: 4 };

			let db = conn.getDb();
			
			db.collection(_table).find(_id).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	putUser: function(data) {

        conn.getDb().collection(_table).insertOne(data, 
			function(err, res2) {
				if (err) throw err;
			}
		);

	},
	
	updateUser: function(id,data) {

        let query = { _id: ObjectID(id) };

		conn.getDb().collection(_table).updateOne(query,{$set: data }, function(err, result) {
			if (err) {
				console.log('Error updating user: ' + err);
				// res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				// res.send(result);
			}
		});

    }
};