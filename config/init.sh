#!/bin/bash
apt-get update > /dev/null
apt-get install nginx -y > /dev/null

echo "nginx Config files"
rm -rf /etc/nginx/sites-available/default
rm -rf /etc/nginx/sites-enabled/default
ln -s /var/www/config/nginx_vhost /etc/nginx/sites-enabled/

service nginx restart