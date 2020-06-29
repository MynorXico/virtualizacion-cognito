const axios = require('axios');

const jwkToPem = require('jwk-to-pem');
const User = require('../models/user').User;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const jwt_decode = require('jwt-decode');

dotenv.config();


exports.validate = async (token) => {
    return new Promise(async(resolve, reject) => {
        var decoded = (jwt_decode(token));
        
        const cognito_url = `${decoded.iss}/.well-known/jwks.json`;

        console.log("Decoded: ", decoded);
        await axios.get(cognito_url)
            .then(({status, data}) => {
                pems = {};
                var keys = data.keys;
                for(var i = 0; i < keys.length; i++){
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = {kty: key_type, n: modulus, e: exponent};
                    var pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }

                var decodedJwt = jwt.decode(token, {complete: true});
            
                if(!decodedJwt){
                    reject({
                        "error": true,
                        "message": "Not a valid JWT token"
                    });
                }
                
                var kid = decodedJwt.header.kid;
                var pem = pems[kid];
                if(!pem){
                    reject({
                        "error": true,
                        "message": "Not a valid JWT token"
                    });
                }

                jwt.verify(token, pem, function(err, payload) {
                    if(err) reject({"success": false, "message": "Not a valid JWT token"})
                    var user = new User(payload);
                    resolve(user);
                })
            })
            .catch((e) => {
                reject(e);
            });
    });
}