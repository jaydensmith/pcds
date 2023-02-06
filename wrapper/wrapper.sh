#! /bin/sh

exec $SNAP/electron-pcds/pcds \
	--enable-features=UseOzonePlatform \
	--ozone-platform=wayland \
	--disable-dev-shm-usage \
	--no-sandbox
