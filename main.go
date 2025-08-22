package main

import (
	"fmt"
	"net/http"
)

func logging(r *http.Request) {
	fmt.Println("         URI:", r.RequestURI)
	fmt.Println("        Host:", r.Host)
	fmt.Println("        Path:", r.URL.Path)
	fmt.Println("  RemoteAddr:", r.RemoteAddr)
	fmt.Println()
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		logging(r)
		http.ServeFile(w, r, "index.html")
	})

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/robots.txt", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte(`User-agent: *
Allow: /
Sitemap: https://addgrid.org/sitemap.xml`))
	})

	http.HandleFunc("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://addgrid.org/</loc>
        <lastmod>2025-08-22</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`))
	})

	http.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/svg+xml")
		w.Write([]byte(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  
  <!-- Grid lines -->
  <g stroke="white" stroke-width="1.5" fill="none">
    <!-- Vertical lines -->
    <line x1="10" y1="8" x2="10" y2="24"/>
    <line x1="16" y1="8" x2="16" y2="24"/>
    <line x1="22" y1="8" x2="22" y2="24"/>
    
    <!-- Horizontal lines -->
    <line x1="6" y1="12" x2="26" y2="12"/>
    <line x1="6" y1="16" x2="26" y2="16"/>
    <line x1="6" y1="20" x2="26" y2="20"/>
  </g>
</svg>`))
	})

	addr := ":8080"

	fmt.Println("Listening on:", addr)

	err := http.ListenAndServe(addr, nil)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("Exiting")
}
