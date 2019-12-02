// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'email', // default > username
        passwordField: 'password', // default > password
    }, async (email, password, done) => {
        try {
            // email 일치 확인
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {
                // 비밀번호 일치 확인
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    // 비밀번호 일치
                    done(null, exUser);
                } else {
                    // 비밀번호 불일치
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                // email 불일치
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.log(error);
            done(error);
        }
    }));
};