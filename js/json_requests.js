$(document).ready(function() {
    
    //after button is clicked we download the data
    $('.button').click(function(){

        //start ajax request
        $.ajax({
            url: "json/timetable.json",
            //force to handle it as text
            dataType: "text",
            success: function(data) {
                
                //data downloaded so we call parseJSON function 
                //and pass downloaded data
                var json = $.parseJSON(data);
                //now json variable contains data in json format
                //let's display a few items
                $('#results').html('Plugin name: ' + json.author[3].name + '<br />' +
                    'Author: ' + json.author[3].label);
            },error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(textStatus+" - "+errorThrown);
            }
        });
    });
});

var jsonEvents = function(callback, filename){

    this.value = {};
    this.cal = null;
    this.requestJSON(callback, filename);
}

jsonEvents.prototype = {

    setValue: function(value){
        this.value = value;
    },

    setCal: function(cal){
        this.cal = cal;
    },

    getCal: function(){
        return this.cal;
    },

    requestJSON: function(callback, filename){
            $.ajax({
            url: "json/" + filename + ".json",
            //force to handle it as text
            dataType: "text",
            success: function(data) {
                
                //data downloaded so we call parseJSON function 
                //and pass downloaded data
                //var json = $.parseJSON(data);
                //now json variable contains data in json format
                //let's display a few items
                //$('#results').html('Plugin name: ' + json.author[3].name + '<br />' +
                //    'Author: ' + json.author[3].label);
                this.value = $.parseJSON(data);
                callback(this.value);
            },error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(textStatus+" - "+errorThrown);
                return null;
            }
        });
    }
}