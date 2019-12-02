const express = require('express');
// 추가
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
// 메인 페이지와 게시글을 함께 로딩
const { Post, User } = require('../models');

const router = express.Router();
/* middleware 적용 전
router.get('/profile', (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird', user: null});
});

router.get('/join', (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: null,
        joinError: req.flash('joinError'),
    });
});

router.get('/', (req, res, next) => {
    res.render('main',{
        title: 'Nodebird',
        twits:[],
        user: null,
        loginError: req.flash('loginError'),
    });
});
*/
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird', user: req.user });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});
/* 메인 페이지 로딩 시 메인 페이지와 게시글을 함께 로딩 기능 추가 전
router.get('/',(req, res, next) => {
    res.render('main', {
        title: 'NodeBird',
        twits: [],
        user: req.user,
        loginError: req.flash('loginError'),
    });
});
*/
router.get('/', (req, res, next) => {
    Post.findAll({
        include: {
            model: User,
            attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
    })
        .then((posts)=>{
            res.render('main',{
                title: 'NodeBird',
                twits: posts,
                user: req.user,
                loginError: req.flash('loginError'),
            });
        })
        .catch((error) => {
            console.error(error);
            next(error);
        });
});

module.exports = router;