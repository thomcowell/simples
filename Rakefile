# Basic Rakefile for building Simple 
files = File.new('filelist.txt').read.gsub(/\n/, "").split(',')

date = `git log -1 | grep Date: | sed 's/[^:]*: *//'`.gsub(/\n/, "")
version = `cat version.txt`.gsub(/\n/, "")
current_year = Time.now.year.to_s

task :default => :simples

task :clean do
  sh "rm -rf dist"
  sh "mkdir -p dist"
  
end

task :init do
	sh "if test ! -d test/qunit; then git clone git://github.com/jquery/qunit.git test/qunit; fi"
	sh "cd test/qunit && git pull origin master &> /dev/null"
end

task :simples => [:clean, :init] do

	sh "cat " + files.map {|file| "src/" + file }.join(" ") +
		" | sed 's/Date:./&" + date + "/'" +
		" | sed s/@CURRENT_YEAR/" + current_year + "/" +
		" | sed s/@VERSION/" + version + "/ > dist/simples.js"
end

task :lint => [:simples] do
  sh "java -jar build/js.jar build/jslint-check.js"
end
