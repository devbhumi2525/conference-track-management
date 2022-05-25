const ai     = require('./lib/ai');
const util   = require('./lib/util');
const time   = require('./lib/time');
const track  = require('./lib/track');
const reader = require('./lib/reader');

const cfgArg     = ['--cfg', '-c'];
const cfgLength  = 2;
const cfgDefault = './config/config.js';

let idx;
let cfg;
let argv = process.argv.slice(2);
for (let i = 0; i < cfgArg.length; i++) {
    idx = argv.indexOf(cfgArg[i]);
    if (idx != -1) break;
}
if (idx != -1) {
    let cfgFile = argv[idx+1];
    if (!cfgFile) throw new Error('Error[Please set the config file]');
    cfg = util.path.getRightPath(new Array(cfgFile))[0];
    argv.splice(idx, cfgLength);
} else cfg = cfgDefault;

global.config = require(cfg);

let files = util.path.getRightPath(argv);
reader.getTalkList(files).then(talkList => {
   let talks = util.array.merge(talkList);
    talks = util.talk.str2Obj(talks);

    let tracks = [];
    let maxDays = global.config.limit.maxDays || true; 

    while (talks.length && (maxDays === true ? true : tracks.length < maxDays)) {
        this.track = track.generator(tracks.length + 1);

        this.track.sessions.forEach(session => {
            let idxs = ai.dp.kp.zeroOne(talks, session.timeRemain);
            if (idxs[0] === undefined && idxs.length != 0) {
                idxs = [];
                talks = [];
            }

            let mark = session.begin;
            idxs.forEach(idx => {
                let talk = talks[idx];
                talk.scheduled = mark;
                mark = time.elapse(mark, talk.timeCost);

                if (talk.type === 'merged') {
                    let tmp = talk.scheduled;
                    talk.merged.forEach((item, idx) => {
                        item.scheduled = tmp;
                        tmp = time.elapse(tmp, item.timeCost);
                        if ((idx+1) === talk.merged.length) talk.relaxTime = tmp;
                    });
                }

                session.talks.push(talk);
                session.timeUsed += talk.timeCost;
                session.timeRemain -= talk.timeCost;
                delete talks[idx];
            });

            talks = util.array.clear(talks);
            this.track.timeUsed += session.timeUsed;
        });

        if (this.track.timeUsed) tracks.push(this.track);
    }

    track.print(tracks);
}).catch(err => {
    console.log(`Error[${err}]`);
});
