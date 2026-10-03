# A fake Google Text-to-Speech server that misbehaves on purpose.
import base64, io, json, math, struct, sys, threading, time, wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
LOG = []; LOCK = threading.Lock(); N = [0]
def wav(text, raw=False):
    sr = 24000; n = int(sr * (0.3 + 0.03 * len(text)))
    QUIET = ("ALWAYSSILENT" in text) or (text == "silentword")     # Google's glitch: near-silence
    amp = 120 if QUIET else 8000
    fade = 0 if "CUTOFF" in text else int(sr * 0.6)        # real speech fades out; CUTOFF = Google's clipped clip
    env = lambda i: min(1.0, (n - i) / fade) if fade else 1.0
    pcm = b"".join(struct.pack("<h", int(amp * env(i) * math.sin(i * 0.06))) for i in range(n))
    if raw: return pcm
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm); w.close(); return b.getvalue()
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, obj, headers={}):
        body = json.dumps(obj).encode(); self.send_response(code)
        for k, v in headers.items(): self.send_header(k, v)
        self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_POST(self):
        data = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        key = self.headers.get("X-Goog-Api-Key", "") or (INJECT if INJECT else "")
        if not key: return self.send(403, {"error": {"code": 403, "status": "PERMISSION_DENIED", "message": "Method doesn't allow unregistered callers (callers without established identity). Please use API Key or other form of API consumer identity to call this API."}})
        with LOCK:
            N[0] += 1; n = N[0]; LOG.append({"t": time.time(), "path": self.path, "key_in_url": "key=" in self.path, "voice": data["voice"]["name"], "text": data["input"]["text"], "cp": data["input"].get("customPronunciations")})
        if key == "bad": return self.send(403, {"error": {"code": 403, "status": "PERMISSION_DENIED", "message": "API key not valid."}})
        if not data["voice"]["name"].endswith("-Chirp3-HD-Aoede"): return self.send(400, {"error": {"status": "INVALID_ARGUMENT", "message": "bad voice"}})
        if "BADTEXT" in data["input"]["text"]: return self.send(400, {"error": {"status": "INVALID_ARGUMENT", "message": "text refused"}})
        if "ALWAYSSILENT" in data["input"]["text"] or data["input"]["text"] == "silentword": return self.send(200, {"audioContent": base64.b64encode(wav(data["input"]["text"])).decode()})
        if n % 9 == 0: return self.send(429, {"error": {"status": "RESOURCE_EXHAUSTED", "message": "slow down"}}, {"Retry-After": "1"})
        if n % 13 == 0: return self.send(503, {"error": {"status": "UNAVAILABLE", "message": "try later"}})
        self.send(200, {"audioContent": base64.b64encode(wav(data["input"]["text"], raw=(n % 5 == 0))).decode()})
    def do_GET(self):
        if self.path.startswith("/v1/voices"):
            key = self.headers.get("X-Goog-Api-Key", "") or (INJECT if INJECT else "")
            with LOCK: LOG.append({"t": time.time(), "path": self.path, "key_in_url": "key=" in self.path, "voice": "-", "text": ""})
            if not key: return self.send(403, {"error": {"status": "PERMISSION_DENIED", "message": "Method doesn't allow unregistered callers (callers without established identity)."}})
            if key == "bad": return self.send(403, {"error": {"status": "PERMISSION_DENIED", "message": "API key not valid."}})
            loc = self.path.split("languageCode=")[1]
            return self.send(200, {"voices": [{"name": f"{loc}-Chirp3-HD-{v}"} for v in ("Aoede", "Kore", "Puck")] + [{"name": f"{loc}-Neural2-A"}]})
        with LOCK: self.send(200, {"requests": LOG})
INJECT = sys.argv[2] if len(sys.argv) > 2 else ""   # simulate the environment adding the key
srv = ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1])), H); srv.serve_forever()
