self.addEventListener("install", function(install) {
	install.registerForeignFetch({scopes: ["/.well-known/0hub"], origins: ["https://0.eldergods.com/"]})
})

self.addEventListener("foreignfetch", function(ff) {
	// Do whatever local work is necessary to handle the fetch,
	// or just pass it through to the network:
	ff.respondWith(fetch(ff.request).then(response => ({response: response}))
})
