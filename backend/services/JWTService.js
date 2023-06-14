const jwt = require('jsonwebtoken');
const { models } = require('mongoose');
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require('../config/index');
const RefreshToken = require('../models/token');


class JWTService
{
    // sign access token
    static signAccessToken(payload, expiryTime)
    {
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime});
    }

    // sign refresh token
    static signRefreshToken(payload, expiryTime)
    {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: expiryTime});
    }

    // verify access token
    static verityAccessToken(token)
    {
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    }

    // verify access token
    static verityRefreshToken(token)
    {
        return jwt.verify(token, REFRESH_TOKEN_SECRET)
    }

    // store refresh token
    static async storeRefrehToken(token, userID)
    {
        try 
        {
            const newToken = new RefreshToken 
            (
                {
                    token: token,
                    userId: userId
                }
            )

            await newToken.save();
        } 
        catch (error) 
        {
            console.log(error);
        }
    }


}

module.exports = JWTService;