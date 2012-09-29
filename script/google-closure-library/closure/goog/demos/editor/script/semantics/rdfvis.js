(function(){
    rdfvis = {};
    window['rdfvis'] = rdfvis;

    rdfvis.model = {

        isLoading: ko.observable(true),
        selectedPosts: ko.observable([]),
        datesPosts: null,
        currentPage: ko.observable(1),
        pushEvents: {'name':'push events', 'type':'allPushEvents', 'children':[], 'id':'allPushEvents'},
        createEvents: {'name':'create events', 'type':'allCreateEvents', 'children':[], 'id':'allCreateEvents'},
        pullRequestEvents: {'name':'pull request  events', 'type':'allPullRequestEvents', 'children':[], 'id':'allPullRequestEvents'},
        tweets: {'name':'allTweets', 'type':'allTweets', 'children':[], 'id':'allTweets'},
        registry: {},
        overResource: ko.observable("Select a resource"),

        colors: {'tweet': '#aec7e8',
                 'push': '#ffbb78',
                 'create': '#98df8a',
                 'pull': '#c49c94',
                 'allTweets': '#1f77b4',
                 'allGithub':'#7f7f7f',
                 'allCreateEvents': '#c7c7c7',
                 'allPullRequestEvents':'#c7c7c7',
                 'allPushEvents':'#c7c7c7' },


        query: ko.observable("SELECT * WHERE  { \
                                  { ?post a <http://rdfs.org/sioc/types#MicroblogPost>; \
                                    <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/twitter#extension> }\
                                 UNION \
                                  { ?post a <http://rdfs.org/sioc/types#MicroblogPost>; \
                                    <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/github#extension> }\
                                 OPTIONAL \
                                  { ?post <http://social-rdf.org/vocab/extensions/github/event_type> ?githubEvent } \
                            }"),

        calendarQuery: "SELECT * WHERE { ?post dcterms:created ?date . ?post <http://social-rdf.org/vocab/configuration#managed_by_extension> ?type } ORDER BY DESC(?date)",

        allPostsQuery: "SELECT ?post WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost> } ORDER BY ASC(?date)",

        allTweetsQuery: "SELECT ?post ?p ?o WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost>; <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/twitter#extension> } ORDER BY ASC(?date)",

        allGithubQuery: "SELECT ?post ?p ?o WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost>; <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/github#extension> } ORDER BY ASC(?date)",

        allCreateEventsQuery: "SELECT ?post ?p ?o WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost>; <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/github#extension>; <http://social-rdf.org/vocab/extensions/github/event_type> \"http://social-rdf.org/vocab/extensions/github/CreateEvent\" } ORDER BY ASC(?date)",

        allPushEventsQuery: "SELECT ?post ?p ?o WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost>; <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/github#extension>; <http://social-rdf.org/vocab/extensions/github/event_type> \"http://social-rdf.org/vocab/extensions/github/PushEvent\" } ORDER BY ASC(?date)",

        allPullRequestEventsQuery: "SELECT ?post ?p ?o WHERE { ?post dcterms:created ?date . ?post a <http://rdfs.org/sioc/types#MicroblogPost>; <http://social-rdf.org/vocab/configuration#managed_by_extension> <http://social-rdf.org/vocab/extensions/github#extension>; <http://social-rdf.org/vocab/extensions/github/event_type> \"http://social-rdf.org/vocab/extensions/github/PullRequestEvent\" } ORDER BY ASC(?date)"

    };

    rdfvis.model.github = {'name':'allGithub', 'type':'allGithub', 'children':[rdfvis.model.pushEvents, 
                                                                                       rdfvis.model.createEvents, 
                                                                                       rdfvis.model.pullRequestEvents],
                          'id': 'allGithub'};

    rdfvis.model.root = {'name':'http://antoniogarrote.com/social/stream', 'children':[rdfvis.model.tweets, 
                                                                                       rdfvis.model.github],
                        'id': 'stream'};

    rdfvis.model.clickOnPath = function() {
        alert("you clicked on a path");
    };

    rdfvis.model.initialize = function() {
        sko.Class.define("<http://rdfs.org/sioc/types#MicroblogPost>",
                        {'formattedDate': function(){
                            var date = this.getProp("[dcterms:created]");
                            if(date != null) {
				var format = d3.time.format("%Y-%m-%dT%H:%M:%S");
				date = format.parse(date.split(".")[0]);
                                var year = 1900+date.getYear();
                                var month = date.getMonth()+1;
                                var day = date.getDay()+1;
                                if(day<10) {
                                    day = "0"+day;
                                }

                                return year+"-"+month+"-"+day;
                            } else {
                                return "unknown";
                            }
                        },
                        'origin': function() {
                            if(this.getProp("<http://social-rdf.org/vocab/configuration#managed_by_extension>") ==
                               "<http://social-rdf.org/vocab/extensions/github#extension>") {
                                return "github";
                            } else {
                                return "twitter";
                            }
                        },
                        'postClass': function() {
                            return "post "+this.origin();
                        },
                        'sourceLink': function() {
                            var source = this.getProp("[sioc:embedsKnowledge]");
                            if(source != null) {
                                return sko.plainUri(source);
                            } else {
                                return "#";
                            }
                        }});

        rdfvis.model.nextPage = ko.dependentObservable(function(){
            return  "http://antoniogarrote.com/social/stream?page="+rdfvis.model.currentPage();
        });
    };

    rdfvis.model.renderSunburst = function(cb) {
        store.execute(rdfvis.model.query(), function(success, posts) {

            
            for(var i=0; i<posts.length; i++) {
                rdfvis.model.registry[posts[i].post.value] = true;
                var id =  posts[i].post.value.split("/");
                id =  "_"+id[id.length-1];
                id = id.replace(/\./g,"");

                if(posts[i].githubEvent != null) {
                    if(posts[i].githubEvent.value === 'http://social-rdf.org/vocab/extensions/github/PullRequestEvent') {
                        rdfvis.model.pullRequestEvents.children.push({'name':posts[i].post.value, 'type':'pull', 'id':id});
                    } else if(posts[i].githubEvent.value === 'http://social-rdf.org/vocab/extensions/github/CreateEvent') {
                        rdfvis.model.createEvents.children.push({'name':posts[i].post.value, 'type':'create', 'id':id});
                    } else {
                        rdfvis.model.pushEvents.children.push({'name':posts[i].post.value, 'type':'push', 'id':id});
                    }
                } else {
                    rdfvis.model.tweets.children.push({'name':posts[i].post.value, 'type':'tweet', 'id':id});
                }
            };

            var w = 480,
            h = 350,
            r = Math.min(w, h) / 2;
            
            var vis = d3.select("#sunburstChart").append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

            window['vis'] = vis;
            
            var partition = d3.layout.partition()
                .sort(null)
                .size([2 * Math.PI, r * r])
                .value(function(d) { return 1 });
            
            window['partition'] = partition;

            var arc = d3.svg.arc()
                .startAngle(function(d) {  return d.x; })
                .endAngle(function(d) { return d.x + d.dx; })
                .innerRadius(function(d) { return Math.sqrt(d.y); })
                .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

            window['arc'] = arc;

            var path = vis.data([rdfvis.model.root]).selectAll("path")
                .data(partition.nodes)
                .enter().append("svg:path")
                .attr("display", function(d) { return d.depth ? null : "none" ; }) // hide inner ring
                .attr("d", arc)
                .attr("id",function(d) { 
                    return d.id
                })
                .attr("fill-rule", "evenodd")
                .attr("cursor","pointer")
                .attr("onmouseover", function(d) {
                    return "rdfvis.model.highlight('"+d.id+"','"+d.name+"')";
                })
                .attr("onmouseout", function(d) {
                    return "rdfvis.model.highlightOut('"+d.id+"','"+rdfvis.model.colors[d.type]+"')";
                })
                .attr("onclick", function(d) {
                    if(d.name === 'http://antoniogarrote.com/social/stream') {
                        return 'rdfvis.model.updateAllPosts()';
                    } else if(d.name === 'allTweets') {
                        return 'rdfvis.model.updateAllTweets()';
                    } else if(d.name === 'allGithub') {
                        return 'rdfvis.model.updateAllGithub()';
                    } else if(d.type === 'allCreateEvents') {
                        return 'rdfvis.model.updateAllCreateEvents()';
                    } else if(d.type === 'allPushEvents') {
                        return 'rdfvis.model.updateAllPushEvents()';
                    } else if(d.type === 'allPullRequestEvents') {
                        return 'rdfvis.model.updateAllPullRequestEvents()';
                    } else {
                        return 'rdfvis.model.updatePost("'+d.name+'")';
                    }
                })
                .style("stroke", "#fff")
                .style("fill", function(d) { 
                    return     rdfvis.model.colors[d.type];
                })
                .each(stash);


            // Stash the old values for transition.
            function stash(d) {
                d.x0 = d.x;
                d.dx0 = d.dx;
            }
            
            // Interpolate the arcs in data space.
            function arcTween(a) {
                var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
                return function(t) {
                    var b = i(t);
                    a.x0 = b.x;
                    a.dx0 = b.dx;
                    return arc(b);
                };
            }                    
            cb();
        });  
    };

    rdfvis.model.updateSunburst = function() {
        rdfvis.model.currentPage(rdfvis.model.currentPage()+1);

        var c = 0;
        rdfvis.model.isLoading(true);
        store.load("remote", "http://antoniogarrote.com/social/stream?page="+rdfvis.model.currentPage(), function(result,data) {
            store.execute(rdfvis.model.query(), function(success, posts) {

                for(var i=0; i<posts.length; i++) {
                    if(rdfvis.model.registry[posts[i].post.value] == null) {
                        rdfvis.model.registry[posts[i].post.value] = true;
                        var id =  posts[i].post.value.split("/");
                        id =  "_"+id[id.length-1];
                        id = id.replace(/\./g,"");

                        if(posts[i].githubEvent != null) {
                            if(posts[i].githubEvent.value === 'http://social-rdf.org/vocab/extensions/github/PullRequestEvent') {
                                rdfvis.model.pullRequestEvents.children.push({'name':posts[i].post.value, 'type':'pull', 'id':id});
                            } else if(posts[i].githubEvent.value === 'http://social-rdf.org/vocab/extensions/github/CreateEvent') {
                                rdfvis.model.createEvents.children.push({'name':posts[i].post.value, 'type':'create', 'id':id});
                            } else {
                                rdfvis.model.pushEvents.children.push({'name':posts[i].post.value, 'type':'push', 'id':id});
                            }
                        } else {
                            rdfvis.model.tweets.children.push({'name':posts[i].post.value, 'type':'tweet', 'id':id});
                        }
                    }
                };
                
                var vis = window['vis'];
                var partition = window['partition'];
                var artc = window['arc'];
                
                var path = vis.data([rdfvis.model.root]).selectAll("path")
                    .data(partition.nodes, function(d){ return d.name })
                    .attr("d", arc)
                    .enter().append("svg:path")
                    .attr("display", function(d) { return d.depth ? null : "none" ; }) // hide inner ring
                    .attr("d", arc)
                    .attr("id",function(d) { return d.id; })
                    .attr("fill-rule", "evenodd")
                    .attr("cursor","pointer")
                    .attr("onmouseover", function(d) {
                        return "rdfvis.model.highlight('"+d.id+"','"+d.name+"')";
                    })
                    .attr("onmouseout", function(d) {
                        return "rdfvis.model.highlightOut('"+d.id+"','"+rdfvis.model.colors[d.type]+"')";
                    })
                    .attr("onclick", function(d) {
                        if(d.name === 'http://antoniogarrote.com/social/stream') {
                            return 'rdfvis.model.updateAllPosts()';
                        } else if(d.name === 'allTweets') {
                            return 'rdfvis.model.updateAllTweets()';
                        } else if(d.name === 'allGithub') {
                            return 'rdfvis.model.updateAllGithub()';
                        } else if(d.type === 'allCreateEvents') {
                            return 'rdfvis.model.updateAllCreateEvents()';
                        } else if(d.type === 'allPushEvents') {
                            return 'rdfvis.model.updateAllPushEvents()';
                        } else if(d.type === 'allPullRequestEvents') {
                            return 'rdfvis.model.updateAllPullRequestEvents()';
                        } else {
                            return 'rdfvis.model.updatePost("'+d.name+'")';
                        }
                    })
                    .style("stroke", "#fff")
                    .style("fill", function(d) { 
                        //return "#000000"
                        return     rdfvis.model.colors[d.type];
                    })

                rdfvis.model.updateCalendar();
                rdfvis.model.updateAllPosts();
                rdfvis.model.isLoading(false);
            });
        });
    };

    rdfvis.model.renderCalendar = function() {
        sko.store.execute(rdfvis.model.calendarQuery, function(succ, results) {
            var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
	    format = d3.time.format("%Y-%m-%d");
            var maxNodes = 0;

            var data = {};
            for(var i=0; i<results.length; i++) {
                var date = format(format.parse(results[i].date.value.split("T")[0]));

                var datum = data[date] || {nodes:[]};
                datum['origDate'] = results[i].date.value;
                datum['id'] = "_date"+(format.parse(results[i].date.value.split("T")[0]).getTime());
                if(results[i].type.value=='http://social-rdf.org/vocab/extensions/twitter#extension') {
                    datum['hasTwitter'] = true;
                } else {
                    datum['hasGithub'] = true;
                }
                datum.nodes.push(results[i]);
                if(datum.nodes.length > maxNodes) {
                    maxNodes = datum.nodes.length;
                }
                if(datum.nodes.length == 1) {
                    datum['msg'] = datum.nodes.length+" resource on "+date;
                } else {
                    datum['msg'] = datum.nodes.length+" resources on "+date;
                }
                data[date] = datum;
            }

            rdfvis.model.datesPosts = data;

            var m = [19, 20, 20, 19], // top right bottom left margin
            w = 960 - m[1] - m[3], // width
            h = 136 - m[0] - m[2], // height
            z = 17; // cell size
            var maxYear = 1900+(format.parse(results[0].date.value.split("T")[0]).getYear());
            var minYear = 1900+(format.parse(results[results.length-1].date.value.split("T")[0]).getYear());
            if(minYear == maxYear) {
                maxYear++;
            }

     
            var color = d3.scale.quantize()
                .domain([0,maxNodes])
                .range(d3.range(9));
            
            var svg = d3.select("#chart").selectAll("svg")
                .data(d3.range(minYear,maxYear))
                .enter().append("svg:svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .attr("class", "RdYlGn")
                .append("svg:g")
                .attr("transform", "translate(" + (m[3] + (w - z * 53) / 2) + "," + (m[0] + (h - z * 7) / 2) + ")");
            
            var rect = svg.selectAll("rect.day")
                .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                .enter().append("svg:rect")
                .attr("class", "day")
                .attr("width", z)
                .attr("height", z)
                .attr("x", function(d) { return week(d) * z; })
                .attr("y", function(d) { return day(d) * z; });
            
            svg.selectAll("path.month")
                .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                .enter().append("svg:path")
                .attr("class", "month")
                .attr("d", monthPath);
            
                
            rect
                .attr("class", function(d) { 
                    if(data[format(d)] == null) {
                        return "day q" + color(data[format(d)]) + "-9"; 
                    } else {
                        return "day q" + color(data[format(d)].nodes.length) + "-9"; 
                    }
                })
                .attr("onclick", function(d) {
                    if(data[format(d)]) {
                        return "rdfvis.model.selectPostsDate('"+format(d)+"')";
                    }  else {
                        return "rdfvis.model.selectPostsDate()";                        
                    }
                })
                .attr("cursor",function(d) {
                    var node = data[format(d)];
                    if(node) {
                        return "pointer";
                    } else {
                        return "default";
                    }
                })
                .attr("onmouseover", function(d) {
                    var node = data[format(d)];
                    if(node) {
                        return "rdfvis.model.showMsg('"+node.msg+"')";
                    } else {
                        return "rdfvis.model.showMsg(null)";
                    }
                })
                .attr("onmouseout", function(d) {
                    return "rdfvis.model.showMsg('Select a resource')";
                })
                .append("svg:title")
                .text(function(d) { return (d = format(d)) + (d in data ? ": " + percent(data[d]) : ""); });
            
            function monthPath(t0) {
                var t1 = new Date(t0.getUTCFullYear(), t0.getUTCMonth() + 1, 0),
                d0 = +day(t0), w0 = +week(t0),
                d1 = +day(t1), w1 = +week(t1);
                return "M" + (w0 + 1) * z + "," + d0 * z
                    + "H" + w0 * z + "V" + 7 * z
                    + "H" + w1 * z + "V" + (d1 + 1) * z
                    + "H" + (w1 + 1) * z + "V" + 0
                    + "H" + (w0 + 1) * z + "Z";
            }        
        });
    };

    rdfvis.model.updateCalendar = function() {
        sko.store.execute(rdfvis.model.calendarQuery, function(succ, results) {
            var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d");
            var maxNodes = 0;

            var data = {};
            for(var i=0; i<results.length; i++) {
                var date = format(format.parse(results[i].date.value.split("T")[0]));

                var datum = data[date] || {nodes:[]};
                datum['origDate'] = results[i].date.value;
                datum['id'] = "_date"+(format.parse(results[i].date.value.split("T")[0]).getTime());

                if(results[i].type.value=='http://social-rdf.org/vocab/extensions/twitter#extension') {
                    datum['hasTwitter'] = true;
                } else {
                    datum['hasGithub'] = true;
                }
                datum.nodes.push(results[i]);
                if(datum.nodes.length > maxNodes) {
                    maxNodes = datum.nodes.length;
                }
                if(datum.nodes.length == 1) {
                    datum['msg'] = datum.nodes.length+" resource on "+date;
                } else {
                    datum['msg'] = datum.nodes.length+" resources on "+date;
                }
                data[date] = datum;
            }

            rdfvis.model.datesPosts = data;

            var m = [19, 20, 20, 19], // top right bottom left margin
            w = 960 - m[1] - m[3], // width
            h = 136 - m[0] - m[2], // height
            z = 17; // cell size
            var maxYear = 1900+(format.parse(results[0].date.value.split("T")[0]).getYear());
            var minYear = 1900+(format.parse(results[results.length-1].date.value.split("T")[0]).getYear());

            if(minYear == maxYear) {
                maxYear++;
            }

     
            var color = d3.scale.quantize()
                .domain([0,maxNodes])
                .range(d3.range(9));
            
            var svg = d3.select("#chart").selectAll("svg")
                .data(d3.range(minYear,maxYear))

            var rect = svg.selectAll("rect.day")
                .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                .attr("class", "day")
                .attr("width", z)
                .attr("height", z)
                .attr("x", function(d) { return week(d) * z; })
                .attr("y", function(d) { return day(d) * z; });
            
            rect
                .attr("class", function(d) { 
                    if(data[format(d)] == null) {
                        return "day q" + color(data[format(d)]) + "-9"; 
                    } else {
                        return "day q" + color(data[format(d)].nodes.length) + "-9"; 
                    }
                })
                .attr("onclick", function(d) {
                    if(data[format(d)]) {
                        return "rdfvis.model.selectPostsDate('"+format(d)+"')";
                    }  else {
                        return "rdfvis.model.selectPostsDate()";                        
                    }
                })
                .attr("cursor",function(d) {
                    var node = data[format(d)];
                    if(node) {
                        return "pointer";
                    } else {
                        return "default";
                    }
                })
                .attr("onmouseover", function(d) {
                    var node = data[format(d)];
                    if(node) {
                        return "rdfvis.model.showMsg('"+node.msg+"')";
                    } else {
                        return "rdfvis.model.showMsg(null)";
                    }
                })
                .attr("onmouseout", function(d) {
                    return "rdfvis.model.showMsg('Select a resource')";
                })
                .append("svg:title")
                .text(function(d) { return (d = format(d)) + (d in data ? ": " + percent(data[d]) : ""); });
            
            function monthPath(t0) {
                var t1 = new Date(t0.getUTCFullYear(), t0.getUTCMonth() + 1, 0),
                d0 = +day(t0), w0 = +week(t0),
                d1 = +day(t1), w1 = +week(t1);
                return "M" + (w0 + 1) * z + "," + d0 * z
                    + "H" + w0 * z + "V" + 7 * z
                    + "H" + w1 * z + "V" + (d1 + 1) * z
                    + "H" + (w1 + 1) * z + "V" + 0
                    + "H" + (w0 + 1) * z + "Z";
            }        
        });
    };

    rdfvis.model.updateAllPosts = function() {
        sko.store.execute(rdfvis.model.allPostsQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updateAllTweets = function() {
        sko.store.execute(rdfvis.model.allTweetsQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updateAllGithub = function() {
        sko.store.execute(rdfvis.model.allGithubQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updateAllCreateEvents = function() {
        sko.store.execute(rdfvis.model.allCreateEventsQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updateAllPushEvents = function() {
        sko.store.execute(rdfvis.model.allPushEventsQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updateAllPullRequestEvents = function() {
        sko.store.execute(rdfvis.model.allPullRequestEventsQuery, function(succ, res) {
            var acum = [];
            for(var i=0; i<res.length; i++) {
                acum.push("<"+res[i].post.value+">");
            }

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.updatePost = function(uri) {
        sko.store.execute(rdfvis.model.allPostsQuery, function(succ, res) {
            var acum = [];
                acum.push("<"+uri+">");

            rdfvis.model.selectedPosts(acum)
        });
    };

    rdfvis.model.selectPostsDate = function(date) {

        if(date) {
            var posts = rdfvis.model.datesPosts[date];
            var acum = [];
            for(var i=0; i<posts.nodes.length; i++) {
                acum.push("<"+posts.nodes[i].post.value+">")
            }
            rdfvis.model.selectedPosts(acum);
        }
    };

    rdfvis.model.loadFrontend = function() {
        try {
            rdfvis.frontend = new rdfstore_frontend('#frontend',sko.store);
        }catch(e) {
            logger.error("TERRIBLE ERROR");
        }
    };

    rdfvis.model.highlight = function(id, url) {
        if(url!=null) {
            rdfvis.model.overResource(url);
        }
        d3.selectAll("#"+id).transition().duration(300).style("fill","#FFDD33");
    };

    rdfvis.model.showMsg = function(msg) {
        if(msg!=null) {
            rdfvis.model.overResource(msg);
        }
    };

    rdfvis.model.highlightOut = function(id, color) {
        rdfvis.model.overResource("Select a resource");
        d3.selectAll("#"+id).transition().duration(300).style("fill",color);
    };

})();
