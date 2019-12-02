require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'nodebird',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorsAliases: 'false',
    },
    production: {
        username: 'root',
        // DB 비밀번호 .env 파일에 저장해서 불러오기(보안)
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'nodebird',
        host: '127.0.0.1',
        dialect:'mysql',
        operatorsAliases:'false',
        logging: false, // SQL문 콘솔에 노출 막는 옵션
    },
};