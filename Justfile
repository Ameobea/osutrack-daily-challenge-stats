run:
  yarn run dev --port 6889

docker-build:
  docker build -t osu-dc-track:latest .

build-and-deploy:
  #!/bin/bash

  just docker-build
  docker save osu-dc-track:latest | bzip2 > /tmp/osu-dc-track.tar.bz2
  scp /tmp/osu-dc-track.tar.bz2 debian@ameo.dev:/tmp/osu-dc-track.tar.bz2
  ssh debian@ameo.dev -t "cat /tmp/osu-dc-track.tar.bz2 | bunzip2 | docker load && docker kill osutrack-daily-challenge && docker container rm osutrack-daily-challenge && docker run -d --name osutrack-daily-challenge --restart always -p 4520:4520 -e PORT=4520 osu-dc-track:latest && rm /tmp/osu-dc-track.tar.bz2" && rm /tmp/osu-dc-track.tar.bz2
