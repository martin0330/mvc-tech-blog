const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment, Vote, Downvote } = require('../../models');

// get all users
router.get('/', (req, res) => {
    Post.findAll({
        attributes: [
            'id',
            'title',
            'post_body',
            [sequelize.literal('((SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id) - (SELECT COUNT(*) FROM Downvote WHERE post.id = Downvote.post_id))'), 'vote_count']
        ],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id',
            'title',
            'post_body',
            [sequelize.literal('((SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id) - (SELECT COUNT(*) FROM Downvote WHERE post.id = Downvote.post_id))'), 'vote_count']
        ],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {
    Post.create({
        title: req.body.title,
        post_body: req.body.post_body,
        user_id: req.session.user_id
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


router.put('/vote', (req, res) => {
    if (req.session) {
        Post.vote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
            .then(updatedVoteData => res.json(updatedVoteData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
});

router.put('/downvote', (req, res) => {
    if (req.session) {
        Post.downvote({ ...req.body, user_id: req.session.user_id }, { Downvote, Comment, User })
            .then(updatedDownvoteData => res.json(updatedDownvoteData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
});

router.put('/:id', (req, res) => {
    Post.update(
        {
            title: req.body.title,
            post_body: req.body.post_body,
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/:id', (req, res) => {
    console.log('id', req.params.id);
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;