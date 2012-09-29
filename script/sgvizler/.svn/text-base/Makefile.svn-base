.PHONY:

JS_COMPILER = ~/bin/uglifyjs
XSLT = java -jar /usr/share/java/saxon.jar

JS_FILES = \
	sgvizler.js \
	lib/d3.v2.js \
	lib/raphael-dracula.pack.js

sgvizler.pack.js: \
	src/start.js \
	src/core.js \
	src/option.js \
	src/ui.js \
	src/parser.js \
	src/query.js \
	src/charts.js $(wildcard src/chart/*.js) \
	src/end.js

sgvizler.js: sgvizler.pack.js
	cp -f $< $@

lib/raphael-dracula.pack.js: lib/raphael-min.js lib/dracula.js lib/dracula_graffle.js

lib/d3:
	cd lib; git clone https://github.com/mbostock/d3

lib/d3.v2.js: lib/d3 lib/d3/.git
	make -C $< $(notdir $@)
	cp -f $</$(notdir $@) $@

%.pack.js:
	@rm -f $@
	cat $^ > $@
	@chmod a-w $@

%.min.js: %.js
	@rm -f $@
	$(JS_COMPILER) < $< > $@

EXAMPLES = $(wildcard example/ex*.html)
SCREENSHOTS = $(addprefix screenshot/, $(addsuffix .png, $(notdir $(EXAMPLES))))

example: example/examples.xml example/examples.xsl
	cd example; $(XSLT) -s:examples.xml -xsl:examples.xsl
example/%.html: example

screenshot: $(SCREENSHOTS)
screenshot/%.html.png: example/%.html
	shutter --web http://localhost/sgvizler/trunk/$< -e -n --delay=5 -o $@
##import -window root -pause 3 -density 800 screen.png


install:
	npm install

clean:
	rm -f sgvizler*.js
	rm $(EXAMPLES)
	rm $(SCREENSHOTS)

all: \
	$(JS_FILES) \
	$(JS_FILES:.js=.min.js) \
	example