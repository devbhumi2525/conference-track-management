let time = {};

//Convert the string time type into a structured time type, which is convenient for subsequent operations
let str2Obj = str => {
    let tmp = str.split(':');
    let obj = {};

    obj.hr = Number(tmp[0]);
    obj.min = Number(tmp[1]);

    if (obj.hr > 23 || obj.min > 59 || obj.hr < 0 || obj.min < 0) {
        throw new Error('Error[Illegal time]' + ` Hour[${obj.hr}]` + ` Minute[${obj.min}]`);
    }

    return obj;
}

//Calculate the number of minutes between two time points, such as 15 minutes difference between 18:00 and 18:15
time.duration = (begin, end) => {
    let oBegin = str2Obj(begin);
    let oEnd = str2Obj(end);
    let beginMinOffset;
    let endMinOffset;

    if ((oBegin.hr > oEnd.hr) || (oBegin.hr === oEnd.hr && oBegin.min > oEnd.min)) {
        throw new Error('Error[Illegal time]' + ` Start[${begin}]` + ` End[${end}]`);
    }

    if (oBegin.min === 0) {
        beginMinOffset = 0;
    } else {
        oBegin.hr += 1;
        beginMinOffset = 60 - oBegin.min;
    }
    if (oEnd.min === 0) {
        endMinOffset = 0;
    } else {
        oEnd.hr += 1;
        endMinOffset = 60 - oEnd.min;
    }

    return ((oEnd.hr - oBegin.hr) * 60) + beginMinOffset - endMinOffset;
}

// Given a time point, calculate the time point after the given number of minutes, such as 19:00 after 15 minutes to 19:15
time.elapse = (time, min) => {
    let oTime = str2Obj(time);

    oTime.min += min;

    while (oTime.min > 59 || oTime.min < 0) {
        if (oTime.min > 59) {
            oTime.min -= 60;
            oTime.hr += 1;
        } else if (oTime.min < 0) {
            oTime.min += 60;
            oTime.hr -= 1;
        }
    }

    if (oTime.min === 0) oTime.min = '00';
    if (oTime.hr > 23) console.log('Warning[More than one day]');

    return `${oTime.hr}:${oTime.min}`;
}

//Convert 24-hour clock to 12-hour clock, such as 14:00 is equivalent to 02:00PM
time.militaryTimeTo12HrsClock = time => {
    const AM = 'AM';
    const PM = 'PM';
    
    let oTime = str2Obj(time);
    let tag = '';

    if (oTime.hr >= 0 && oTime.hr < 12) {
        oTime.hr = `${oTime.hr}`;
        tag = AM;
    } else if (oTime.hr >= 12 && oTime.hr < 24) {
        if (oTime.hr === 12) {
            oTime.hr = 12;
        } else {
            oTime.hr = `${oTime.hr - 12}`;
        }
        tag = PM;
    } else {
        throw new Error('Error[Illegal time]' + ` Time[${time}]`);
    }

    if (oTime.min < 10) oTime.min = `0${oTime.min}`;
    if (oTime.hr < 10) oTime.hr = `0${oTime.hr}`;

    return `${oTime.hr}:${oTime.min}${tag}`;
}

//Determine whether time point A exceeds time point B. If 14:00 exceeds 13:00, return true, otherwise return false
time.isExcess = (current, noEarlier) => {
    let oCurrent = str2Obj(current);
    let oNoEarlier = str2Obj(noEarlier);

    if (oCurrent.hr > oNoEarlier.hr) return true;
    else if (oCurrent.hr === oNoEarlier.hr) {
        if (oCurrent.min > oNoEarlier.min) return true;
        else return false;
    } else return false;
}

module.exports = time;
