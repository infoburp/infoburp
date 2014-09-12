#!/bin/bash
add-apt-repository ppa:chris-lea/node.js
add-apt-repository ppa:webupd8team/java
wget -O - http://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
echo "deb http://debian.neo4j.org/repo stable/" > /etc/apt/sources.list.d/neo4j.list
apt-get update
apt-get install oracle-java7-installer
apt-get install oracle-java7-set-default
apt-get install neo4j
apt-get install nodejs
apt-get install npm
sed -i.bak ‘s/#org.neo4j.server.webserver.address=0.0.0.0/org.neo4j.server.webserver.address=0.0.0.0/g’ /etc/neo4j/neo4j-server.properties
neo4j start
nodejs server.js
