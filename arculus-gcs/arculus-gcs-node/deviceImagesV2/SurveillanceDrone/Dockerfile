FROM alpine:3.18 

RUN apk update && apk add --no-cache python3 py3-pip && pip install Flask && pip install Flask requests cryptography

WORKDIR /app/surveillance-drone

COPY * .

EXPOSE 3050

CMD ["python3", "surveillanceDrone.py"]
