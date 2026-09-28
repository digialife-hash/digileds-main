#!/bin/sh
cd /www/digileds-main/Backend || exit 1
exec sg docker -c 'exec npm run start'
