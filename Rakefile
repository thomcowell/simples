# Basic Rakefile for building Simple 
files = File.new('filelist.txt').read.gsub(/\n/, "").split(',')

date = `git log -1 | grep Date: | sed 's/[^:]*: *//'`.gsub(/\n/, "")
version = `cat version.txt`.gsub(/\n/, "")
current_year = Time.now.year.to_s

task :default => :jquery

task :init do
	sh "if test ! -d test/qunit; then git clone git://github.com/jquery/qunit.git test/qunit; fi"
	sh "cd test/qunit && git pull origin master &> /dev/null"
end

task :jquery => [:init] do
	sh "mkdir -p dist"

	sh "cat " + files.map {|file| "src/" + file + ".js"}.join(" ") +
		" | sed 's/Date:./&" + date + "/'" +
		" | sed s/@CURRENT_YEAR/" + current_year + "/" +
		" | sed s/@VERSION/" + version + "/ > dist/simples.js"
end
