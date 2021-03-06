'use strict';
const { Model, DataTypes } = require('sequelize');

//Mainly copied from projects in unit 9 for model validation and requirements

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A first name is required"
        },
        notEmpty:{
          msg: "Please provide a first name"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A last name is required"
        },
        notEmpty:{
          msg: "Please provide a last name"
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "The email you entered already exists",
      },
      validate: {
        notNull: {
          msg: "An email is requried"
        },
        isEmail:{
          msg: "Please provide an email"
        }
      }
    },
    password: {
      type: DataTypes.STRING, //changed from virtual to string
      allowNull: false,
      validate: {
        notNull: {
          msg: "A password is required"
        },
        notEmpty:{
          msg: "Please provide password"
        },
        // len: {
        //   args: [8, 20],
        //   msg: "Your password isn't long enough"
        // }
      }
    },
  /*confirmedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val){
        if (val === this.password){
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('confirmedPassword', hashedPassword);
        }
        validate: {
          notNull: {
            msg: "Passwords must match"
          }
        }
      }
  *///  }

  //Assign association
  }, { sequelize });
  User.associate = (models) => {
      User.hasMany(models.Course, {
//        as: 'student', // alias
          foreignKey: {
            fieldName: 'userId',
            allowNull: false,
          },
      });
    };
  return User;
};
