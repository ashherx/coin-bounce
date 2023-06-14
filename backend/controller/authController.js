// all business logic will be here

const Joi = require('joi');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
//const { request } = require('express');
//const userDto = require('../dto/user');
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token');
const { ACCESS_TOKEN_SECRET } = require('../config');


const authController = {
    async register(req, res, next) 
    {
        //STEPS:
        // 1. validate user input

        // vv Can also be called as DTO (data transfer object)

        const userRegistrationSchema = Joi.object
        ({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')

        });

        const {error} = userRegistrationSchema.validate(req.body);

        // 2. if error in validation then return via middleware for error handling
        if (error)
        {
            return next(error);
        }

        // 2.1 else if email or username already regstered then another error
        const {name, username, email, password} = req.body;

        try 
        {
            const emailInUse = await User.exists({email});
            const usernameInUse = await User.exists({username});

            if (emailInUse)
            {
                const error = {
                    status: 409,
                    message: 'Email already exists, use another email'
                }

                return next(error);
            }

            if (usernameInUse)
            {
                const error = {
                    status: 409,
                    message: 'Username already exists, use another username'
                }

                return next(error);
            }

        } 
        catch (error) 
        {
            return next(error);
        }

        
        // 2.2 else password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. store data in database

        let accessToken;
        let refreshToken;
        let user;

        try 
        {
            const userToRegister = new User(
                {
                    username: username,
                    email: email,      
                    name: name,
                    password: hashedPassword
                }
            );
    
            user = await userToRegister.save(); 

            //token generation

            accessToken = JWTService.signAccessToken({_id: user._id}, '30m');
            refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');


        } 
        catch (error) 
        {
            return next(error);
        }
               

        
        // store refresh token in database
        await JWTService.storeRefrehToken(refreshToken, user._id)


        // send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // reduce vulnerability of XSS attacks
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // reduce vulnerability of XSS attacks
        });

        // 4. show response
        const userDtoFilter = new UserDTO(user);

        return res.status(201).json({user: userDtoFilter, auth: true});


    },

    async login(req, res, next)
    {
        // 1. validate user input
        // 2. if validation error, show error
        // 3. match username and password
        // 4. return response

        const userLoginSchema = Joi.object(
            {
                username: Joi.string().min(5).max(30).required(),
                password: Joi.string().pattern(passwordPattern).required()
            }
        );

        const {error} = userLoginSchema.validate(req.body);

        if (error)
        {
            return next(error);
        }

        const {username, password} = req.body;

        let user;

        try 
        {
            user = await User.findOne({username: username});
            

            if(!user)
            {
                const error = {
                    status: 401,
                    message: "Invalid username"
                }

                return next(error);
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match)
            {
                const error = 
                {
                    status: 401,
                    message: "Invalid password"
                }

                return next(error);
            }

        } 
        catch (error) 
        {
            return next(error);
        }

        const accessToken = JWTService.signAccessToken({_id: user._id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');

        
        // update refresh token in database if finr a token against user id in db
        // create a new token entry in db if no token is found

        try 
        {
            await RefreshToken.updateOne(
            {
                _id: user._id,
    
            },
            {token: refreshToken},
            {upsert: true});
        } 
        catch (error) 
        {
            return next(error);
        }


        // send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // reduce vulnerability of XSS attacks
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // reduce vulnerability of XSS attacks
        });

        const userDtoFilter = new UserDTO(user);

        return res.status(200).json({user: userDtoFilter, auth: true});
 

    },

    async logout(req, res, next)
    {
        //1. delete refresh token from db
        const {refreshToken} = req.cookies;

        try 
        {
            await RefreshToken.deleteOne({token: refreshToken})
        } 
        catch (error) 
        {
            return next(error);
        }

        // 1.1 delete cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');


        //2. send response 
        res.status(200).json({user: null, auth: false});


    },

    async refresh(req, res, next)
    {
        //1. get refreshToken from cookies

        //can also be done by {refreshToken} = req.cookies
        //but isnce we need to regenerate token with the same vairable name
        // as refreshToken so we will change the below name to originalRefreshToken

        const originalRefreshToken = req.cookies.refreshToken;


        //2. verify refreshToken

        let id;
        try 
        {
            // we will get an object in response and we can access the _id
            // directly from it.
            id = JWTService.verityRefreshToken(originalRefreshToken)._id;
        } 
        catch (e) 
        {
            const error = 
            {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error)
        }

        try 
        {
           const match = RefreshToken.findOne({_id: id, token: originalRefreshToken});

           if (!match)
           {
                const error = 
                {
                    status: 401,
                    message: 'Unauthorized'
                }
                return next(error)
           }
        } 
        catch (error) 
        {
            return next(error)
        }

        
        //3. Generate new refreshToken
        
        try 
        {
            const accessToken = JWTService.signAccessToken({_id: id}, '30m');
            const refreshToken = JWTService.signRefreshToken({_id: id}, '60m');

            //4. update db

            await RefreshToken.updateOne({_id: id}, {token: refreshToken})
            
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true // reduce vulnerability of XSS attacks
            });
    
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true // reduce vulnerability of XSS attacks
            });
        }
        catch (error) 
        {
            return next(error);
        }

       
        //5. send response

        const user = await User.findOne({_id: id});

        const userDto = new UserDTO(user);

        res.status(200).json({user: userDto, auth: true});
    }
}


module.exports = authController;