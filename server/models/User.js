const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({  
  name: {
    firstName: {
      type: String,
      default: ""
    },
    lastName: {
      type: String,
      default: ""
    }
  },
  usn: {
    type: String,
    default: "",
    required: true
 },
  
  basic_info :{
   email: {
    type: String,
    default: ""
  },
  DisplayName: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },

  dob: {
    type: Date
  },
  password: {
    type: String,
    // required: true,
    default: ""
  },
  timestamp: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  },
  role: {
    type: String,
    default: "student"
  },
  isDeleted: {
    type: Boolean,
    default: false
  }}
});

// const saltRounds = 10;
// UserSchema.methods = {
//   generateHash: function generateHash(plainTextPassword) {
//     var generatedHash = "";
//     bcrypt.hash(plainTextPassword, saltRounds).then(function (hash) {
//       generatedHash = hash;
//     });
//     console.log(plainTextPassword + "-->" + generatedHash);
//     return generatedHash;
//   },
//   checkPassword: function (plainTextPassword) {
//     return bcrypt.compare(plainTextPassword, this.password).then(function (res) {
//       return res;
//     });
//   }
// };

// module.exports = mongoose.model('User', UserSchema);

const saltRounds = 10;
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds), null);
};

UserSchema.methods.checkPassword = function (plainTextPassword) {
  return bcrypt.compareSync(plainTextPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);
