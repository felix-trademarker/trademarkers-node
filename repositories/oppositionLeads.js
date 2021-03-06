let _table = "published_for_opposition";
let conn = require('../config/DbConnect');
let ObjectID = require('mongodb').ObjectID;


module.exports = {


	getAll : async function() {
		return new Promise(function(resolve, reject) {

			
			
			conn.getDb().collection(_table).find().limit(10).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getAll1word : async function() {
		return new Promise(function(resolve, reject) {

			let query = { 
				"name":{$ne: '', $regex : /^[a-zA-Z0-9]\S+$/}
			};
			
			conn.getDb().collection(_table).find(query).limit(20).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},

	getlimitData : async function($limit) {
		return new Promise(function(resolve, reject) {

			let query = { 
				"name":{$exists:true, $ne: ''},
				"lead_status": true,
				"domain_generated": {$ne: true}
			};
			
			conn.getDb()
				.collection(_table)
				.find(query)
				.limit($limit)
				.sort( { "name": 1, "_id": 1 } )
				.toArray(function(err, result) {
					
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}

				});

		});
	},


	getById : async function(id) {
		return new Promise(function(resolve, reject) {

			let query = { _id: ObjectID(id) };
			
			conn.getDb().collection(_table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
	

	

	
	updateDetails: function(id,data) {

		
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