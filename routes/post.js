const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
fs.readdir('uploads', (error) => {
    if (error) {
        console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        // 이미지를 업로드할 폴더가 없을 때 uploads 폴더를 생성
        fs.mkdirSync('uploads');
    }
});

/**
 * Multer 모듈에 옵션을 주어 upload 변수에 대입. upload는 미들웨어(single, array, fields, none)를 만드는 객체
 * multer.single : 이미지 하나는 req.file로, 나머지 정보는 req.body로
 * multer.array : 이미지들은 req.files로, 나머지 정보는 req.body로. 하나의 req.body에 이미지 여러 개 업로드
 * multer.fields : 이미지들은 req.files로, 나머지 정보는 req.body로. 여러개의 req.body에 이미지 하나씩 업로드
 * multer.none : 모든 정보를 req.body로 이미지를 올리지 않고 데이터만 multipart 형식으로 전송
 */
const upload = multer({
    // storage 옵션에는 파일 저장 방식과 경로, 파일명 등을 설정
    // multer.diskStorage를 사용해 이미지가 서버 디스크에 저장되도록 한다. 
    storage: multer.diskStorage({
        // destination 메서드로 저장 경로를 nodebird 폴더 아래 uploads 폴더로 지정
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        // filename 메서드로 기존 이름(file.originalname)에 업로드 날짜값(Date.now())과 기존 확장자(path.extname)를 붙이도록 설정.
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    // 최대 이미지 파일 용량 허용치(바이트 단위) 현재 10MB
    limits: { fileSize: 10 * 1024 * 1024 },
});

// 이미지 업로드 라우터. upload.single('img')에서 img는 이미지가 담긴 req.body 속성의 이름
// 이제 upload.single 미들웨어는 이 이미지를 처리하고 req.file 객체에 결과를 저장.
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});


// 게시글 업로드 라우터. 이미지(multipart 형식)를 전송하되 이미지 주소(req.body.url)만 전송. 이미지 데이터가 없기에 none 메서드 사용.
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {// 게시글을 데이터 베이스에 저장            
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id,
        });
        // https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/%EC%A0%95%EA%B7%9C%EC%8B%9D
        //게시글 내용에서 해시태그를 정규표현식으로 추출
        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if (hashtags) {
            // 추출한 해시태그들을 데이터베이스에 저장한 후, post.addHashtags 메서드로 게시글과 해시태그의 관계를 
            // PostHashtag 테이블에 넣는다.
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                where: { title: tag.slice(1).toLowerCase(0) },
            })));
            await post.addHashtags(result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 해시태그 검색 라우터
router.get('/hashtag', async (req, res, next) => {
    // 쿼리스트링으로 해시태그 이름 받는다.
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }
        return res.render('main', {
            title:`${query} | NodeBird`,
            user: req.user,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;
/**
 * 실제 서버 운영 시 AWS S3이나 Cloud Storage 같은 정적 파일 제공 서비스를 사용하여 이미지를 따로 저장하고 제공하는 것이 좋다.
 * 이를 사용하고 싶다면 multer-s3이나 multer-google-storage 같은 모듈을 찾아보면 된다.
 * 서버리스 노드에서 소개.
 */