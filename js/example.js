var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var file = 'json/timetable.json';

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
pools = {
    'Tualatin Hills': 2
};
for (pool in pools) {
    var url = 'http://www.thprd.org/schedules/schedule.cfm?cs_id=' + pools[pool];

    request(url, (function(pool) { return function(err, resp, body) {
        $ = cheerio.load(body);
        $('#calendar .days td').each(function(day) {
            $(this).find('div').each(function() {
                event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');
                
                if (event.length >= 2 
                	&& (event[1].match(/open swim/i) 
                		|| event[1].match(/family swim/i))){
                    //console.log(pool + ',' + days[day] + ',' + event[0] + ',' + event[1]);
                }else if(event.length < 2){
                	//console.log("L " + event);
                }
            });
        });
    }})(pool));
}

var obj = {name: 'JP', author: { name : 'Me' } };

jsonfile.writeFile(file, obj, function(err) {
  console.log(err);
})