var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var file = 'json/timetableT.json';
var timetable = [];

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
courses = {
    'Bachelor 1 Automne': 9873
};

//var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=9873';

for(course in courses) {

    var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=' + courses[course];

    request(url, (function(course) { return function(err, resp, body) {
        $ = cheerio.load(body);

        $('#content-core .list').each(function(day){

            event = $(this).text().trim().replace(/\s\s+/g, ' ').split(" ");

            if(event.length > 1){

                recursiveEvents(null, '', event, course, days[day], function(){

                    writeToJSON();
                    //console.log(timetable);
                });}
        });

    }})(course));
}


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
}

//current - current event object, lecture
//string - temporary string for the searched path
//array - event array
//callback - function

function checkRoom(string){

    return string.match(/Amphi|Inter|Anthr|Géop/i);
}

function checkLecturer(string){

    return string.match(/[a-z]+\./i);
}

Lecture.prototype.setTime_Start = function(time){

    this.time_start = time;
}

Lecture.prototype.setTime_End = function(time){

    this.time_end = time;
}

Lecture.prototype.setLecture_Name = function(lecture){

    if(this.lecture_name == null){
        this.lecture_name = lecture;
    }
}

Lecture.prototype.setLocation = function(location){

    this.location = location;
}

Lecture.prototype.setGroup = function(group){

    this.group = group;
}

Lecture.prototype.setPeriod = function(period){

    this.period = period;
}

Lecture.prototype.setLecturer = function(lecturer){

    this.lecturer = lecturer;
}

Lecture.prototype.setDetails = function(details){

    this.details = details;
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

        if(checkRoom(string)){

            lectureT.setLocation(string);
            recursiveEvents(lectureT, '', array, course, day, callback);

            //Set time
        }else if(/\d/g.test(string) && /:/.test(string)){

            if(array[0] == '-'){
                lectureT.setTime_Start(string);
            }else{
                lectureT.setTime_End(string);
            }
            recursiveEvents(lectureT, '', array, course, day, callback);
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
        }else if(string.match(/[a-z]+\./i)){

            lectureT.setLecturer(string);
            timetable.push(lectureT);
            recursiveEvents(null, '', array, course, day, callback);
        }else if(string.match(/^[a-z0-9À-ÿ\-\ '!@#\$%\^\&*\)\(+=., ]+$/i)){

            //console.log(string);

            if(array.length < 30){
                //console.log(string);
            }

            if(string.match(/-/) && string.length == 1){

                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(array.length >1 && checkRoom(array[0])){

                if(checkLecturer(array[1])){
                    lectureT.setDetails(string + ' ' + array.shift());
                }else{
                    lectureT.setLecture_Name(string);
                }
                recursiveEvents(lectureT, '', array, course, day, callback);
            }else if(array.length != 0 && checkLecturer(array[0])){

                lectureT.setDetails(string);
                recursiveEvents(lectureT, '', array, course, day, callback);
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

     jsonfile.writeFile(file, myJSON, function(err) {
     console.log(err);
     });
}