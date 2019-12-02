const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
/**
 * 회원가입 라우터. 
 * 1. 기존에 같은 이메일로 가입한 사용자가 있는지 조회
 * 2-1. 있다면 flash 메시지(경고, 알림) 후 회원가입 페이지로 리다이렉트
 * 2-2. 없다면 비밀번호를 암호화하고 사용자 정보를 생성.
 * > bcrypt.hash(password, 12); 에서 12는 암호화작업 12번개념. 적어도 12 최대 31로 설정가능.
 */
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다.');
            return req.redirect('/join');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});
/**
 * 로그인 라우터
 * passport.authenticate('local') 미들웨어가 로컬 로그인 전략(passport 모듈에서 정의된 개념-로그인방법)을 수행한다.
 * 미들웨어인데 라우터 미들웨어 안에 들어 있습니다. 미들웨어에 사용자 정의 기능을 추가하고 싶을 때 보통 이렇게 한다.
 * 이럴 때는 내부 미들웨어에 (req, res, next)를 인자로 제공하여 호출하면된다.
 * 
 * 전략 코드(strategies)는 잠시 후에 작성. 전략이 성공하거나 실패하면 authenticate 메서드의 콜백 함수가 실행.
 * 콜백 함수의 첫 번째 인자 값(authError)이 있다면 실패.
 * 두 번째 인자 값(user)
 */
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            req.flash('loginError', info.message);
            return res.redirect('/');
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next) 를 붙인다.
});

/**
 * 로그아웃 라우터
 * req.logout 메서드는 req.user 객체를 제거, 
 * req.session.destroy는 req.session 객체의 내용을 제거한다.
 * 세션 정보를 지운 후 메인 페이지로 되돌아간다.
 */
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

/**
 * 카카오 로그인 라우터(추가)
 * 회원가입을 따로 짤 필요 없고 카카오 로그인 전략이 대부분의 로직을 처리한다.
 */
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao',{
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;