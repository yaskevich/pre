/*jshint sub:true*/
var data, texts;
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
    }).on("scroll", function () {
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
                    if (++i > 5) {
                        break;
                    }
                    kl.append('<div class="card fluid"><div class="section"><h3 class="doc"><span data-tippy-content="' + locale[unit[1]] + '">' + unit[0] + '</span></h3><p class="doc">' + vals + '</p></div></div>');
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
                tippy('[data-tippy-content]');
            }
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
            bottom: 120,
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
            .tickFormat(d3.format(".1f"));

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>" + d.tip + "</strong><br/><span style='color:red'>" + d.value + "</span>";
            });

        var svg = d3.select(".graph").append("svg")
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.call(tip);

        var data = [{
            "name": "1k monkeys",
            "value": "0.706"
        }, {
            "name": "HMM 2gr Lit",
            "value": "0.3"
        }, {
            "name": "Cloze Task",
            "value": "0.090"
        }, {
            "name": "Bert",
            "value": "0.528"
        }, {
            "name": "Bert News + NKRA",
            "value": "0.037"
        }, {
            "name": "LSTM",
            "value": "0.419"
        }];
		
		
		data = [
				{ 
					"name": "Cloze task", 
					"value": 0.18503591191110105, 
					"tip": "Cloze test"
				},
				{ 
					"name": "HMM 2gr Lit", 
					"value": 0.0434673246188485, 
					"tip":  "Bigram hidden Markov model<br/>based on Russian literature"
				},
				{ 
					"name": "HMM 2gr Paper", 
					"value": 0.04134700484225046, 
					"tip":  "Bigram hidden Markov model<br/>based on Russian news texts"
				},
				{ 
					"name": "HMM 3gr Paper", 
					"value": 0.04727593532858293, 
					"tip":  "Trigram hidden Markov model<br/>based on Russian news test"
				},
				{ 
					"name": "HMM 3gr LitPaper", 
					"value": 0.06709134504419015, 
					"tip":  "Trigram hidden Markov model<br/>based on Russian literature"
				},
				{ 
					"name": "Bert", 
					"value": 0.21068725235598512, 
					"tip":  "BERT Large based on Russian wikipedia"
				},
				{ 
					"name": "Bert News", 
					"value": 0.24351086054539203, 
					"tip":  "BERT Large finetuned<br/>on Russian news texts"
				},
				{ 
					"name": "Bert NCRL", 
					"value": 0.2543190053910093, 
					"tip":  "BERT finetuned<br/> on Russian literature"
				},
				{ 
					"name": "Bert News+NCRL", 
					"value": 0.24540072382437783, 
					"tip":  "BERT finetuned on<br/>full texts of the National<br/>Corpus of Russian Language"
				},
				{ 
					"name": "HMM 2gr - Bert", 
					"value":  0.11961189681433873, 
					"tip":  "Mixture of two models:<br/>bigram HMM + BERT"
				},				
				{ 
					"name": "LSTM", 
					"value": 0.11231992611870391, 
					"tip":  "LSTM based on Russian wikipedia"
				}

			];
		
        // console.log(JSON.stringify(data));

        x.domain(data.map(function(d) {
            return d.name;
        }));
        y.domain([0, d3.max(data, function(d) {
            return d.value;
        })]);

        // var colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];
        var colors = ["#440154", "#440256", "#450457", "#450559", "#46075a", "#46085c", "#460a5d", "#460b5e", "#470d60", "#470e61", "#471063", "#471164", "#471365", "#481467", "#481668", "#481769", "#48186a", "#481a6c", "#481b6d", "#481c6e", "#481d6f", "#481f70", "#482071", "#482173", "#482374", "#482475", "#482576", "#482677", "#482878", "#482979", "#472a7a", "#472c7a", "#472d7b", "#472e7c", "#472f7d", "#46307e", "#46327e", "#46337f", "#463480", "#453581", "#453781", "#453882", "#443983", "#443a83", "#443b84", "#433d84", "#433e85", "#423f85", "#424086", "#424186", "#414287", "#414487", "#404588", "#404688", "#3f4788", "#3f4889", "#3e4989", "#3e4a89", "#3e4c8a", "#3d4d8a", "#3d4e8a", "#3c4f8a", "#3c508b", "#3b518b", "#3b528b", "#3a538b", "#3a548c", "#39558c", "#39568c", "#38588c", "#38598c", "#375a8c", "#375b8d", "#365c8d", "#365d8d", "#355e8d", "#355f8d", "#34608d", "#34618d", "#33628d", "#33638d", "#32648e", "#32658e", "#31668e", "#31678e", "#31688e", "#30698e", "#306a8e", "#2f6b8e", "#2f6c8e", "#2e6d8e", "#2e6e8e", "#2e6f8e", "#2d708e", "#2d718e", "#2c718e", "#2c728e", "#2c738e", "#2b748e", "#2b758e", "#2a768e", "#2a778e", "#2a788e", "#29798e", "#297a8e", "#297b8e", "#287c8e", "#287d8e", "#277e8e", "#277f8e", "#27808e", "#26818e", "#26828e", "#26828e", "#25838e", "#25848e", "#25858e", "#24868e", "#24878e", "#23888e", "#23898e", "#238a8d", "#228b8d", "#228c8d", "#228d8d", "#218e8d", "#218f8d", "#21908d", "#21918c", "#20928c", "#20928c", "#20938c", "#1f948c", "#1f958b", "#1f968b", "#1f978b", "#1f988b", "#1f998a", "#1f9a8a", "#1e9b8a", "#1e9c89", "#1e9d89", "#1f9e89", "#1f9f88", "#1fa088", "#1fa188", "#1fa187", "#1fa287", "#20a386", "#20a486", "#21a585", "#21a685", "#22a785", "#22a884", "#23a983", "#24aa83", "#25ab82", "#25ac82", "#26ad81", "#27ad81", "#28ae80", "#29af7f", "#2ab07f", "#2cb17e", "#2db27d", "#2eb37c", "#2fb47c", "#31b57b", "#32b67a", "#34b679", "#35b779", "#37b878", "#38b977", "#3aba76", "#3bbb75", "#3dbc74", "#3fbc73", "#40bd72", "#42be71", "#44bf70", "#46c06f", "#48c16e", "#4ac16d", "#4cc26c", "#4ec36b", "#50c46a", "#52c569", "#54c568", "#56c667", "#58c765", "#5ac864", "#5cc863", "#5ec962", "#60ca60", "#63cb5f", "#65cb5e", "#67cc5c", "#69cd5b", "#6ccd5a", "#6ece58", "#70cf57", "#73d056", "#75d054", "#77d153", "#7ad151", "#7cd250", "#7fd34e", "#81d34d", "#84d44b", "#86d549", "#89d548", "#8bd646", "#8ed645", "#90d743", "#93d741", "#95d840", "#98d83e", "#9bd93c", "#9dd93b", "#a0da39", "#a2da37", "#a5db36", "#a8db34", "#aadc32", "#addc30", "#b0dd2f", "#b2dd2d", "#b5de2b", "#b8de29", "#bade28", "#bddf26", "#c0df25", "#c2df23", "#c5e021", "#c8e020", "#cae11f", "#cde11d", "#d0e11c", "#d2e21b", "#d5e21a", "#d8e219", "#dae319", "#dde318", "#dfe318", "#e2e418", "#e5e419", "#e7e419", "#eae51a", "#ece51b", "#efe51c", "#f1e51d", "#f4e61e", "#f6e620", "#f8e621", "#fbe723", "#fde725"];
        colors = ["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];

        var colorScale = d3.scale.quantile()
            .domain([0, colors.length - 1, d3.max(data, function(d) {
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
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Score");

        svg.selectAll(".bar")
            .data(data)
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
			
			.delay(function (d, i) {
				return (i+1)*100;
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




        function type(d) {
            d.value = +d.value;
            return d;
        }
    }

});