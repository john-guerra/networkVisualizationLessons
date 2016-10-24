graph = require("./data/ieeevisNetwork.json");
netClustering = require("./js/netClustering.js");
var jsonfile = require('jsonfile')

var dictNodes = {};

graph.nodes.forEach(function (d) {
	dictNodes[d.id] = d;
});

var links = graph.links.map(function (d) {
	return {source:dictNodes[d.source], target:dictNodes[d.target]};
});

netClustering.cluster(graph.nodes, links);
// graph.links = links;

var file = 'ieeevisNetworkClustered.json'
jsonfile.writeFile(file, graph, function (err) {
  console.error(err)
})