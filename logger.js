const { createLogger, format, transports } = require('winston');
/**
 * winston 패키지의 createLogger 메서드로 logger를 만든다. 
 * 인자로 logger에 대한 설정을 넣을 수 있다. 
 * 설정으로는 level, format, transports 등이 있다.
 *  - level은 로그의 심각도를 의미. error, warn, info, verbose, debug, silly가 있다.
 *    심각도순(error가 가장 심각)이므로 위 순서를 찾고하여 기록하길 원하는 유형의 로그를 고르기
 *    info를 고른 경우, info보다 심각한 단계의 로그(error, warn)도 함께 기록된다.
 *  - format은 로그의 형식. json, label, timestamp, printf, simple, combine 등의 다양한 형식이 있다.
 *    기본은 JSON 형식으로 기록하지만 로그 기록 시간을 보려면 timestamp가 좋다. 
 *    combine은 여러 형식을 혼합해서 사용할 때 쓴다. 활용법이 다양하므로 공식 문서 참고.
 *  - transports는 로그 저장 방식을 의미. new transports.File은 파일로 저장한다는 뜻.
 *    new transports.Console은 콘솔에 출력한다는 뜻. 옵션 설정 가능.
 */
const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        new transports.File({ filename: 'combined.log' }),
        new transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;