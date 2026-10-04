# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import re
import json

queries = [
    ("PowerCert_CIDR", "PowerCert Animated CIDR Classless Inter-Domain Routing Explained"),
    ("PracticalNetworking_CIDR", "Practical Networking CIDR notation explained"),
    ("SunnyClassroom_CIDR", "Sunny Classroom CIDR notation and Classful vs Classless")
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for key, q in queries:
    url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(q)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]', html)
            if matches:
                vid, title = matches[0]
                print(f"[{key}] -> https://www.youtube.com/watch?v={vid} | '{title}'")
    except Exception as e:
        print(f"Error {key}: {e}")
