// 다른 사용자를 팔로우할 수 있는 /user/:id/follow 라우터
const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        // 팔로우 할 사용자 데이터베이스에서 조회
        const user = await User.findOne({ where: { id: req.user.id } });
        // 현재 로그인한 사용자와의 관계 지정, 아래 메서드는 시퀄라이즈에서 추가한 메서드.
        await user.addFollowing(parseInt(req.params.id, 10));
        res.send('success');    
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;

// 팔로잉 관계가 생겼으므로 req.user에도 팔로워와 팔로잉 목록을 저장. 
// req.user를 바꾸려면 deserializeUser를 조작해야 한다. > passport/index.js