const time   = require('./time');

let track = {};

//Generate an empty schedule
track.generator = theXDay => {
    this.track = {};
    this.track.sessions = [];
    this.track.timeUsed = 0;
    this.track.timeRemain = 0;

    let section = (theXDay ? global.config.session.section[theXDay] : false) || global.config.session.section.default;

    section.forEach(item => {
        let session = {};
        
        item = item.split(global.config.session.section.split);
        session.begin = item[0];
        session.end = item[1];
        session.finish = item[2];
        session.timeUsed = 0;
        session.timeRemain = time.duration(session.begin, session.end);
        session.talks = [];

        this.track.timeRemain += session.timeRemain;

        this.track.sessions.push(session);
    });

    return this.track;
}

//Schedule formatted printing
track.print = tracks => {
    tracks.forEach((track, idx) => {
        console.log(`${global.config.track.title} ${idx+1}:`);
        track.sessions.forEach(session => {
            session.talks.forEach(talk => {
                if (talk.type && talk.type === 'merged') {
                    talk.merged.forEach(data => {
                        console.log(`${time.militaryTimeTo12HrsClock(data.scheduled)} ${data.title} ${data.lightning}`);
                    });
                    console.log(`${time.militaryTimeTo12HrsClock(talk.relaxTime)} ${global.config.lightning.merge.break} ${global.config.lightning.merge.timeCost}${talk.unit}`);
                } else {
                    if (!!talk.lightning) {
                        console.log(`${time.militaryTimeTo12HrsClock(talk.scheduled)} ${talk.title} ${talk.lightning}`);
                    } else {
                        console.log(`${time.militaryTimeTo12HrsClock(talk.scheduled)} ${talk.title} ${talk.timeCost}${talk.unit}`);
                    }
                }
            });

            let limit = global.config.session.limit[session.finish];
            if (limit != undefined) {
                let lastTime = time.elapse(session.begin, session.timeUsed);
                let finishBeginTime = '';

                if (time.isExcess(lastTime, limit.noEarlier)) finishBeginTime = time.militaryTimeTo12HrsClock(lastTime);
                else finishBeginTime = time.militaryTimeTo12HrsClock(limit.noEarlier);

                console.log(`${finishBeginTime} ${session.finish}`);
            } else {
                console.log(`${time.militaryTimeTo12HrsClock(session.end)} ${session.finish}`);
            }
        });
        console.log();
    });
}

module.exports = track;
