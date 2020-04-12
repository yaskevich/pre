/*jshint sub:true*/
var data, texts;
var limit = 60;
var expdata = [{
        "name": "Cloze task",
        "value": 0.18503591191110105,
        "tip": {
            "en": "Cloze test",
            "ru": "Клоуз-тест"
        }
    },
    {
        "name": "HMM 2gr Lit",
        "value": 0.0434673246188485,
        "tip": {
            "en": "Bigram Hidden<br/>Markov Model<br/>based on Russian<br/>literature",
            "ru": "Биграммная скрытая<br/>марковская модель,<br/>обученная на корпусе<br/>русской литературы<br/>"
        }
    },
    {
        "name": "HMM 2gr Paper",
        "value": 0.04134700484225046,
        "tip": {
            "en": "Bigram Hidden<br/>Markov Model<br/>based on Russian<br/>news texts",
            "ru": "Биграммная скрытая<br/>марковская модель,<br/>обученная на корпусе<br/>русских новостных<br/>текстов"
        }
    },
    {
        "name": "HMM 3gr Paper",
        "value": 0.04727593532858293,
        "tip": {
            "en": "Trigram Hidden<br/>Markov Model<br/>based on Russian<br/>news texts",
            "ru": "Триграммная скрытая<br/>марковская модель,<br/>обученная на корпусе<br/>русских новостных<br/>текстов"
        }
    },
    {
        "name": "HMM 3gr LitPaper",
        "value": 0.06709134504419015,
        "tip": {
            "en": "Trigram Hidden<br/>Markov Model<br/>based on Russian<br/>literature",
            "ru": "Триграммная скрытая<br/>марковская модель,<br/>обученная на корпусе<br/>русской литературы<br/>"
        }
    },
    {
        "name": "BERT",
        "value": 0.21068725235598512,
        "tip": {
            "en": "BERT-Large<br/>based on Russian<br/>Wikipedia",
            "ru": "Модель BERT-Large,<br/>обученная на русской<br/>Википедии"
        }
    },
    {
        "name": "BERT News",
        "value": 0.24351086054539203,
        "tip": {
            "en": "BERT-Large fine-<br/>tuned on Russian<br/>news texts",
            "ru": "Модель BERT-Large,<br/>обученная на корпусе<br/>русских новостных<br/>текстов"
        }
    },
    {
        "name": "BERT NCRL",
        "value": 0.2543190053910093,
        "tip": {
            "en": "BERT fine-tuned<br/> on Russian<br/>literature",
            "ru": "Модель BERT-Large,<br/>дообученная на<br/>корпусе русской<br/>литературы"
        }
    },
    {
        "name": "BERT News+NCRL",
        "value": 0.24540072382437783,
        "tip": {
            "en": "BERT fine-tuned on full<br/>texts of the National<br/>Corpus of Russian<br/>Language",
            "ru": "Модель BERT,<br/>дообученная на<br/>полных текстах<br/>Национального<br/>корпуса русского<br/>языка"
        }
    },
    {
        "name": "HMM 2gr ↔ BERT",
        "value": 0.11961189681433873,
        "tip": {
            "en": "Mixture of two models:<br/>bigram HMM + BERT<br/>",
            "ru": "Комбинация двух<br/>моделей: биграммная<br/>СММ + BERT"
        }
    },
    {
        "name": "LSTM",
        "value": 0.11231992611870391,
        "tip": {
            "en": "LSTM based on<br/>Russian Wikipedia<br/>",
            "ru": "LSTM, обученная<br/>на русской<br/>Википедии"
        }
    }
];
$(function() {
    var lang = "en";
    var locale = {};
    var tab = "";
    var isRendered = false;
    if (!data || !texts) {
        // not good, but make it universal both for full and inline version
        // when all the JSONs are inserted into JS
        console.log("get JSONs");
        $.ajaxSetup({
            "async": false
        });
        data = $.getJSON("nirs.json").responseJSON;
        texts = $.getJSON("texts.json").responseJSON;
        $.ajaxSetup({
            "async": true
        });
    }
    toggleLanguage(lang);
    $(document).on("click", ".langswitch", function() {
        lang = (lang == "en" ? "ru" : "en");
        toggleLanguage(lang);
    }).on("click", ".downloadbtn", function() {
        download($(this).val() === "CSV");
    }).on("click", ".previewbtn", function() {
        download(true, true);
    }).on("click", ".tabs", function() {
        toggleTabs($(this));
    }).on("scroll", function() {
        // var ww = parseInt($(window).height());
        // var hh = parseInt($(".graphheader").offset().top);
        // console.log("win, off, diff", ww, hh, ww-hh, $(this).scrollTop());
        // console.log("anchor", parseInt($(window).height() - $(".anchor").offset().top));
        // console.log("is view", isScrolledIntoView($(".anchor")));
        // console.log("is view", isScrolledIntoView($(".anchor")), "rendered", isRendered);
        // if (!isRendered && $(this).scrollTop() >= $(".graphheader").offset().top) {
        if (!isRendered && isScrolledIntoView($(".anchor")) && !$(".anchor").hasClass('hidden')) {
            // console.log("go!");
            renderGraph();
            isRendered = true;
        }
    });
	$(window).on('resize', function(){
		if(isRendered){
			$( '.graph' ).empty();
			renderGraph();
		}
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
    function download(mode, preview) {
        var todo = {
            "NOUNS": $('#nouns').prop('checked'),
            "VERBS": $('#verbs').prop('checked'),
            "ADJECTIVES": $('#adjs').prop('checked'),
            "ADVERBS": $('#advs').prop('checked')
        };
		var classes = todo["NOUNS"] + todo["VERBS"] + todo["ADJECTIVES"] + todo["ADVERBS"];
        if (classes) {
            var datum = {};
			var share = limit/classes;
			var counters = {};
			for (var prop in todo) {
				counters[prop] = share;
			}
			
            var csv = mode ? (locale["table"].join(',') + "\n") : null;
            var stops = [];
            if ($('#stops').prop('checked')) {
                var stopline = $('.stopline').val().replace(/\s/g, '');
                if (stopline) {
                    stops = stopline.split(',');
                }
            }
            var kl = $(".keylist");
            // kl.parent().parent().removeClass('hidden');
            $('.dataheader').removeClass('hidden');
            kl.empty();
            var i = 0;
            for (var prop in data) {
                var unit = prop.split('_');
                var vals = '';
                if (todo[unit[1]]) {
                    if (mode) {
                        var array = data[prop];
                        for (index = 0; index < array.length; index++) {
                            var el = array[index];
                            if (stops.indexOf(el[0]) === -1) {
                                csv += [unit[0], unit[1]].concat(el).join(',') + "\n";
                                vals += '<mark class="secondary" data-tippy-content="' + el[1] + '">' + el[0] + '</mark> ';
                            }
                        }
                        // for (var el of data[prop]) {
                        // if (stops.indexOf(el[0]) === -1) {
                        // csv += [unit[0], unit[1]].concat(el).join(',') + "\n";
                        // vals += '<mark class="secondary" data-tippy-content="' + el[1] + '">' + el[0] + '</mark> ';
                        // }
                        // }
                    } else {
                        datum[prop] = stops.length ?
                            data[prop].filter(function(d) {
                                return stops.indexOf(d[0]) == -1;
                            }) :
                            data[prop];
                    }
                }
                if (vals) {
                    // if ((++i < 50) && preview) {						
					if (preview){
						if (i < limit) {
							if (counters[unit[1]]){
								counters[unit[1]]--;
								kl.append('<div class="card fluid"><div class="section"><h3 class="doc"><span data-tippy-content="' + locale[unit[1]] + '">' + unit[0] + '</span></h3><p class="doc">' + vals + '</p></div></div>');
								i++;
							}
							// break;
						} else {
							break;
						}
					}
                }
            }
            if (!preview) {
                var fn = "data." + (mode ? "csv" : "json");
                var file = new Blob([mode ? csv : JSON.stringify(datum)], {
                    type: mode ? 'application/octet-stream' : 'application/json',
                    name: fn
                });
                saveAs(file, fn);
            } else {
				var filtArr = []
				for (var item in todo) {
					if (!todo[item]) {
						filtArr.push(locale[item]);
					}
				}
				
				var stopEx = stops.length ? locale["tokens"] + " " + stops.map(function(d){ return d ?'<mark class="tertiary">'+d+'</mark>':''}).join(' ')+ " " + locale["filt_vals"]: locale["val_unfilt"];
				
				var ex = (filtArr.length? locale["tokens"] + " " + locale["classed"] + " " + filtArr.map(function(d){return d?'<mark class="tertiary">'+d+'</mark>':''}).join(' ') + " " + locale["filt_keys"] : locale["key_unfilt"]) + "<br/>" +stopEx +"<br/> <strong>"+ limit +"</strong> " + locale["lim"];
				$('.explanation').removeClass("hidden");
				$('.explanation > p').html(ex);
                tippy('[data-tippy-content]');
            }
        } else {
			$('.explanation').removeClass("hidden");
			$('.explanation > p').html(locale["nothing"]);
			$(".keylist").empty();
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
        if (lang === "ru" && $(window).width() < 400) {
            setTimeout(function() {
                $('.title').text(locale["title"].slice(0, -3) + '...');
            }, 5000);
        }
        tab = "";
        isRendered = false;
        toggleTabs($('#btn_desc'));
    }
    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    function renderGraph() {
        var margin = {
            top: 30,
            right: 50,
            bottom: 100,
            left: 50
        };
        width = d3.select('.graph').node().getBoundingClientRect().width - margin.left - margin.right;
        height = 400 - margin.top - margin.bottom;
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.1);
        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2f"));
        var formatRound = d3.format(".4f");
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>" + d.tip[lang] + "</strong>&nbsp;<span style='color:red'>" + formatRound(d.value) + "</span>";
            });
        var svg = d3.select(".graph").append("svg")
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        svg.call(tip);
        x.domain(expdata.map(function(d) {
            return d.name;
        }));
        y.domain([0, d3.max(expdata, function(d) {
            return d.value;
        })]);
        var colors = ["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];
        var colorScale = d3.scale.quantile()
            .domain([0, colors.length - 1, d3.max(expdata, function(d) {
                return d.value;
            })])
            .range(colors);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("font-size", "0.8em")
            .style("text-anchor", "start");
        //.append("text")
        //.classed("capmodels", true)
        //.attr("x", width/2)
        //.attr("y", 35)
        //.attr("dx", ".71em")
        // .style("text-anchor", "end")
        //.text("Models")
        // 
        // svg.selectAll(".bar")
        // 
        // .attr("height", function(d) {
        // return height - y(d.value);
        // //return 0;
        // })
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("y", -25)
            .attr("x", 12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(locale["score"]);
        svg.selectAll(".bar")
            .data(expdata)
            .enter()
            .append("rect")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d.name);
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
                return y(0);
            })
            .attr("height", function(d) {
                // return height - y(d.value);
                return 0;
            })
            .transition()
            // .delay(300)
            .delay(function(d, i) {
                return (i + 1) * 100;
            })
            .duration(1000)
            // .ease('linear')
            .ease('bounce')
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("height", function(d) {
                return height - y(d.value);
                // return 0;
            })
            .attr("fill", function(d) {
                return colorScale(d.value);
            });
    }
});