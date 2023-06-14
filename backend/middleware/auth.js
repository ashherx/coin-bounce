const JWTService = require('../services/JWTService');
const User = require('../models/user');
const userDTO = require('../dto/user');

const auth = async (req, res, next) =>
{
    try 
    {
        //1. validate access and refresh token

    const {refreshToken, accessToken} = req.cookies;

    if (!refreshToken || !accessToken)
    {
        const error = 
        {
            status: 401,
            message: 'Unauthorized'
        }

        return next(error);

    }

    // the function will return payload and we are passing
    // id in payload at te time of login and registration
    // so we can destructure our id from this function as well
    // as this function is returning the payload

    let _id;
    try 
    {
        _id = JWTService.verityAccessToken(accessToken);
    
    } 
    catch (error) 
    {
        return next(error)    
    }


    let user;
    try 
    {
        user = await User.findOne({_id: _id});
    } 
    catch (error) 
    {
        return next(error);
    }

    userDTOFilter = new userDTO(user);

    req.user = userDTOFilter;

    next();    
    } 
    catch (error) 
    {
        return next(error); 
    }
}

module.exports = auth;