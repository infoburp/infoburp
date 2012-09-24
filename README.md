## infoburp

infoburp is a HTML5 semantic web browser.

It is useful because it allows people with no experience of the semantic web to easily understand what linked data is, and to easily look up data regarding a certain topic, without having to install new software.

This will be useful for anyone who has a lot of information to deal with. This could be pretty much anyone nowadays, but the core market is students of any age, and professionals who must deal with a lot of information on different subjects.

In order to streamline development I have chosen two systems for the front and back end, d3.js and couchdb respectively. Both are tested and reliable open source components and have active communities keeping them up to date, and infoburp is a couchapp, which makes it very easy to deploy, and means it can be run locally, and is highly scalable.

This gives a very simple end solution, having only 3 main components, d3.js on the frontend, couchdb on the backend, and infoburp.js acting as middleware glue to hold d3 and couchdb together.

The interface is designed using K.I.S.S principles and the unix philosophy, with the intention of producing an end product that is both easy to use, and a sturdy piece of software.

Start infoburp, for new developers (initially not connected to couchdb for simplicity)

Prerequesites -

git,
python

To set up a simple HTTP server on your computer, allowing you to develop infoburp frontend code locally, first install the prerequesites, then issue the following commands:

cd ~/

git clone https://github.com/infoburp/infoburp.git

cd infoburp/

python -m SimpleHTTPServer

Then browse to :

http://localhost:8000

infoburp is free software, and is licensed under the GNU GPL v3 license, because all software should be free.



