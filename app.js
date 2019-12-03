const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
// helmet, hpp: 서버의 각종 취약점을 보완
const helmet = require('helmet');
const hpp = require('hpp');
// RedisStore 객체 require. 뒤에 session인자 넣는 것 잊지말것.
// connect-redis는 express-session에 의존성이 있다.
const RedisStore = require('connect-redis')(session);
// winston: 로그파일 생성
const logger = require('./logger');
require('dotenv').config();

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models'); // 모델과 서버 연결
const passportConfig = require('./passport');

const app = express();
sequelize.sync(); // 모델과 서버 연결
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8001);
// 배포용 세팅(morgan)
if (process.env.NODE_ENV === 'production') { // 배포환경 세팅
    app.use(morgan('comgined')); // 더 많은 사용자 정보
    // helmet, hpp
    app.use(helmet());
    app.use(hpp());
} else { // 배포환경 아닐 때 세팅
    app.use(morgan('dev'));
}

//app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); //app.use(cookieParser('nodebirdsecret'));
// 배포용 세팅(express-session)
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        // secure: true; // https 적용이나 로드밸런싱(요청 부하 분산) 등을 위한 작업
        secure: false,
    },
    // session을 RedisStore에 저장. 옵션으로 .env에 저장했던 값들을 사용
    store: new RedisStore({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        pass: process.env.REDIS_PASSWORD,
        logErrors: true, // 레디스에 에러가 났을 때 콘솔에 표시할지를 결정.
    }),
};
if (process.env.NODE_ENV === 'production') {
    // https를 적용을 위해 노드 서버 앞에 다른 서버를 뒀을 때.
    sessionOption.proxy = true;
    // sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
/*
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,//'nodebirdsecret',
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));*/
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    // winston 로그파일 만들기
    logger.info('hello');
    logger.error(err.message);
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

/**
 * 추가사항
 * 1. 팔로잉 끊기(시퀄라이즈의 destroy 메서드와 라우터 활용)
 * 2. 프로필 정보 변경하기(시퀄라이즈의 update 메서드와 라우터 활용) + 삭제(탈퇴)
 * 3. 게시글 좋아요, 좋아요 취소(사용자-게시글 모델 간 N:M 관계 정립 후 라우터 사용)
 * 4. 게시글 삭제하기(등록자와 현재 로그인한 사용자가 같을 때, 시퀄라이즈 destroy 메서드와 라우터 활용) + 수정
 */