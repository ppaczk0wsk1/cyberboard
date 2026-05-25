FROM python:3-alpine
WORKDIR /app
COPY server.py dashboard.html manifest.json sw.js data.json.default ./
RUN cp data.json.default data.json
EXPOSE 8900
CMD ["python3", "server.py"]
