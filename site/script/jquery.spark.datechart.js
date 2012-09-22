/**
 * Spark query result format "datechart"
 * 
 * == Description ==
 * Displays the result set as a date chart using jqPlot.
 * 
 * == SPARQL variable names ==
 * ?entity The identity for each single measurement, i.e. usually the cell
 *         with the actual data
 * ?series Is the identifier for the series, so that values for several
 *         entities can be displayed at the same time
 * ?series_label a label for the series (not used yet, should be used for the
 *               legend)
 * ?time of type time, point of time when the given value is correct
 * ?value of type numeric, the value of the property at the given time
 * 
 * == Parameters ==
 * none for now
 * 
 * == Additional required file ==
 * jquery.jqplot.js
 * jqplot.dateAxisRenderer.js
 * jquery.jqplot.css
 * 
 * == Notes ==
 * Feel free to extend the parameters.
 * If there are multiple values for time or value in one field, only one will
 * be chosen randomly. This should be regarded as a bug.
 */
(function($){
	$.jqplot.config.enablePlugins = true;
	
	var chartargs = function(values) {
		var intermediate = {};
		$.each(values, function(entity, properties) {
			if (intermediate[properties.series[0]] === undefined)
				intermediate[properties.series[0]] = [];
			intermediate[properties.series[0]].push([properties.time[0], parseInt(properties.value[0])]);
		});
		var res = [];
		$.each(intermediate, function(series, datapoints) {
			res.push(datapoints);
		});
		return res;
	};
		
	$.spark.format.datechart = function(element, result, reduced, params) {
		if (element.attr('id') === '')
			element.attr('id', 'p' + Math.floor(Math.random()*10000000000000000));
		element.html('');
		$.jqplot(element.attr('id'), chartargs(reduced), {
			axes: {
				xaxis: {
					renderer : $.jqplot.DateAxisRenderer 
				}
			}
		});
	};
})(jQuery);
