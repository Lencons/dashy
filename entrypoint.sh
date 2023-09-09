#!/bin/sh
#
# This provides a ENTRYPOINT script that allows for initial container
# setup before the main application is executed.
#
# The values from Dockerfile CMD, or provided by "docker run" will be
# provided here to execute once the container is ready.
#

# Grab all certificates mounted at /usr/local/share/ca-certificates
update-ca-certificates

##
## Execute the provided Docker Run command
##

exec "$@"