var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var file = 'json/timetable.json';
var timetable = [];

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
courses = {
    'Bachelor 1 Automne': 9873
};

var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=9873';

for (course in courses) {
    var url = 'http://hec.unil.ch/hec/timetables/snc_de_pub?pub_id=' + courses[course];

    request(url, (function(course) { return function(err, resp, body) {
        $ = cheerio.load(body);

        $('#content-core .list').each(function(day){

            event = $(this).text().trim().replace(/\s\s+/g, ' ').split(" ");

            if(event.length > 1){

            recursiveEvents(null, '', event, course, days[day], function(){

                console.log(timetable);
            });}

            /*time = event.slice(0, 3).join(" ");
            subject = event.slice(3, 5).join(" ");
            room = event.slice(5, 6).join(" ");

            for(var i = 0; i < event.length; i++){

                var temp = event[i];

                //Check for room
                if(temp.match(/Amphi|Inter|Anthr|Géop/i)){

                    //console.log(temp);
                //Check for time
                }else if(/\d/g.test(temp) && /:/.test(temp)){

                    //console.log(temp);
                }else if(temp.match(/Automne|Printemps/i)){

                    //console.log(temp);
                }else if(temp.match(/groupe/i)){

                    //console.log(temp);
                }else if(temp.match(/[a-z]+\./i)){

                    //console.log(temp);
                }else{

                    console.log(temp);
                }
            }*/

            //console.log(course + " " + time + " " + subject + " " + room);
        });

        /*$('#calendar .days td').each(function(day) {
            $(this).find('div').each(function() {
                event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');
                
                if (event.length >= 2 
                	&& (event[1].match(/open swim/i) 
                		|| event[1].match(/family swim/i))){
                    console.log(course + ',' + days[day] + ',' + event[0] + ',' + event[1]);
                }else if(event.length < 2){
                	//console.log("L " + event);
                }
            });
        });*/
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

var myarray = [];
var myJSON = [];

/*for (var i = 0; i < 2; i++) {

    var lecture = {
        name : i,
        label: i

    };

    myarray.push(item);
}*/

myarray.push(new Lecture('Tuesday', 'Bachelor 1 Automne', 0, null));

 var lecture = {
 day: 'Monday',
 time_start: '12:15',
 time_end: '15:00',
 lecture_name: 'Economie politique I',
 location: 'Anthropole/1031',
 group: 'groupe A',
 period: 'Automne',
 year: 'Bachelor 1',
 lecturer: 'D.Rohner',
 details: ''

 };

 myarray.push(lecture);

 var lecture = {
 day: 'Monday',
 time_start: '15:15',
 time_end: '18:00',
 lecture_name: 'Economie politique I',
 location: 'Anthropole/1031',
 group: 'groupe B',
 period: 'Automne',
 year: 'Bachelor 1',
 lecturer: 'D.Bichsel',
 details: ''

 };

 myarray.push(lecture);

 var lecture = {
 day: 'Monday',
 time_start: '17:15',
 time_end: '18:00',
 lecture_name: 'Statistique I',
 location: 'Internef/263',
 group: 'groupe A',
 period: 'Automne',
 year: 'Bachelor 1',
 lecturer: 'V.Chavez',
 details: 'A de 17h à 18h - B de 18h à 19h'

 };

 myarray.push(lecture);

 var lecture = {
 day: 'Monday',
 time_start: '18:15',
 time_end: '19:00',
 lecture_name: 'Statistique I',
 location: 'Anthropole/1031',
 group: 'groupe B',
 period: 'Automne',
 year: 'Bachelor 1',
 lecturer: 'V.Chavez',
 details: 'A de 17h à 18h - B de 18h à 19h'

 };

 myarray.push(lecture);

/*var myJSON = eval ("(" + JSON.stringify({timetable: myarray}) + ")");

//var obj = {name: 'JP', author: { name : 'Me' } };

jsonfile.writeFile(file, myJSON, function(err) {
  console.log(err);
});*/

Lecture.prototype.setTime_Start = function(time){

    this.time_start = time;
}

Lecture.prototype.setTime_End = function(time){

    this.time_end = time;
}

Lecture.prototype.setLecture_Name = function(lecture){

    this.lecture_name = lecture;
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

    if(array.length == 0 && string == null){

        callback();
    }else{

        if(current == null){

            lectureT = new Lecture(day, course, 0, null);
            //timetable.push(lectureT);
        }

        string += array.shift();

        if(string.match(/Amphi|Inter|Anthr|Géop/i)){

            //console.log(string);

            //Check for time
        }else if(/\d/g.test(string) && /:/.test(string)){

            if(array[0] == '-'){
                console.log("la");
                lectureT.setTime_Start(string);
            }else{
                console.log("S");
                lectureT.setTime_End(string);
            }
            recursiveEvents(lectureT, '', array, course, day, callback);
        }else if(string.match(/Automne|Printemps/i)){

            //console.log(string);
        }else if(string.match(/groupe/i)){

            //console.log(string);
        }else if(string.match(/[a-z]+\./i)){

            //console.log(string);
        }else if(string.match(/-/)){

            recursiveEvents(lectureT, '', array, course, day, callback);
        }else{

            //callback();
            console.log(lectureT);
        }

    }
}