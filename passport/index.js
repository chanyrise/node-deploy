const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ 
            where: {id},
        // 팔로우 기능 추가 후 추가된 코드. req.user를 바꾸기 위한 코드.
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as : 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    });
    local(passport);
    kakao(passport);
};