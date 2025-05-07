# Under10math
Math revision for students under 10 years old.

A fun game for students to revise and practice arithmetic.

It is a portable solution that will work on 🐧 Linux, ❖ Windows,  Mac, or 🍓 Raspberry Pi

## Requirements

You will need Python 3.13+ with the following packages:-

* asyncio
* brotli
* cryptography
* gzip
* hypercorn
* psutil
* starlette

Other versions of python _may_ work but you're on your own if things go wrong. The easiest way to install python3.13 is with [HomeBrew](https://brew.sh):

    brew install python@3.13 sass

Then install the mising packages as follows:-

    python3.13 -m ensurepip --upgrade

    pip3.13 install \
      --break-system-packages \
      asyncio brotli cryptography gzip \
      hypercorn psutil starlette

NB. If you're on a work or school computer, use `--user` instead of `--break-system-packages`

### SSL Certificates

You will need some of these as the ones in the repo are probably expired by the time you clone them. There are plenty of guides on the web on this, but this is my recipe:

    openssl req -x509 \
      -newkey rsa:4096 \
      -keyout SSL/privkey.pem \
      -out SSL/cert.pem \
      -sha256 \
      -days 3650 \
      -nodes \
      -subj "/C=UK/ST=Surrey/L=Guildford/O=TruDojo/OU=Education/CN=localhost.truter.world"

Afterwards you will need to tell your computer or your browser to trust this self-signed certificate. Ask [Grok](https://grok.com) if you don't know how to do this.

# Hosting the site locally

Open a terminal window or command prompt and navigate to the folder where you cloned this repository.

On Mac and Linux you can:-

    ./host

On other platforms:-

    python3.13 host

## Seeing the local site

Open a browser and navigate to [https://localhost.truter.world:4443](https://localhost.truter.world:4443) but be sure to use your own domain name if you created your self-signed SSL certificate with a different "CN" part than shown [above](#ssl-certificates). The important bits are the protocol (https) and the port (4443). You can change the port number inside the [host](./host) script.

## PWA - Progressive Web App

This site has a [manifest](./manifest.json) which tells the browser that it can be saved as a self-contained web app for offline use.

Look in your browser for the option to "Save to Desktop" or "Add to Dock" or "Add to Home Screen" and pretty soon you will have a new app on your system. Lightweight, responsive and offline.

# Contributing

If you stumble across a bug or usability issue or have a new feature suggestion, add it to the repository on GitHub. If you have a fix, create a new branch, commit & push your fix to that branch, then create a Pull Request and link to the issue you filed before hand which describes the bug/feature you're fixing/implementing.
