//graph command line + some subset of *nix program functionality made into atomic js nodes (little graph connected state machines)
//copyright Graeme Wolfendale 2012 (GPLv3)
var graph(contextnode)=selected node; //which node did I command?

fetch (URI) {return whatever is at that URI}

find(requeststring){return URIs of possible matches}

ls(name){return matching URIs connected to graph(contextnode)}

put (URI,data) {put data >> URI; if success = true return true else return false}

do (URI){var funct = fetch(URI); do/run funct return result; put (URIr,result);return URIr to result}

collect (URI) {//I may need this node soon, do you know where it is? Can you save a copy ready for when I ask?}

share (URI,duration) {//I have a node others want, so I set up a (nodejs.org?)JS(socket.io?) webserver and allow them to fetch(it) from my machine a set number of times}

probe (URI) {return URI(metadata) //what is known or opined about the node at URI?}

opine (URI,value) {//state an opinion about the usefulness or validity of a node true (good/like/+1) or false (bad/dislike/-1) //if no value is stated, ask around, is this a respected node? return the node's whuffie (social/usefulness capital or the node's "idea weight" how important do programs collectively judge the node to be?)}

ask (data) {//input some data, and get a similar/related answer back}

//webOOP
| //unix pipes are infoburp graph links



