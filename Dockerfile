FROM python:3-alpine
WORKDIR /app
COPY server.py dashboard.html style.css app.js manifest.json sw.js data.json.default ./
COPY lib/ ./lib/
COPY components/ ./components/
RUN cp data.json.default data.json
EXPOSE 8900
CMD ["python3", "server.py"]
