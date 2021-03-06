var mysql = require('mysql');
var randomstring = require("randomstring");
var sha1 = require('sha1');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'default'
});

exports.initDatabase = function(req,res)
{
	connection.query('CREATE DATABASE IF NOT EXISTS clutch', function(err){
		if(err){
			console.log("ERROR: " + err.message);
			throw err;
		}
		connection.query('USE clutch', function(err){
			if(err){
				console.log("ERROR: " + err.message);
				throw err;
			}
			createTables();
		});
	});
}

createTables = function()
{
	connection.query(
		'CREATE TABLE IF NOT EXISTS projects('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'name VARCHAR(50),'
		+ 'authorid INT,'
		+ 'passkey VARCHAR(50)'
		+ ');',function(err){
		if(err){
			console.log('query1 error: ' + err);
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS users('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'fname VARCHAR(50),'
		+ 'lname VARCHAR(50),'
		+ 'username VARCHAR(50),'
		+ 'phone VARCHAR(15),'
		//+ 'passwords VARCHAR(50),'       //new column		//new column, password was taken out.
		+ 'salt VARCHAR(50),'
		+ 'hashe VARCHAR(50),'
		+ 'email VARCHAR(50)'
		+ ');',function(err){
		if(err){
			throw err;
		}
	});

	// connection.query(
	// 	'CREATE TABLE IF NOT EXISTS tasks('
	// 	+ 'id INT NOT NULL AUTO_INCREMENT,'
	// 	+ 'PRIMARY KEY(id),'
	// 	+ 'userid INT,'
	// 	+ 'shotid INT'
	// 	+ ');',function(err){
	// 	if(err){
	// 		throw err;
	// 	}
	// });

	connection.query(
		'CREATE TABLE IF NOT EXISTS shots('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'frames INT,'
		+ 'description VARCHAR(500),'
		+ 'name VARCHAR(20),'
		+ 'sequenceid INT'//,'
		//+ 'projectid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS announcements('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'authorid INT,'
		+ 'projectid INT,'
		+ 'message VARCHAR(500),'
		+ 'time DATETIME'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS sequences('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'name VARCHAR(20),'
		+ 'projectid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS notes('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'note VARCHAR(500),'
		+ 'shotid INT,'
		+ 'type VARCHAR(20),'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS members('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'projectid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS lighters('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		//+ 'projectid INT,'
		+ 'shotid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS renderwranglers('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		//+ 'projectid INT,'
		+ 'shotid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	connection.query(
		'CREATE TABLE IF NOT EXISTS vfx('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		//+ 'projectid INT,'
		+ 'shotid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	/*connection.query(
		'CREATE TABLE IF NOT EXISTS shotdressers('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		+ 'projectid INT,'
		+ 'shotid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});*/

	connection.query(
		'CREATE TABLE IF NOT EXISTS animators('
		+ 'id INT NOT NULL AUTO_INCREMENT,'
		+ 'PRIMARY KEY(id),'
		//+ 'projectid INT,'
		+ 'shotid INT,'
		+ 'userid INT'
		+ ');',function (err){
		if(err){
			throw err;
		}
	});

	console.log("all tables created");
}

exports.validateUser = function(req,res){

	connection.query(
		'select * from users '
		+ 'where username=\'' + req.body.username + '\';',
		function (err,rows,fields){
			if(err){
				console.log('error validatUser query');
				throw err;
			}
			if(JSON.stringify(rows) === '[]')
			{
				res.end(JSON.stringify(rows));
			}
			else
			{
				//console.log(JSON.stringify(rows));
					//console.log(rows[0].username);
					var salt = rows[0].salt;
					var h = rows[0].hashe;
					var compare = sha1(req.body.password + salt);
					if(compare == h)
					{
						res.end(JSON.stringify(rows));
					}
					else
					{
						res.end('[]');
					}

			}
			//console.log("AFTER ROWS");
			//res.end(JSON.stringify(rows));
		}
	);
}
exports.validateProject = function(req,res){
	connection.query(
		'select * from projects '
		+ 'where name=\'' + req.body.name + '\';',
		function (err,rows,fields){
			if(err){
				console.log('error validateProject query');
				throw err;
			}
			res.end(JSON.stringify(rows));
		}
	);
}

exports.createUser = function(req, res){
	var salt=randomstring.generate(4);
	var newstring = req.body.password + salt;
	var hash = sha1(newstring);

	connection.query
	(
		'INSERT INTO users (fname, lname, username, salt, hashe, email, phone)' +
		'VALUES (\''+req.body.fname+'\', \''+req.body.lname+'\', \''+req.body.username+'\', \''+salt+'\', \''+hash+'\', \''+req.body.email+'\',\''+req.body.phone+'\');',
		function (err,rows,fields){
			if(err){
				console.log('error createuser query');
				throw err;
			}
			// res.end(JSON.stringify(rows));
		}
	);
}

exports.createSequence = function(req, res){
	connection.query
	(
		'INSERT INTO sequences (name, projectid)' +
		'VALUES (\''+req.body.name+'\', \''+req.body.projectid+'\');',
		function (err,rows,fields){
			if(err){
				console.log('error addSequence query');
				throw err;
			}
			res.end(JSON.stringify(rows));
		}
	);
}

exports.createProject = function(req,res){

	connection.query(
		'INSERT INTO projects (name, authorid, passkey)'
		+ ' VALUES (\'' + req.body.name + '\', ' + req.body.userid + ', \'' + req.body.passkey + '\');',
		function(err,rows,fields){
			if(err){
				console.log('error createProject query');
				throw err;
			}
			else{
				//Second query to add author to member table
				connection.query(
					'INSERT INTO members (projectid, userid) SELECT id, \'' 
					+ req.body.userid + '\' FROM projects WHERE name=\'' + req.body.name + '\';',
					function(err,rows,fields){
						if(err){
							throw err;
						}
					}
				)
			}
			res.end(JSON.stringify(rows));
		}
	);

}

exports.getProjects = function(req,res){
	connection.query(
		'select projects.id,projects.name '
		+ 'from projects inner join members '
		+ 'on members.userid=' + req.body.userid + ' and members.projectid=projects.id;',
		function(err,rows){
			if(err){
				console.log('error getProjects query');
				throw err;
			}
			res.end(JSON.stringify(rows));
		}
	);
}

exports.addProject = function(req,res){
	connection.query(
		'INSERT INTO members (projectid, userid)'
		+ ' SELECT id, \'' + req.body.userid + '\' FROM projects WHERE name=\'' 
		+ req.body.name + '\' AND passkey=\'' + req.body.passkey + '\';',

		function(err,rows,fields){
			if(err){
				console.log('error addProject query');
				throw err;
			}
			res.end(JSON.stringify(rows));
		}
	);
}

exports.getAnnouncements = function (req,res) {
	connection.query(
		'select * from announcements '
		+ 'where projectid=' + req.body.projectid + ';',
		function(err,announcements){
			if(err){
				console.log('error getAnnouncements query');
				throw err;
			}
			res.end(JSON.stringify(announcements));
		}
	);
}

exports.getSequences = function (req,res) {
	connection.query(
		'select * from sequences '
		+ 'where projectid=' + req.body.projectid + ';',
		function(err,sequences){
			if(err){
				console.log('error getSequences query');
				throw err;
			}
	 		res.end(JSON.stringify(sequences));
		}
	);
}

exports.getShots = function(req,res){
	connection.query(
		'select shots.* from shots inner join sequences '
		+ 'on sequences.projectid='+req.body.projectid+' and shots.sequenceid=sequences.id;',
		function(err,shots){
			if(err){
				console.log('error getShots query');
				throw err;
			}
			res.end(JSON.stringify(shots));
		}
	);
}

exports.getAnimators = function(req,res){
	connection.query(
		'select animators.shotid,users.fname,users.lname,users.id from users inner join animators inner join shots inner join sequences '
		+ 'on animators.shotid=shots.id and users.id=animators.userid and shots.sequenceid=sequences.id and sequences.projectid='+ req.body.projectid +';',
		function(err,animators){
			if(err){
				console.log('error getAnimator query:'+JSON.stringify(animators));
				throw err;
			}
			res.end(JSON.stringify(animators));
		}
	);
}

exports.getLighters = function(req,res){
	connection.query(
		// 'select lighters.shotid,users.fname,users.lname,users.id from users inner join lighters '
		// + 'on lighters.projectid='+req.body.projectid+ ' and users.id=lighters.userid;',
		'select lighters.shotid,users.fname,users.lname,users.id from users inner join lighters inner join shots inner join sequences '
		+ 'on lighters.shotid=shots.id and users.id=lighters.userid and shots.sequenceid=sequences.id and sequences.projectid='+ req.body.projectid +';',
		function(err,lighters){
			if(err){
				console.log('error getLighters query:'+JSON.stringify(lighters));
				throw err;
			}
			res.end(JSON.stringify(lighters));
		}
	);
}

exports.getWranglers = function(req,res){
	connection.query(
		'select renderwranglers.shotid,users.fname,users.lname,users.id from users inner join renderwranglers inner join shots inner join sequences '
		+ 'on renderwranglers.shotid=shots.id and users.id=renderwranglers.userid and shots.sequenceid=sequences.id and sequences.projectid='+ req.body.projectid +';',
		function(err,renderwranglers){
			if(err){
				console.log('error getWranglers query:'+JSON.stringify(renderwranglers));
				throw err;
			}
			res.end(JSON.stringify(renderwranglers));
		}
	);
}

exports.getFX = function(req,res){
	connection.query(
		'select vfx.shotid,users.fname,users.lname,users.id from users inner join vfx inner join shots inner join sequences '
		+ 'on vfx.shotid=shots.id and users.id=vfx.userid and shots.sequenceid=sequences.id and sequences.projectid='+ req.body.projectid +';',
		function(err,vfx){
			if(err){
				console.log('error getFX query:'+JSON.stringify(vfx));
				throw err;
			}
			res.end(JSON.stringify(vfx));
		}
	);
}

exports.getNotes = function(req,res){
	connection.query(
		'select users.fname,users.lname,notes.note from notes inner join users '
		+ 'on notes.userid=users.id and notes.type=\'' + req.body.type +'\' and shotid=' + req.body.shotid + ';',
		function(err,notes){
			if(err){
				console.log('error getNotes query');
				throw err;
			}
			res.end(JSON.stringify(notes));
		}
	);
}

exports.postAnnouncement = function(req,res){
	connection.query(
		'INSERT INTO announcements(authorid,projectid,message,time) '
		+ 'VALUES(' + req.body.authorid + ',' + req.body.projectid + ',\'' + req.body.message + '\',NOW());',
		function(err){
			if(err){
				console.log('error postAnnouncement query');
				throw err;
			}
			connection.query(
				'select * from announcements '
				+ 'where projectid=' + req.body.projectid + ';',
				function(err,announcements){
					if(err){
						console.log('error getAnnouncements query');
						throw err;
					}
					res.end(JSON.stringify(announcements));
				}
			);
		}
	);
}