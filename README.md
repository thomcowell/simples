[simples](http://simples.eightsquarestudio.com/) - Simple Javascript Handler
================================

What you need to build your own Simples
---------------------------------------
* Make sure that you have Java installed (if you want to build a minified version of Simples).
If not, go to this page and download "Java Runtime Environment (JRE) 6.0"  
[http://java.sun.com/javase/downloads/index.jsp](http://java.sun.com/javase/downloads/index.jsp)

* You can run a basic rake task to build an non-minified version of simples
* The other option is if you have Ant installed (or are on Windows and don't have access to make). You can download Ant from here: [http://ant.apache.org/bindownload.cgi](http://ant.apache.org/bindownload.cgi)
If you do have Ant, everytime (in this README) that I say 'make', do 'ant' instead - it works identically (for all intents and purposes).

How to build your own Simples
-----------------------------

In the main directory of the distribution (the one that this file is in), type
the following to make all versions of Simples:

`ant`

Here are each of the individual items that are buildable from the Makefile.

`ant init`

Pull in all the external dependencies (QUnit) for the project.

`ant simples`

The standard, uncompressed, Simples code.  
Makes: ./dist/simples.js

`ant min`

A compressed version of Simples (made the Closure Compiler).  
Makes: ./dist/simples.min.js

Finally, you can remove all the built files using the command:
  
`ant clean`

Additionally, if you want to install Simples to a location that is not this
directory, you can specify the PREFIX directory, for example:
  
`ant PREFIX=/home/john/test/`

OR

`ant PREFIX=~/www/ docs`

If you have any questions, please feel free to ask them on the Simples
mailing list.
