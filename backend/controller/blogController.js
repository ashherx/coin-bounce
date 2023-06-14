const Joi = require('joi');
const auth = require('../middleware/auth');
const fs = require('fs');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const { BACKEND_SERVER_PATH } = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');

const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {

    async create(req, res, next) {
        // 1. validate req body
        // 2. handle photo storage
        // 3. add to db
        // 4. return response

        // image from client side will be a
        // base64 encoded string -> decode -> store -> 
        // save photo's path into db

        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        });

        const { error } = createBlogSchema.validate();

        if (error) {
            return next(error);
        }

        const { title, author, content, photo } = req.body;

        // read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        // alot a random name
        const imagePath = `${Date.now()}-${author}`;
        //const imagePath2 = ''+Date.now()+'-'+author;

        // save locally
        try {
            fs.writeFileSync(`storage/${imagePath}.png`, buffer);
        }
        catch (error) {
            return next(error);
        }

        // save blog in db
        let newBlog;
        try {
            newBlog = new Blog({
                title: title,
                author: author,
                content: content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}.png`
            });

            await newBlog.save();
        }
        catch (error) {
            return next(error);
        }

        const blogDto = new BlogDTO(newBlog)
        return res.status(200).json({ blog: blogDto })
    },

    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({});

            const blogsDto = [];

            for (let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto);
            }

            return res.status(201).json({ blogs: blogsDto });
        }
        catch (error) {
            return next(error);
        }
    },

    async getById(req, res, next) {
        // vallidate id
        // return response

        const getByIdSchema = Joi.object
            (
                {
                    id: Joi.string().regex(mongoDbIdPattern).required()
                }

            );

        // we are sendind data in the parametersof the req i.e. in the URL
        // rather than the boody of req
        const { error } = getByIdSchema.validate(req.params);

        if (error) {
            return next(error);
        }

        let blog;

        const { id } = req.params;

        try {
            blog = await Blog.findOne({ _id: id }).populate('author');
        }
        catch (error) {
            return next(error);
        }

        const blogDetailsDto = new BlogDetailsDTO(blog);

        res.status(200).json({ blog: blogDetailsDto });
    },

    async update(req, res, next) 
    {
        // validate req body

        // check if we are updating photo or just the content/title
        // if we are updating the photo then we have to delete the previous photo
        // and store the new one

        //send response

        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            blogId: Joi.string().regex(mongoDbIdPattern).required(),
            photo: Joi.string()
        });

        const { error } = updateBlogSchema.validate(req.body);

        const { title, content, author, blogId, photo } = req.body;

        // check if we are updating photo
        // if yes, then delete prevois photo and save new one
        let blog;
        
        try 
        {
            blog = await Blog.findOne({ _id: blogId });

        }
        catch (error) 
        {
            return next(error);
        }


        if (photo) 
        {
            let previousPhoto = blog.photoPath;

            previousPhoto = previousPhoto.split('/').at(-1)


            // delete previous phoyo

            fs.unlinkSync(`storage/${previousPhoto}`);


            // save the new image
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

            // alot a random name
            const imagePath = `${Date.now()}-${author}`;
            //const imagePath2 = ''+Date.now()+'-'+author;

            // save locally
            try 
            {
                fs.writeFileSync(`storage/${imagePath}.png`, buffer);
            }
            catch (error) 
            {
                return next(error);
            }

            await Blog.updateOne
            (
                { _id: blogId },
                {
                    title: title,
                    content: content,
                    photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
                }
            )
        }
        else
        {
            await Blog.updateOne
            (
                {_id: blogId}, 
                {
                    title, content
                }
            )
        }

        return res.status(200).json({message: 'Blog updated!'});

    },

    async delete(req, res, next) 
    {
        // validte blog id
        // delete blog
        // delete associated comments if any
        
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongoDbIdPattern).required()
        });

        const {error} = deleteBlogSchema.validate(req.params);
        const {id} = req.params;

        let blog;
        
        try 
        {
            blog = await Blog.findOne({ _id: id });
            console.log(blog)

            let previousPhoto = blog.photoPath;

            previousPhoto = previousPhoto.split('/').at(-1)

            // delete previous phoyo

            fs.unlinkSync(`storage/${previousPhoto}`);

        }
        catch (error) 
        {
            return next(error);
        }

        

        try 
        {
            await Blog.deleteOne({_id: id});

            await Comment.deleteMany({blog: id});
        } 
        catch (error) 
        {
            return next(error);
        }

        return res.status(200).json({message: 'Blog Deleted!'});
    }


}




module.exports = blogController;