# Tegania Solutions — website

Studio website for Tegania Solutions (web/graphic design & development). Plain HTML, CSS and JavaScript, no build step.

## Files

- `index.html` — page content
- `styles.css` — design and layout
- `script.js` — interactions and the contact form
- `assets/` — favicon and images

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Then open http://localhost:8080 (or `http://<your-mac's-IP>:8080` from a phone on the same Wi-Fi).

## Contact form

Enquiries are delivered by [FormSubmit](https://formsubmit.co) to nasser@tegania.com. To hide the address in the form endpoint, set `FORM_ID` in `script.js` to the alias from FormSubmit's activation email.

After editing `styles.css` or `script.js`, bump the `?v=` number on their tags in `index.html` so browsers load the new version.
