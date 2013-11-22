if [ "$(whoami)" != "root" ]; then
    echo Please run this script as root or using sudo
    exit
fi

clear
echo Installing dependencies...
sudo apt-get -yf install openjdk-7-jdk
sudo apt-get -yf install git
sudo apt-get -yf install ant
sudo apt-get -yf install maven
sudo apt-get -yf install g++
sudo apt-get -yf update

clear
#echo Installing NodeJS...
wget http://nodejs.org/dist/v0.10.21/node-v0.10.21-linux-x64.tar.gz
tar -zxvf node-v0.10.21-linux-x64.tar.gz
rm node-v0.10.21-linux-x64.tar.gz
rename 's/(node)\-v(.*)\-linux-x64/$1js-$2/' node-v*
sudo mv node-* /opt

if [ ! -f /opt/nodejs ]; then
  sudo ln -s /opt/nodejs* /opt/nodejs
fi

if [ ! -f /usr/bin/node ]; then
  sudo ln -s /opt/nodejs/bin/node /usr/bin/node
fi

if [ ! -f /usr/bin/npm ]; then
  sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
fi

clear
echo Creating Projects directory...
cd ~/
mkdir Projects
cd Projects

echo Cloning Git repositories...
git clone https://github.com/orientechnologies/orientdb.git
git clone https://github.com/cytoscape/NDEx-Site
git clone https://github.com/cytoscape/ndex-java
chown -R $SUDO_USER ~/Projects

clear
echo Building OrientDB...
cd ~/Projects/orientdb
mkdir graphdb/target/databases
git checkout hotfix-1.6.1
ant clean installg

clear
echo Building ndex-java...
cd ~/Projects/ndex-java
mvn clean package
unzip target/ndexbio-rest-*-distribution.zip -d ~/Projects/releases/orientdb*

clear
echo Deploying OrientDB...
cd ~/Projects/releases
rename 's/(.*)\-community\-(.*)\-SNAPSHOT/$1-$2/' orientdb*
sudo mv orientdb* /opt

if [ ! -f /opt/orientdb ]; then
  sudo ln -s /opt/orientdb* /opt/orientdb
fi

clear
echo Creating orientdb user/group...
sudo useradd -d /opt/orientdb -Mrs /bin/false -U orientdb
sudo chown -R orientdb:orientdb orientdb*
sudo chmod 775 orientdb/bin
sudo chmod g+x orientdb/bin/*.sh

echo Adding your account to orientdb group...
sudo usermod -a -G orientdb "$(id -u -n)"

echo Open /opt/orientdb/config/orientdb-server-config.xml
echo Create a new user: <user resources="*" name="admin" password="admin" />
echo Save the file
echo Open a new terminal window and execute: sudo /opt/orientdb/bin/server.sh
echo In another terminal window execute: /opt/orientdb/bin/console.sh
echo > connect remote:localhost admin admin
echo > create database remote:localhost/ndex admin admin plocal graph
echo Press {ENTER} when this is done
read continueScript

clear
echo Configuring NDEx-Site...
cd ~/Projects/NDEx-Site
npm install
sudo npm install -g mocha
git checkout develop
cd generate
node generate_rest.js

clear
echo In another terminal execute: node ~/Projects/NDEx-Site/rest.js
echo Press {ENTER} when this is done
read continueScript

cd ../test_db
node build_test_db.js