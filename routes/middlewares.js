/**
 * Passport 모듈은 req 객체에 isAuthenticated 메서드를 추가한다. 
 * 로그인 중이면 req.isAuthenticated()가 true이고, 아니면 false이다.
 * 로그인 여부 파악 가능.
 */

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}