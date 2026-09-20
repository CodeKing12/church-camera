# Church Camera

A web app that turns an iPhone into a locked-off camera for a church livestream,
and sends the picture to a laptop running [MediaMTX](https://github.com/bluenviron/mediamtx).

Add it to the home screen and it runs full screen with no browser chrome, which
matters because the alternative — screen mirroring a normal camera app — puts
that app's buttons and Safari's address bar into the broadcast.

**Send (WebRTC/WHIP)** — the camera track goes straight to MediaMTX. One encode,
full 1080p, nothing cropped. H.264 is requested explicitly so the server can pass
it to RTSP without re-encoding. Reconnects on its own if the link drops.

**Mirror (AirPlay)** — kept as a fallback for when the certificate cannot be
set up. Every control sits in the black bars either side of a true 16:9 box, and
the app draws crop guides so those bars can be cropped away at the other end.

Also: lens choice, zoom and focus/exposure/white-balance lock where iOS exposes
them, a screen wake lock, and a tap-lock so a stray touch cannot change the shot
mid-service.

## Why the certificate

Safari only gives a page the camera over https, and an https page may not talk to
a plain http server — so MediaMTX has to serve https too, with a certificate the
phone trusts. A cross-origin request to an untrusted server fails silently, with
no way to click through. `cert.html` walks through installing it.

`church-camera-ca.crt` here is the public half of one church's local authority.
It is useless to anyone else; generate your own with the script in the wider
setup rather than trusting this one.

## The receiving end

The Windows side — MediaMTX, certificates, the low-latency WHEP player for a
Streamlabs Browser Source, and a status window for whoever runs the service —
is packaged as a release: **[church-laptop.zip](../../releases/latest)**.
Instructions at [laptop.html](https://codeking12.github.io/church-camera/laptop.html).

It contains no private keys. The certificate authority's private half never
leaves the machine that generated it.

## Running it yourself

Host these files anywhere with https, then point the app at your own MediaMTX:

```yaml
webrtc: yes
webrtcAddress: :8889
webrtcEncryption: yes
webrtcServerCert: server.crt
webrtcServerKey: server.key
webrtcAllowOrigins: ["*"]
webrtcICEServers2: []
```

The app publishes to `https://<host>:8889/cam/whip`.

No build step, no dependencies, one HTML file. Bump `CACHE` in `sw.js` after any
change or phones will keep serving the cached copy.
