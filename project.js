$(function() {
  // Handler for .ready() called.
  function compatibleJoin(array, joinStr) {
	 
		var str = "";
		var i;
		
		for(i = 0; i < array.length; i++) {
			if(i === (array.length - 1)) {
				str += array[i];
			} else {
				str += array[i] + joinStr;
			}
		}
		return str;
	}
	 
	function json2csv(jsonData, jsonFields) {
	 
		var csvStr = compatibleJoin(jsonFields, ",") + "\n";
		
		var i;
		
		for(i = 0; i < jsonData.length; i++) {
			var attrList = [];
			
			var j;
			for(j = 0; j < jsonFields.length; j++) {
				attrList.push(jsonData[i][jsonFields[j]]);
			}
			
			csvStr += compatibleJoin(attrList, ",") + "\n";
		}
	 
		return csvStr;
	}
  console.log("hi");
  

	
	$('.downloadbtn').on("click", function(e) {
		// e.preventDefault();
		$.getJSON( "nirs.json", function( data ) {
			// console.log(data);
			var todo = {
				"NOUNS" : $('#nouns').prop('checked'),
				"VERBS" : $('#verbs').prop('checked'),
				"ADJECTIVES" : $('#adjs').prop('checked'),
				"ADVERBS" : $('#advs').prop('checked')
			}
			// $('.example1').typeIt({
				 // whatToType: "The model is ready",
				 // typeSpeed: 50
			// });
			var datum = {};
			for(var prop in data) {
				var unit = prop.split('_');
				if (todo[unit[1]]) {
					console.log(unit[1]);
					datum[prop] = data[prop];
				}
			}
			
			var fn = "data.json";
			var file = new Blob([JSON.stringify(datum)], {type: 'application/json', name: fn});
			saveAs(file, fn);		
		});
    })
});