var data, texts;
$(function() {
    var lang = "en";
    var locale = {};
    var tab = "";

	if (!data || !texts) {
		console.log("get JSONs");
		$.ajaxSetup( { "async": false } );
		data = $.getJSON("nirs.json").responseJSON;
		texts = $.getJSON("texts.json").responseJSON;
		$.ajaxSetup( { "async": true } );
	}

    toggleLanguage(lang);
	
    $(document).on("click", ".langswitch", function() {
        lang = (lang == "en" ? "ru" : "en");
        toggleLanguage(lang);
    }).on("click", ".downloadbtn", function() {
        download($(this).val() === "CSV");
    }).on("click", ".tabs", function() {
        toggleTabs($(this))
    });


    function toggleTabs(that) {
        var id = that.attr('id');
        if (id !== tab) {
            that.css('background-color', '#f8f8f8');
            that.css('border', '1px dashed lightgray');
            if (tab) {
                $('#' + tab).css('background-color', '');
                $('#' + tab).css('border', '');
            }
            tab = id;
            var divsToHide = $('.data:not(.hidden)');
            $('.data.hidden').removeClass('hidden');
            divsToHide.addClass('hidden');
        }
    }

    function download(mode) {
        var todo = {
            "NOUNS": $('#nouns').prop('checked'),
            "VERBS": $('#verbs').prop('checked'),
            "ADJECTIVES": $('#adjs').prop('checked'),
            "ADVERBS": $('#advs').prop('checked')
        }
        if (todo["NOUNS"] + todo["VERBS"] + todo["ADJECTIVES"] + todo["ADVERBS"]) {
            var datum = {};
            var csv = mode ? (locale["table"].join(',') + "\n") : null;
            var stops = [];

            if ($('#stops').prop('checked')) {
                var stopline = $('.stopline').val().replace(/\s/g, '');
                if (stopline) {
                    stops = stopline.split(',');
                }
            }

            for (var prop in data) {
                var unit = prop.split('_');
                if (todo[unit[1]]) {
                    if (mode) {
                        for (var el of data[prop]) {
                            if (stops.indexOf(el[0]) === -1) {
                                csv += [unit[0], unit[1]].concat(el).join(',') + "\n";
                            }
                        }
                    } else {
                        datum[prop] = stops.length ?
                            data[prop].filter(function(d) {
                                return stops.indexOf(d[0]) == -1
                            }) :
                            data[prop];

                        // 
                    }
                }
            }

            var fn = "data." + (mode ? "csv" : "json");
            var file = new Blob([mode ? csv : JSON.stringify(datum)], {
                type: mode ? 'application/octet-stream' : 'application/json',
                name: fn
            });
            saveAs(file, fn);
        }
    }

    function toggleLanguage(lang) {
        locale = {};
        for (var prop in texts) {
            locale[prop] = texts[prop][lang];
        }
        $('body').html(Mustache.render($('#template').html(), locale));
        $('title').text(locale["title"]);
        $('html').attr("lang", lang);
        tab = "";
        toggleTabs($('#btn_desc'));
    }
});