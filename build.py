import json
import os
import datetime

with open("package.json", "r") as f:
	data = json.load(f)

prevVersion = data["version"]

prevYear = int(prevVersion[0:2])
prevWeek = int(prevVersion[3:5])
prevCount = prevVersion[-1]

year, week, weekday = datetime.date.today().isocalendar()
year %= 100

if year == prevYear and week == prevWeek:
	count = chr(ord(prevCount) + 1)
else:
	count = "a"

version = f"{year}w{str(week).zfill(2)}{count}"

data["version"] = version

print(f"Version modified: {prevVersion} -> {version}")

with open("package.json", "w") as f:
	f.write(json.dumps(data, indent=2))

with open("index.html", "r") as f:
	html = f.read()
	html = html.replace(prevVersion, version)

with open("index.html", "w") as f:
	f.write(html)

os.system("npm run package")
