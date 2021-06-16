let _table = process.env.TBLEXT + "classes";
let conn = require('../config/DbConnect');

// dirty connection MYSQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : process.env.DBHOST,
	user     : process.env.DBUSER,
	password : process.env.DBPASS,
	database : process.env.DBNAME
});

module.exports = {

    getAll : async function() {
        
        return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM trademark_classes',function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},

	getAllSearch : async function(searchTerm) {
        
        return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM class_descriptions WHERE description like "%_'+searchTerm+'_%"',function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},

	getAllSearchId : async function(searchTerm) {
        
        return new Promise(function(resolve, reject) {
			connection.query('SELECT * FROM class_descriptions WHERE trademark_class_id = '+searchTerm,function(err,res,fields) {
				if (err) {
					reject(err);
			} else {
					resolve(res);
			}
			});
		});
        
	},
};