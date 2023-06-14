const Joi = require('joi');
const Comment = require('../models/comment');
const CommentDTO = require('../dto/comment');

const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;


const commentController = 
{
    async create(req, res, next)
    {
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required(),
            blog: Joi.string().regex(mongoDbIdPattern).required()
        });

        const {error} = createCommentSchema.validate(req.body);

        if (error)
        {
            return next(error);
        }

        const {content, author, blog} = req.body;

        let newComment;
        try 
        {
            newComment = new Comment({
                content: content,
                author: author,
                blog: blog

            });

            await newComment.save();
        } 
        catch (error) 
        {
            return next(error);
        }

        //return res.status(200).json({comment: newComment});
        return res.status(200).json({message: 'Comment created'});

    },

    async getById(req, res, next)
    {
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoDbIdPattern).required()
        });

        const {error} = getByIdSchema.validate(req.params);

        if (error)
        {
            return next(error);
        }

        const {id} = req.params;
        let comments;

        try 
        {
            comments = await Comment.find({blog: id}).populate('author');
        } 
        catch (error) 
        {
            return next(error);
        }

        let commentsDto = [];

        for (let i = 0; i<comments.length; i++)
        {
            commentsDto.push(new CommentDTO(comments[i]));
        }

        return res.status(200).json({data: commentsDto});


    }
}


module.exports = commentController;