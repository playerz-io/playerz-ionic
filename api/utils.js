'use strict'
exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.diffArray = (fstArray, sndArray) => {

    let diff = fstArray
        .filter(element => sndArray.indexOf(element) < 0)
        .concat(sndArray.filter(element => fstArray.indexOf(element) < 0));

    return diff;
};
