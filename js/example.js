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
            time = event.slice(0, 3).join(" ");
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

                    console.log(temp);
                }
            }

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

//current - current event object
//string - temporary string for the searched path

function recursiveEvents(current, string, array){

    if(array.length == 0 && string == null){

        return timetable;
    }else{

        string += array.shift();

        if(string.match(/Amphi|Inter|Anthr|Géop/i)){


        }
        else if(/\d/g.test(temp) && /:/.test(temp)){


        }

    }
}

function checkRoom(string){

    return string.match(/Amphi|Inter|Anthr|Géop/i);
}

function lecture(day, year, time, value){

    this.day = day;
    this.time_start = time;
    this.time_end = time;
    this.lecture_name = value;
    this.location = value;
    this.group = value;
    this.period = value;
    this.year = year;
    this.lecturer = value;
    this.details = value;
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

myarray.push(new lecture('Tuesday', 'Bachelor 1 Automne', 0, null));

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

function setTime_Start(time){

    this.time_start = time;
}

function setTime_End(time){

    this.time_end = time;
}

function setLecture_Name(lecture){

    this.lecture_name = lecture;
}

function setLocation(location){

    this.location = location;
}

function setGroup(group){

    this.group = group;
}

function setPeriod(period){

    this.period = period;
}

function setLecturer(lecturer){

    this.lecturer = lecturer;
}

function setDetails(details){

    this.details = details;
}