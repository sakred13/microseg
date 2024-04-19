FROM alpine:3.18 

RUN apk update && apk add --no-cache python3 py3-pip && pip install Flask requests

WORKDIR /app/controller

COPY * .

EXPOSE 5050

CMD ["sleep", "3600"]
