const _ = require('lodash');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
// const CONFIG = require('../config/config');
const saltRounds = 10;
const generator = require('generate-password');
const jwt = require('jsonwebtoken');
module.exports = {
    constructErrorMessage(error) {
        let errMessage = '';
        if (error.message) {
            errMessage = error.message;
        }
        if (error.errors && error.errors.length > 0) {
            errMessage = error.errors.map(function (err) {
                return err.message;
            }).join(',\n');
        }

        return errMessage;
    },
    getReqValues(req) {
        return _.pickBy(_.extend(req.body, req.params, req.query,req.files), _.identity);
    },
    generatePassword(length) {
        let password = generator.generate({
            length: length,
            numbers: true
        });
        return password;
    },
    password(pwd) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(pwd, salt);
        return hash;
    },
    updatePassword(pass) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(pass, salt);
        return hash;
    },
    comparePassword(pw, hash) {
        let pass = bcrypt.compareSync(pw, hash);
        return pass;
    },
    createToken(data) {
        let token = jwt.sign(data, CONFIG.JWT_SECRET, {
            expiresIn: CONFIG.JWT_TOKEN_EXPIRE
        });
        token = token.replace(/\./g, "ar4Jq1V");
        return token;
    },
    getUserIdFromToken(headers) {
        let token = headers['authorization'];
        // return new Promise(function (resolve, reject) {
            // jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function (err, result) {
            //     if (err) {
            //         resolve(err)
            //     } else {
            //         resolve(result)
            //     }
            // });
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
                console.log(err);
                if (err) {
                  return err
                }
                return req.user = result;
                })
        //})
    },
    getBrandData(Model,ClientId){
        let whereCodn = {};
        whereCodn['ClientId'] = ClientId;
        whereCodn['isDeleted'] = false;
        return new Promise(function (resolve, reject) {
            Model.ClientMaster.findOne({where:whereCodn}).then(function(response){
                if(response){
                    resolve(response)
                }else{
                    resolve([])
                }

            })
        })
    },

}