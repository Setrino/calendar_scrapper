var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var async = require('async');
var file = '';
var timetable = [];
var iCalEvent = require('icalevent');
var fs = require('fs');

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

courses = {
    //'bac1p' : 13274
    //'bac2p' : 13265
    //'bac3p_bm' : 13294
    'bac3p_ep' : 13259
};

dates = {
    'Monday'    : '2016-02-22',
    'Tuesday'   : '2016-02-23',
    'Wednesday' : '2016-02-24',
    'Thursday'  : '2016-02-25',
    'Friday'    : '2016-02-26'
}

var courseIds = Object.keys(courses);

function perCourse(courseId, callback) {
    var course = courses[courseId];
    file = courseId;
    //var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=' + course;
    var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=' + course;    // exams

    request(url, (function(course) { return function(err, resp, body) {
        $ = cheerio.load(body);

        $('#content-core .list').each(function(day){

            var html = $(this).html().trim().replace(/\s\s+|\r\n|\n|\r|<.?div>|<!--.+-->/gm, '');

            var event = $(this).text().trim().replace(/\s\s+/g, ' ').split(" ");

            if(event.length > 1){
                tableLoop(html, days[day], course, function(){});
                //recursiveEvents(null, '', event, course, days[day], function(){});
            }
        }), callback();
    }})(courseId));
}

async.each(courseIds, perCourse, function (err) {
    // Executed after for loop finished;
    writeToJSON();
    writeToICAL();
    writeToICAL('A');
    writeToICAL('B');
    //writeToICAL('C');
});


//Lecture Object
//dublicate - array for dublicate elements. [location, group]
function Lecture(day, course, time, value){

    this.day = day;
    this.time_start = time;
    this.time_end = time;
    this.lecture_name = value;
    this.location = value;
    this.group = value;
    this.period = value;
    this.year = course;
    this.lecturer = value;
    this.details = value;
    this.dublicate = value;
}

//current - current event object, lecture
//string - temporary string for the searched path
//array - event array
//callback - function

function checkRoom(string){
    var temp = string.toLowerCase();
    return temp.match(/amphi|inter|anthr|géop/i) && !temp.match(/!!!/) && !temp.match(/!!/);
}

function checkLecturer(string){

    return string.match(/[a-z]+\./i) || string.match(/poste/i);
}

Lecture.prototype = {

    setTime_Start : function(time){

        this.time_start = time;
    },

    setTime_End : function(time){

        this.time_end = time;
    },

    setLecture_Name : function(lecture){

        if(this.lecture_name == null){
            this.lecture_name = lecture;
        }
    },

    setLocation : function(location){

        if(this.location != null){
            this.dublicate = [location];
        }else{
            this.location = location;
        }
    },

    setGroup : function(group){

        if(this.group != null){
            this.dublicate.push(group);
        }else{
            this.group = group;
        }
    },

    setPeriod: function(period){

        this.period = period;
    },

    setLecturer: function(lecturer){

        this.lecturer = lecturer;
    },

    setDetails: function(details){

        this.details = details;
    },

    copy: function(lecture){
        this.day = lecture.day;
        this.time_start = lecture.time_start;
        this.time_end = lecture.time_end;
        this.lecture_name = lecture.lecture_name;
        //this.location = lecture.location;
        //this.group = lecture.group;
        this.period = lecture.period;
        this.year = lecture.year;
        this.lecturer = lecture.lecturer;
        this.details = lecture.details;
        this.dublicate = lecture.dublicate;
    }
}

//Object, current string, array fo elements, course, day, finished callback
function recursiveEvents(current, string, array, course, day, callback){

    var lectureT = current;

    if(array.length == 0 && string == ''){

        callback();
    }else{

        if(current == null){

            lectureT = new Lecture(day, course, 0, null);
            //timetable.push(lectureT);
        }

        string = (string == '') ? string + array.shift() : string + ' ' + array.shift();

        if(string.match(/[a-z]+\.+[a-z]+\//i)){

        }

        if(checkRoom(string)){
            lectureT.setLocation(string);
            recursiveEvents(lectureT, '', array, course, day, callback);
        }else if(string.match(/Semaine/)){
            if(string.match(/8-14:/)){
                string += ' ' + array.shift() + array.shift();
                lectureT.setDetails(string);
                recursiveEvents(lectureT, '', array, course, day, callback);
            }else{
                recursiveEvents(lectureT, string, array, course, day, callback);
            }
            //Set time
        }else if(/\d/g.test(string) && /:/.test(string)){

            if(string.match(/!!!/)){
                if(array[0].match(/[a-z]+\./i)){
                    lectureT.setDetails(string);
                    recursiveEvents(lectureT, '', array, course, day, callback);
                }else{
                    recursiveEvents(lectureT, string, array, course, day, callback);
                }
            }else{
                if(array[0] == '-'){
                    lectureT.setTime_Start(string);
                }else{
                    lectureT.setTime_End(string);
                }
                recursiveEvents(lectureT, '', array, course, day, callback);
            }
        }else if(string.match(/Automne|Printemps/i)){

            lectureT.setPeriod(string);
            recursiveEvents(lectureT, '', array, course, day, callback);
        }else if(string.match(/groupe/i) && !string.match(/de/i)){
            if(string.length == 6 && !array[0].match('ayant')){
                string += ' ' + array.shift();
                lectureT.setGroup(string);
            }else{
                if(string.match('par')){
                    lectureT.setDetails(string);
                    recursiveEvents(lectureT, '', array, course, day, callback);
                }else if(string.match('ayant') || array[0].match('ayant')){
                    if(checkLecturer(array[0])){
                        lectureT.setDetails(string);
                        recursiveEvents(lectureT, '', array, course, day, callback);
                    }else{
                        recursiveEvents(lectureT, string, array, course, day, callback);
                    }
                }else{
                    var tempS = string.split(' ').pop();
                    var string = string.substring(0, string.length - 7);
                    tempS += ' ' + array.shift();
                    lectureT.setGroup(tempS);
                    lectureT.setDetails(string);
                }
            }
            recursiveEvents(lectureT, '', array, course, day, callback);
            //Lecturer's name
        }else if(checkLecturer(string)){

            if(string.match(/poste/)){
                if(string.match(/externe/)){
                    lectureT.setLecturer(string);
                    timetable.push(lectureT);
                    recursiveEvents(null, '', array, course, day, callback);
                }else{
                    recursiveEvents(lectureT, string, array, course, day, callback);
                }
            }else if(string.match('M.Schmid')){
                lectureT.setLecturer(string + ' ' + array.shift());
                timetable.push(lectureT);
                recursiveEvents(null, '', array, course, day, callback);
            }else if(string.match(/\.+\s+[a-z]/i) && array.length > 1 && checkLecturer(array[0])){
                lectureT.setDetails(string);
                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(string.match(/-/)){
                recursiveEvents(lectureT, string, array, course, day, callback);
            }else{
                if(string.match(/\.+/) && string.length < 6){
                    recursiveEvents(lectureT, string, array, course, day, callback);
                }else{
                    lectureT.setLecturer(string);
                    if(lectureT.dublicate != null){
                        var tempObject = {};
                        for (var prop in lectureT) {
                            tempObject[prop] = lectureT[prop];
                        }
                        tempObject.location = lectureT.dublicate[0];
                        tempObject.group = lectureT.dublicate[1];
                        delete tempObject.dublicate;
                        timetable.push(tempObject);
                    }
                    delete lectureT.dublicate;
                    timetable.push(lectureT);
                    recursiveEvents(null, '', array, course, day, callback);
                }
            }
        }else if(string.match(/Analyse/) && array[0].match(/macro/)){

                recursiveEvents(lectureT, string, array, course, day, callback);
        // Check Details
        }else if(string.match(/^[a-z0-9àÀ-ÿ\-\ '!@#\$%\^\&*\)\(+=., ]+$/i)){

            //console.log(string);

            if(string.toLowerCase().match(/semaine/)){
                //console.log(string);
            }

            if(string.match(/-/) && string.length == 1){

                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(string.match(/(!!)/) || string.match(/(!!!)/)){
                recursiveEvents(lectureT, string, array, course, day, callback);

            }else if(array.length > 1 && checkRoom(array[0])){

                //console.log(string + ' ' + array[0]);
                if(checkLecturer(array[1])){
                    lectureT.setDetails(string + ' ' + array.shift());
                }else{
                    lectureT.setLecture_Name(string);
                }
                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(array.length != 0 && checkLecturer(array[0])){

                if(array[0].match(/[a-z]+\.+[a-z]+\//i)){
                    recursiveEvents(lectureT, string, array, course, day, callback);
                }else{
                    lectureT.setDetails(string);
                    recursiveEvents(lectureT, '', array, course, day, callback);
                }
            }else{
                recursiveEvents(lectureT, string, array, course, day, callback);
            }
        }else{

            if((string.match(/!!/) && array[0] == '!!') || string.match(/!!!/)){
                recursiveEvents(lectureT, string, array, course, day, callback);
            }else if(string.match(/Analyse/)){
                if(array[0].match('éco')){
                    lectureT.setLecture_Name(string + ' ' + array.shift());
                    recursiveEvents(lectureT, '', array, course, day, callback);
                }else{
                    lectureT.setLecture_Name(string);
                    recursiveEvents(lectureT, '', array, course, day, callback);
                }
            }else if(string.match('app')){
                    lectureT.setLecture_Name(string + ' ' + array.shift());
                    recursiveEvents(lectureT, '', array, course, day, callback);
            }else{

                lectureT.setDetails(string);
                recursiveEvents(lectureT, '', array, course, day, callback);
            }
        }

    }
}


// 0 - start time
// 2 - end time
// 4 - description
// 6 - professor
function tableLoop(html, day, course, callback){
    //console.log(html);
    var lectures = html.match(/<tr>.+<\/tr>/).map(function(val){return val.replace(/<\/?tr>/g,'');});

    for(var lecture in lectures){
        var elements = lectures[lecture].match(/<td.*?>(.*?)<\/td>/g).map(function(val){return val.replace(/<\/?td.*?>/g,'');});
        var i,j,temparray,chunk = 7;
        for (i=0,j = elements.length; i < j; i += chunk) {
            temparray = elements.slice(i,i + chunk);
            var lectureT = new Lecture(day, course, 0, null);
            lectureT.setTime_Start(temparray[0]);
            lectureT.setTime_End(temparray[2]);
            var lectureName = temparray[4].match(/<b.*?>(.*?)<\/b>/).map(function(val){return val.replace(/<\/?b>|<\/?a.*?>/g,'');});
            lectureT.setLecture_Name(lectureName[0]);
            var details = temparray[4].match(/<span>\-(.*?)<\/span><\/span>/gm);
            if(details){
                details = details.map(function(val){return val.replace(/<\/?span.*?>|\-/gm,'');});
                lectureT.setDetails(details[0].substr(1));
            }
            var lecturer = temparray[6];
            if(lecturer.match(/<\/?a.*?>/gm)){
                lecturer = lecturer.replace(/<\/?a.*?>/gm,'');
            }
            lectureT.setLecturer(lecturer);
            var period = (temparray[4].match(/\-<\/span><span>(.*?)<\/span><\/?span>/gm))[0];
            if(period){
                period.replace(/<\/?span.*?>|\-/gm,'');
                lectureT.setPeriod(period);
            }
            var lectureRoom = temparray[4].match(/<span class=\"InfoText\"><span><span>(.*?)-<span>/gm).map(function(val){
                return val.replace(/<\/?span.*?>|\-/gm,'');});
            var matched = lectureRoom[0].match(/groupe ./i);
            var rooms = [];
            if(matched){
                rooms = [lectureRoom[0].substring(0, matched.index).trim(), lectureRoom[0].substring(matched.index + 8,
                    lectureRoom[0].length - 8).trim()];
                lectureT.setLocation(rooms[0]);
                lectureT.setGroup("Group A");
                var lectureD = new Lecture(day, course, 0, null);
                lectureD.copy(lectureT);
                lectureD.setLocation(rooms[1]);
                lectureD.setGroup("Group B");
                timetable.push(lectureD);
            }else{
                lectureT.setLocation(lectureRoom[0]);
            }
            //console.log(matched);
            timetable.push(lectureT);
            //console.log("NA " + elements);
        }
    }
    callback();
}

function writeToJSON(){

    var myJSON = eval ("(" + JSON.stringify({timetable: timetable}) + ")");

     jsonfile.writeFile('../json/' + file + '.json', myJSON, function(err) {
     console.log(err);
     });
}

function writeToICAL(groupL){


    var myJSON = (eval ("(" + JSON.stringify({timetable: timetable}) + ")"))['timetable'],
        icalEvents = [];

    //console.log(myJSON);

    for(var object in myJSON){
        var lecture = myJSON[object];
        var regEx = new RegExp(groupL, 'g');

        if(lecture.group != null && lecture.group.match(regEx)){
            addEvent(lecture);
        }else if(!lecture.group){
            addEvent(lecture);
        }

    fs.writeFile('../ical/' + file + '_groupe' + ((groupL) || '') + '.ics', wrapString(icalEvents.join("")), function(err) {
        if(err) {
            console.log(err);
        } else {
            //console.log("The file was saved!");
        }
    });
}

    function addEvent(lecture){
        var event = new iCalEvent({
            offset: 0,
            start: dates[lecture.day] + 'T' + lecture.time_start,
            end: dates[lecture.day] + 'T' + lecture.time_end,
            summary: lecture.lecture_name,
            description: lecture.details,
            location: ((lecture.group) ? lecture.group.substr(7, 1) + ' | ' : '') + lecture.location,
            organizer: {
                name: lecture.lecturer
            },
            repeat: {
                frequency: 'WEEKLY',
                until: '20160601T225959Z'
            }
        });
        icalEvents.push(event.toString());
    }
}

//Wraps string with iCal
function wrapString(string){

    var result = '';

    result += 'BEGIN:VCALENDAR\r\n';
    result += 'VERSION:2.0\r\n';
    result += 'PRODID:' + this.id + '\r\n';
    result += string;
    result += 'END:VCALENDAR\r\n';

    return result;
}