$(function() {
    var lang = "en";
    var strings = {};
	toggleLanguage(lang);
    $(document).on("click", ".langswitch", function() {
        console.log("switch");
        lang = (lang == "en" ? "ru" : "en");
        toggleLanguage(lang);
    }).on("click", ".downloadbtn", function() {
        download($(this).val() === "CSV");
    });
	
    function download(mode) {
        $.getJSON("nirs.json", function(data) {
            // console.log(data);
            var todo = {
                "NOUNS": $('#nouns').prop('checked'),
                "VERBS": $('#verbs').prop('checked'),
                "ADJECTIVES": $('#adjs').prop('checked'),
                "ADVERBS": $('#advs').prop('checked')
            }
            // $('.example1').typeIt({
            // whatToType: "The model is ready",
            // typeSpeed: 50
            // });

            var datum = {};
            var csv = mode?(strings["table"].join(',') + "\n"):null;
            var stops = [];
			
			if ($('#stops').prop('checked')){
				var stopline = $('.stopline').val().replace(/\s/g, '');
				if (stopline) {
					stops = stopline.split(',');
				}
			}
			
			console.log(stops);
			
			
            for (var prop in data) {
                var unit = prop.split('_');
                if (todo[unit[1]]) {
                    if (mode) {
                        for (var el of data[prop]) {
							if (stops.indexOf(el[0]) === -1){
								csv += [unit[0], unit[1]].concat(el).join(',') + "\n";
							}
                        }
                    } else {
						datum[prop] = stops.length ? 
							data[prop].filter(function(d){ return stops.indexOf(d[0]) ==-1 })
							:
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
        });

    }

    function toggleLanguage(lang) {
        $.getJSON("texts.json", function(data) {
            strings = {};
            for (var prop in data) {
                strings[prop] = data[prop][lang];
            }
            $('body').html(Mustache.render($('#template').html(), strings));
            $('title').text(strings["title"]);
            $('html').attr("lang", lang);
        })
    }
});