#!/bin/python

# Check if closure compiler exists in path

import os
import commands

BUILD_COMMAND='python /google-closure/closure/bin/build/closurebuilder.py --root=.--namespace="infoburp" --output_mode=compiled --compiler_jar=compiler.jar > infoburp.min.js'

if os.path.exists('compiler.jar'):
    print "Found compiler"
else:
    print " Can't find compiler trying to get it from internet"
    print commands.getoutput("wget http://closure-compiler.googlecode.com/files/compiler-latest.zip; unzip compiler-latest.zip")
if os.path.exists('compiler.jar'):
    print "Succesfully downoaded compiler.Trying to build code" 
    print commands.getoutput();
    print "Looks like we get something or not."
else:
    print "No luck try to get compiler manually"
