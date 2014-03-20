var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var async = require('async');
var file = '';
var timetable = [];
var timetableS = '';    //String of events

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
courses = {
    //'bac1a': 10113,
    'bac1p' : 10114
};

var courseIds = Object.keys(courses);

function perCourse(courseId, callback) {
    var course = courses[courseId];
    file = '../json/' + courseId + '.json';
    var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=' + course;

    request(url, (function(course) { return function(err, resp, body) {
        $ = cheerio.load(body);

        $('#content-core .list').each(function(day){

            event = $(this).text().trim().replace(/\s\s+/g, ' ').split(" ");

            if(event.length > 1){

                recursiveEvents(null, '', event, course, days[day], function(){

                    //writeToJSON();
                });}
        }), callback();
    }})(courseId));
}

async.each(courseIds, perCourse, function (err) {
    // Executed after for loop finished;
    writeToJSON();
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

    return string.match(/Amphi|Inter|Anthr|Géop/i) && !string.match(/!!!/);
}

function checkLecturer(string){

    return string.match(/[a-z]+\./i);
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
    }
}

function recursiveEvents(current, string, array, course, day, callback){

    //console.log(event.length + " " + day + " " + new Lecture(day, course, 0, null));

    var lectureT = current;

    if(array.length == 0 && string == ''){

        callback();
    }else{

        if(current == null){

            lectureT = new Lecture(day, course, 0, null);
            //timetable.push(lectureT);
        }

        string = (string == '') ? string + array.shift() : string + ' ' + array.shift();
        //console.log(string);

        if(string.match(/[a-z]+\.+[a-z]+\//i)){

        }

        if(checkRoom(string)){
            //console.log(string);
            lectureT.setLocation(string);
            recursiveEvents(lectureT, '', array, course, day, callback);

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
        }else if(string.match(/groupe/i)){

            if(string.length == 6){
                string += ' ' + array.shift();
                lectureT.setGroup(string);
            }else{
                var tempS = string.split(' ').pop();
                var string = string.substring(0, string.length - 7);
                tempS += ' ' + array.shift();
                lectureT.setGroup(tempS);
                lectureT.setDetails(string);
            }
            recursiveEvents(lectureT, '', array, course, day, callback);
            //Lecturer's name
        }else if(checkLecturer(string)){

            if(string.match(/\.+\s+[a-z]/i) && array.length > 1 && checkLecturer(array[0])){
                lectureT.setDetails(string);
                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(string.match(/-/)){
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
        }else if(string.match(/^[a-z0-9À-ÿ\-\ '!@#\$%\^\&*\)\(+=., ]+$/i)){

            if(array.length < 30){

            }

            if(string.match(/-/) && string.length == 1){

                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(array.length > 1 && checkRoom(array[0])){
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

            //callback();
            //console.log(string);
        }

    }
}

function writeToJSON(){

    var myJSON = eval ("(" + JSON.stringify({timetable: timetable}) + ")");

    /*var table = myJSON['timetable'];
    var tableA = [],
        tableB = [];

    for(var object in table){
        var temp = table[object];

        if(temp.group != null && temp.group.match(/A/)){
            tableA.push(temp);
        }else if(temp.group != null && temp.group.match(/B/)){
            tableB.push(temp);
        }
    }

    console.log(tableA);
    console.log(tableB);*/

     jsonfile.writeFile(file, myJSON, function(err) {
     console.log(err);
     });
}