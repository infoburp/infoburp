<!doctype html>
<html>
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
    <script src="http://km.aifb.kit.edu/sites/spark/src/jquery.spark.js"></script>
  </head>
<script>
var chart = d3.select("body").append("div")
     .attr("class", "chart");

</script>
  <body>
    <h1>Denny's friends</h1>
    <div class="spark"
         data-spark-rdf="http://simia.net/foaf.rdf"
         data-spark-format="ul"
         data-spark-query="SELECT ?entity ?label
                           WHERE { <http://simia.net/foaf.rdf#denny> foaf:knows ?entity .
                                   ?entity foaf:name ?label }">
      loading
    </div>
  </body>
</html>
<style>
 .chart div {
   font: 10px sans-serif;
   background-color: steelblue;
   text-align: right;
   padding: 3px;
   margin: 1px;
   color: white;
 }
</style>
