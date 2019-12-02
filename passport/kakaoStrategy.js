const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID, // 카카오에서 발급해주는 아이디
        callbackURL: '/auth/kakao/callback', 
        // 카카오로부터 인증 결과를 받을 라우터 주소(Redirect Path 설정시 입력주소 http://localhost:8001/auth/kakao/callback)
        // 라우터 작성 시 이 주소를 사용.
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });
            if (exUser) {
                done(null, exUser); // 기존에 카카오로 로그인한 사용자 있는지 조회. 있으면 done 호출
            } else {
                const newUser = await User.create({ // 로그인 한 적이 없다면 회원가입 진행.
                    // 카카오에서 인증 후 callbackURL 주소로 accessToken, refreshToken과 profile을 보내준다.
                    // profile에는 사용자 정보가 들어있다.
                    // 카카오에서 보내주는 것이므로 데이터는 console.log 메서드로 확인. profile 객체에서 원하는 정보를 꺼내와 회원가입 진행.
                    email: profile._json && profile._json.kaccount_email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                done(null, newUser); // 사용자 생성 후 done 함수 호출
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};

/**
 * kakaoStrategy.js의 clientID 부분을 발급받아야 한다. 
 * 87a2ed72bd38a3d10c96118489d2a58b > .env 파일에 넣기
 */