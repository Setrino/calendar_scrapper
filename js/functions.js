function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.firstText = this.dd.find('ul.dropdown > li:first-child').text();
    this.val = '';
    this.index = -1;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
            new jsonEvents(function(value) { json.getCal().setJSON(value); }, requestFilename(obj.val));
        });

        $('.json_file').on('click', function(){
            window.location = 'json/' + requestFilename(obj.placeholder.text()) + '.json';
        });

        $('.ical_file').on('click', function(){
            window.location = 'ical/' + requestFilename(obj.placeholder.text()) + '.ics';
        });

        obj.placeholder.text(obj.firstText);

            var json = new jsonEvents(function(value) {

                var cal = $( '#calendar' ).calendario( {
                        onDayClick : function( $el, $contentEl, dateProperties ) {

                            for( var key in dateProperties ) {
                                //console.log( key + ' = ' + dateProperties[ key ] );
                            }
                            if( $contentEl.length > 0 && ($(window).width() > 880 && $(window).height() > 450)) {
                                showEvents( $contentEl, dateProperties );
                            }

                        },
                        caldata : codropsEvents,
                        jsonEvents : value
                    } ),
                    $month = $( '#custom-month' ).html( cal.getMonthName() ),
                    $year = $( '#custom-year' ).html( cal.getYear() );

                $( '#custom-next' ).on( 'click', function() {
                    cal.gotoNextMonth( updateMonthYear );
                } );
                $( '#custom-prev' ).on( 'click', function() {
                    cal.gotoPreviousMonth( updateMonthYear );
                } );
                $( '#custom-current' ).on( 'click', function() {
                    cal.gotoNow( updateMonthYear );
                } );
                $( '#groups .groupA' ).on( 'click', function() {
                    updateGroup($(this), $( '#groups .groupB' ));
                } );
                $( '#groups .groupB' ).on( 'click', function() {
                    updateGroup($(this), $( '#groups .groupA' ));
                } );

                function updateMonthYear() {
                    $month.html( cal.getMonthName() );
                    $year.html( cal.getYear() );
                }

                function updateGroup(clicked, other){
                    clicked.toggleClass("line-through");
                    if(clicked.is(".line-through")){
                        cal.excludeGroup(updateMonthYear, (clicked.html()).substr(5, 2));
                    }else{
                        cal.excludeGroup(updateMonthYear);
                    }
                    if(other.is(".line-through")){
                        other.removeClass("line-through");
                    }
                }

                json.setCal(cal);

            }, requestFilename(obj.firstText))
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
}

$(function() {

    var dd = new DropDown( $('#dd') );

    $(document).click(function() {
        // all dropdowns
        $('.wrapper-dropdown-3').removeClass('active');
    });

});

function waitForElement(){
    if($('.fc-today').offset() != undefined && $(window).width() <= 880){
        $(window).scrollTop($('.fc-today').offset().top - 20);
    }
    else{
        setTimeout(function(){
            waitForElement();
        },250);
    }
};

waitForElement();

function showEvents( $contentEl, dateProperties ) {

    var $wrapper = $('#custom-inner');

    hideEvents();

    var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' +
            dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year +
            '</h4></div>'),
        $close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );
    $events.append( "<div class='custom-content-text'></br>" + $contentEl.html() + '</div>' , $close ).insertAfter( $wrapper );
    $('#custom-content-reveal').css('height', $(".custom-content-text").height() + 75);


    setTimeout( function() {
        $events.css( 'top', '00%' );
    }, 25 );

}
function hideEvents() {

    var $events = $( '#custom-content-reveal'),
        transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition' : 'transitionend',
            'OTransition' : 'oTransitionEnd',
            'msTransition' : 'MSTransitionEnd',
            'transition' : 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
    if( $events.length > 0 ) {

        $events.css( 'top', '100%' );
        Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();
    }
    //

}

function requestFilename(text){

    return 'bac' + text.substr(9, 1) + text.substr(11, 1).toLowerCase();
}