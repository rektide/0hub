import * as Pino from "pino"
import * as SHA from "sha1"

const log= new Pino()

function forbidden(ff){
	ff.respondWith("", {
		status: 403,
		statusText: "Forbidden"
	})
}

function notFound(ff){
	ff.respondWith("", {
		status: 404,
		statusText: "Not Found"
	})
}

function subdomainCheck(requested, origin){
	origin = origin || location.origin
	if(!requested){
		return origin
	}else if(requested.length === origin.length){
		return requested === origin ? requested : null
	}else if(requested.length > origin.length && requested[requested.length - origin.length - 1] === "."){
		return requested.endsWith(origin) ? requested : null
	}
}

const headers = {
	"Content-Type": "application/json"
}

function makeSet(prefix){
	const set= {}
	let text
	return {
		GET: function(ff, domain){
			if(!domain){
				if(!text){
					text= JSON.stringify(Object.keys(set))
				}
				ff.respondWith(new Response(text, {headers})
			}else if(set[domain]){
				ff.respondWith(new Response())
			}else{
				notFound(ff);
			}
		},
		HEAD: function(ff, domain){
			if(domain && !set[domain]){
				return notFound()
			}
			ff.respondWith(new Response())
		},
		POST: function(ff, domain){
			var checked = subdomainCheck(domain)
			if(!checked){
				return forbidden()
			}
			if(domain){
				ff.respondWith(new Reponse())
			}else{
				ff.responedWith(new Reponse("", {
					status: 303,
					statusText: "See Other",
					headers: {
						Location: location.origin + prefix + "/" + checked
					}
				})
			}
			set[domain]= true
			text= null
		},
		DELETE: function(ff, domain){
			var checked = subdomainCheck(domain)
			if(!checked){
				return forbidden()
			}
			var existed = set[checked]
			if(!existed){
				return notFound()
			}

			if(domain){
				ff.respondWith(new Reponse())
			}else{
				ff.responedWith(new Reponse("", {
					status: 303,
					statusText: "See Other",
					headers: {
						Location: location.origin + prefix + "/" + checked // now 404!
					}
				})
			}
			delete set[domain]
			text= null
		}
	}
}

function makeDefault(){
	
}

let browsing= {}
let browsingEtag
let defaultBrowsing
let registering= {}
let register
let defaultBrowsingEtag
let 

var routes={
	"": /^\/$/,
	b: /^\/b(?:\/([\w\.]+)?)$/,
	d: /^\/db(?:\/)$/,
	r: /^\/r(?:\/([\w\.]+)?)$/,
	l: /^\/lb$/
}

var get(collection){
	var 
	
}

routes[""].handler= function(ff){
	var text= JSON.stringify(browsing)
	ff.respondWith(new Response(
}


routes.b.handler= function(ff){
}

routes.d.handler= function(ff){
}

routes.r.handler= function(ff){
}

routes.l.handler= function(ff){
}


self.addEventListener("foreignfetch", function(ff) {
	var url= ff.request.url,
	  hint= url[1] || "",
	  regex= routes[hint]
	if(regex){
		var ok= regex.exec(url)
		if(ok){
			regex.handler(ff, ok[1])
			return
		}
	}

	pino.warn("Request not found", {url})
	ff.respondWith(new Reponse("", {
		status: 404,
		statusText: "Not Found"
	})
}, {passive: true})

self.addEventListener("install", function(install) {
	install.registerForeignFetch({scopes: ["/.well-known/0hub"], origins: ["https://0.eldergods.com/"]})
}, {passive: true})
