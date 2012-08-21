## infoburp CouchApp

infoburp is a website, with the url www.infoburp.com. 

It is useful because it allows people with no experience of the semantic web to easily understand what linked data is, and to easily look up data regarding a certain topic, without having to install new software.

By presenting a fresh view to user’s online content and relationships, I hope to create an interesting new business opportunity, both for myself and other people.

This will be useful for anyone who has a lot of information to deal with. This could be pretty much anyone nowadays, but the core market is students of any age, and professionals who must deal with a lot of information on different subjects.

In order to streamline development I have chosen two systems for the front and back end, d3.js and couchdb respectively. Both are tested and reliable open source components and have active communities keeping them up to date.

This gives a very simple end solution, having only 3 main components, d3.js on the frontend, couchdb on the backend, and infoburp.js acting as middleware glue to hold d3 and couchdb together.

infoburp is free software, and is licensed under the GNU GPL v3 license.

Clone with git:

    git clone git://github.com/couchapp/example.git
    cd example

Install with 
    
    couchapp push . http://localhost:5984/example

or (if you have security turned on)

    couchapp push . http://adminname:adminpass@localhost:5984/example
  

