const User = require('../../models/User');
const UserSession = require('../../models/UserSession');
const jwt = require('jsonwebtoken');
var verifyUser = require('../../middleware/Token').verifyUser;
const fs = require('fs');
var nodemailer = require('nodemailer');
var path = require('path');
var privateKey = fs.readFileSync('server/sslcert/server.key', 'utf8'); //privatekey for jwt

// TODO: Limit number of queries to these endpoints
// TODO: Async functionality
// TODO: Change logout to POST as it isn't idempotent

module.exports = (app) => {
  app.post('/api/account/signin', function (req, res) {

      var usn = req.body.usn;
      var password = req.body.password;

      console.log("USN: " + usn + " attempting to signIn.");

      if (!usn) {
        return res.status(400).send({
          success: false,
          message: 'Error: usn cannot be blank.'
        });
      }
      if (!password) {
        return res.status(400).send({
          success: false,
          message: 'Error: Password cannot be blank.'
        });
      }

      // Process data
      usn = ('' + usn).toUpperCase().trim();
      password = '' + password;

      // Search for user in db
      User.find({
        usn: usn,
        isDeleted: false
      }, (err, users) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: 'Error: Server Error.'
          });
        }
        if (users.length != 1) {
          return res.status(401).send({
            success: false,
            message: 'Error: Invalid'
          });
        }

        const user = users[0];
        if (!user.checkPassword(password)) {
          return res.status(401).send({
            success: false,
            message: 'Error: Invalid credentials.'
          });
        }

        // Otherwise correct user
        payload = {
          user_id: user._id,
          role: user.role
        };
        jwt.sign(payload, privateKey, {
          expiresIn: "2d"
        }, (err, token) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              success: false,
              message: 'Error: Server Error.'
            });
          }

          newSession = new UserSession();
          newSession.token = token;
          newSession.save((err, session) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: 'Error: Server error'
              });
            }
            console.log("JWT generated.");
            return res.status(200).send({
              success: true,
              message: 'Valid sign in',
              user_id: payload.user_id,
              token: token
            });
          });
        });
      });
    }), //end of sign in endpoint

    app.post('/api/account/:userID/changePassword', verifyUser, function (req, res) {
      var user_id = req.params.userID;
      var oldPassword = req.body.oldPassword;
      var newPassword = req.body.newPassword;

      if (!user_id) {
        return res.status(400).send({
          success: false,
          message: 'Error: userID not entered in parameters'
        });
      }
      if (!oldPassword) {
        return res.status(400).send({
          success: false,
          message: 'Error: old Password not entered in body'
        });
      }
      if (!newPassword) {
        return res.status(400).send({
          success: false,
          message: 'Error: new Password not entered in body'
        });
      }

      User.find({
        _id: user_id,
        isDeleted: false
      }, function (err, users) {
        if (err) {
          return res.status(500).send({
            success: false,
            message: 'Error: Server Error.'
          });
        }
        if (!users) {
          return res.status(400).send({
            success: false,
            message: 'User does not exist in DB.'
          })
        }
        var user = users[0];
        if (user.checkPassword(oldPassword, user.password)) {
          newPassword = user.generateHash(newPassword);
          User.findByIdAndUpdate({
            _id: user_id
          }, {
            $set: {
              password: newPassword
            }
          }, null, function (err) {
            if (err) {
              return res.status(500).send({
                success: false,
                message: 'Error: Server Error.'
              });
            } else {
              return res.status(200).send({
                success: true,
                message: 'User password changed',
              });
            }
          })
        } else {
          return res.status(400).send({
            success: false,
            message: "User has entered wrong password"
          })
        }
      })
    })

  app.post('/api/account/:userID/newPassword', verifyUser, function(req,res){
    if(!req.params.userID){
      return res.status(400).send({
        success: false,
        message: 'Error: userID not entered in parameters'
      });
    }
    if (!req.body.newPassword) {
      return res.status(400).send({
        success: false,
        message: 'Error: new Password not entered in body'
      });
    }
    User.findOneAndUpdate({
      _id:req.params.userID,
      password:""
    },{
      $set:{
        password: req.body.newPassword
      }
    },null, function(err, user){
      if(err){
        return res.status(500).send({
          success: false,
          message: "Error: Server error"
        });
      }
      if(!user){
        return res.status(404).send({
          success: false,
          message: "Error: User not found in DB"
        });
      }
      return res.status(200).send({
        success:true,
        message: 'User password changed'
      })
    })
  })

  app.get('/api/account/:userID/logout', verifyUser, function (req, res) {
      // GET http://localhost:8080/api/account/:userID/logout
      var user_id = req.params.userID;

      if (!user_id) {
        return res.status(400).send({
          success: false,
          message: 'Error: UserID parameter cannot be blank'
        });
      }

      UserSession.findOneAndRemove({
        token: req.token
      }, (err, session) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error"
          });
        }
        if (!session) {
          return res.status(400).send({
            success: false,
            message: "Error: Invalid."
          });
        }

        return res.status(200).send({
          success: true,
          message: 'User has been logged out'
        });
      });
    }), //end of logout endpoint

    app.get('/api/account/:userID/details', function (req, res) {
      // GET http://localhost:8080/api/account/:userID/details
      var user_id = req.params.userID;

      //Verify that userID is present as a parameter
      if (!user_id) {
        return res.status(400).send({
          success: false,
          message: 'Error: userID parameter cannot be blank'
        });
      }

      console.log("Request to access details of " + user_id);
      // Search for the user in the User model with his user_id
      User.find({
        _id: user_id
      }, (err, users) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error"
          });
        }

        if (users.length != 1) {
          return res.status(404).send({
            success: false,
            message: 'Error: User not found.'
          });
        }
        var user = users[0].toObject();
        delete user.password;
        delete user.isDeleted;
        delete user.__v;
        delete user.files;

        // Return a response with user data
        return res.status(200).send({
          success: true,
          message: "Details successfully retrieved",
          user: user
        });
      });
    }); //end of getDetails endpoint

  app.put('/api/account/:userID/basicInfo', verifyUser, function (req, res) {
    // PUT http://localhost:8080/api/account/:userID/basicInfo
    var user_id = req.params.userID;

    //Verify that userID is present as a parameter
    if (!user_id) {
      return res.status(400).send({
        success: false,
        message: 'Error: userID parameter cannot be blank'
      });
    }

    console.log("Request to update details of " + user_id);
    var update = req.body

    User.findOneAndUpdate({
        _id: user_id
      }, {
        basicInfo: Object.assign({}, update)
      },
      (err) => {

        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error"
          });
        } else {
          return res.status(200).send({
            success: true,
            message: "Details Updated!"
          });
        }
      })

  })

  app.post('/api/account/forgotPassword', function (req, res) {
    if (!req.body.USN) {
      return res.status(400).send({
        success: false,
        message: 'Error: SRN not sent in body'
      });
    }
    User.findOneAndUpdate({
      usn: req.body.USN
    }, {
      $set: {
        password: ""
      }
    }, null, function (err, user) {
      if (err) {
        return res.status(500).send({
          success: false,
          message: "Error: Server error"
        });
      }
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found in DB"
        })
      }
      if (!user.basicInfo.email) {
        return res.status(404).send({
          success: false,
          message: "User email not found in DB"
        })
      }
      var email = user.basicInfo.email;
      payload = {
        user_id: user._id,
        role: user.role
      };

      jwt.sign(payload, privateKey, {
        expiresIn: "1d"
      }, (err, token) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            success: false,
            message: 'Error: Server Error.'
          });
        }

        newSession = new UserSession();
        newSession.token = token;
        newSession.save((err, session) => {
          if (err) {
            return res.status(500).send({
              success: false,
              message: 'Error: Server error'
            });
          }
          console.log("JWT generated for forgot password.");
          var link = 'http://localhost:8080/reset/'+ user._id.toString() + '/' + token;
          fs.readFile(path.join(process.cwd(), 'server/mailTemplates/forgotPassword.txt'), 'utf8', function (err, data) {
            if (err) {
              return res.status(500).send({
                success: false,
                message: 'Error: Server error'
              });
            }
            var emaildata = data.toString();
            emaildata = emaildata.replace("{username}", user.name.firstName);
            emaildata = emaildata.replace("{link}", link);

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'alcodingofficial@gmail.com',
                pass: 'Alcoding2018'
              }
            });

            var mailOptions = {
              from: 'alcodingofficial@gmail.com',
              to: email,
              subject: 'Password Reset Link for Alcoding account',
              text: emaildata
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
                return res.status(500).send({
                  success: false,
                  message: "Error: Server error"
                });
              } else {
                console.log('Email for password reset sent: ' + info.response);
                return res.status(200).send({
                  success: true,
                  message: "Email sent to " + email
                })
              }
            });
          })
        });
      });
    })
  })
};
