"use strict"
//var SHA= require("sha1")
//import * as SHA from "sha1"

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
				ff.respondWith(new Response(text, {headers}))
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
						Location: location.origin+ prefix+ "/"+ checked
					}
				}))
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
						Location: location.origin+ prefix+ "/"+ checked // now 404!
					}
				}))
			}
			delete set[domain]
			text= null
		}
	}
}

function makeDefault(){
	var def= null
	return {
		GET: function(ff){
			if(def === null){
				return notFound(ff)
			}
			ff.respondWith(new Response(def))
		},
		HEAD: function(ff){
			if(def === null){
				return notFound(ff)
			}
			ff.respondWith(new Response())
		},
		POST: function(ff){
			ff.request.text().then(function(body){
				def= body
				ff.respondWith(new Response())
			})
		},
		DELETE: function(ff){
			def= null
			ff.respondWith(new Response())
		}
	}
}

var routes={
	"": /^\/$/,
	b: /^\/b(?:\/([\w\.]+)?)$/,
	db: /^\/db(?:\/)$/,
	r: /^\/r(?:\/([\w\.]+)?)$/,
	dr: /^\/dr(?:\/([\w\.]+)?)$/,
	l: /^\/lb$/
}

let browsing= routes.b.handler= makeSet("b")
let browsingDefault= routes.db.handler= makeDefault("db")
let register= routes.r.handler= makeSet("r")
let registerDefault= routes.dr.handler= makeDefault("dr")
let browsingAutomatic= routes.l.handler= makeDefault("lb")
routes[""].handler= {GET: browsing.GET, HEAD: browsing.HEAD}

self.addEventListener("foreignfetch", function(ff) {
	var url= ff.request.url,
	  hint= url[1] || "",
	  regex= routes[hint]
	if(!regex){
		regex= routes[url.substring(0, 2)]
	}
	if(regex){
		var ok= regex.exec(url)
		if(!ok[ff.request.method]){
			ok= false
		}
		if(ok){
			regex.handler[ff.request.method](ff, ok[1])
			return
		}
	}
	notFound(ff)
}, {passive: true})

self.addEventListener("install", function(install) {
	install.registerForeignFetch({scopes: ["/.well-known/0hub"], origins: ["https://0.eldergods.com/"]})
})
